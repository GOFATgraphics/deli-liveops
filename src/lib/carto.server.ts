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

export function voyagerTileUpstream(z: number, x: number, y: number) {
  const key = cartoApiKey();
  const url = `https://a.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`;
  return key ? `${url}?key=${encodeURIComponent(key)}` : url;
}

export function esriStreetTileUpstream(z: number, x: number, y: number) {
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}`;
}
