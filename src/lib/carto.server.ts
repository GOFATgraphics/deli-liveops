import { readFileSync } from "node:fs";

function fromDotenvLocal() {
  try {
    const text = readFileSync(new URL("../../.env.local", import.meta.url), "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const name = trimmed.slice(0, eq);
      const value = trimmed.slice(eq + 1).trim();
      if (name === "CARTO_API_KEY" || name === "VITE_CARTO_API_KEY") return value;
    }
  } catch {
    return "";
  }
  return "";
}

/** Server-only. Never import this from a client module. */
export function cartoApiKey() {
  const value =
    process.env.CARTO_API_KEY || process.env.VITE_CARTO_API_KEY || fromDotenvLocal() || "";
  return value.trim();
}

export function voyagerTileUpstream(z: number, x: number, y: number, key = cartoApiKey()) {
  const url = `https://a.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`;
  return key ? `${url}?key=${encodeURIComponent(key)}` : url;
}

export function esriStreetTileUpstream(z: number, x: number, y: number) {
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}`;
}

type TileProvider = "carto" | "esri";

const globalRef = globalThis as typeof globalThis & {
  __cartoProbe__?: Promise<{ provider: TileProvider; valid: boolean }>;
};

async function buffersDiffer(a: ArrayBuffer, b: ArrayBuffer) {
  if (a.byteLength !== b.byteLength) return true;
  const av = new Uint8Array(a);
  const bv = new Uint8Array(b);
  for (let i = 0; i < av.length; i++) if (av[i] !== bv[i]) return true;
  return false;
}

/**
 * CARTO Builder tokens / org keys do not unlock rastertiles.cartocdn.com.
 * A real basemaps key from dashboard.basemaps.carto.com changes the PNG;
 * anything else returns the same "API KEY REQUIRED" watermark as no key.
 */
export function probeCartoBasemap() {
  globalRef.__cartoProbe__ ??= (async () => {
    const key = cartoApiKey();
    if (!key) return { provider: "esri" as const, valid: false };
    const z = 2;
    const x = 2;
    const y = 1;
    const headers = { "User-Agent": "DeliLiveOps/1.0", "Cache-Control": "no-cache" };
    const [unsigned, signed] = await Promise.all([
      fetch(voyagerTileUpstream(z, x, y, ""), { headers, signal: AbortSignal.timeout(8000) }),
      fetch(voyagerTileUpstream(z, x, y, key), { headers, signal: AbortSignal.timeout(8000) }),
    ]);
    if (!signed.ok) return { provider: "esri" as const, valid: false };
    const [a, b] = await Promise.all([unsigned.arrayBuffer(), signed.arrayBuffer()]);
    const valid = unsigned.ok && (await buffersDiffer(a, b));
    return { provider: valid ? ("carto" as const) : ("esri" as const), valid };
  })().catch(() => {
    globalRef.__cartoProbe__ = undefined;
    return { provider: "esri" as const, valid: false };
  });
  return globalRef.__cartoProbe__;
}

const CARTO_SQL = "https://gcp-us-east1.api.carto.com/v3/sql/carto_dw/query";

function bqString(value: string) {
  return "'" + value.replace(/'/g, "''") + "'";
}

export async function cartoSql(q: string) {
  const key = cartoApiKey();
  if (!key) return;
  const res = await fetch(CARTO_SQL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CARTO SQL ${res.status}: ${text.slice(0, 240)}`);
  }
}

type CartoFleet = {
  id: string;
  name: string;
  address: string;
  status: string;
  radiusKm: number;
  vehicles: string[];
  lat: number;
  lng: number;
};

/** Replace Builder sources shared.deli_fleets and shared.deli_coverage. */
export async function publishFleetsToCarto(fleets: CartoFleet[]) {
  const values = fleets.map((f) => {
    const veh = bqString(f.vehicles.join(","));
    return `(${bqString(f.id)}, ${bqString(f.name)}, ${bqString(f.address)}, ${bqString(f.status)}, ${Number(f.radiusKm)}, ${veh}, ${Number(f.lat)}, ${Number(f.lng)}, ST_GEOGPOINT(${Number(f.lng)}, ${Number(f.lat)}))`;
  });
  await cartoSql(`
    CREATE TABLE IF NOT EXISTS \`shared.deli_fleets\` (
      id STRING, name STRING, address STRING, status STRING,
      radius_km INT64, vehicles STRING, lat FLOAT64, lng FLOAT64, geom GEOGRAPHY
    )
  `);
  await cartoSql("TRUNCATE TABLE `shared.deli_fleets`");
  if (values.length) {
    await cartoSql(
      `INSERT INTO \`shared.deli_fleets\` (id, name, address, status, radius_km, vehicles, lat, lng, geom) VALUES ${values.join(",")}`,
    );
  }
  await cartoSql(`
    CREATE OR REPLACE TABLE \`shared.deli_coverage\` AS
    SELECT id, name, status, radius_km, ST_BUFFER(geom, radius_km * 1000) AS geom
    FROM \`shared.deli_fleets\`
  `);
}
