import { KANO_PLACES } from "./kano-places";
import { inKanoState, KANO_BOUNDS, MAP_ORIGIN } from "./seed";

export type GeoHit = {
  label: string;
  lat: number;
  lng: number;
  source?: "kano" | "photon" | "partner";
};

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    osm_value?: string;
  };
};

function labelOf(properties: PhotonFeature["properties"]) {
  if (!properties) return "Pinned location";
  const street = [properties.housenumber, properties.street].filter(Boolean).join(" ");
  const parts = [street || properties.name, properties.district, properties.city, properties.state].filter(
    Boolean,
  );
  return parts.join(", ") || properties.name || "Pinned location";
}

function score(query: string, label: string) {
  const q = query.trim().toLowerCase();
  const t = label.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;
  const tokens = q.split(/\s+/).filter(Boolean);
  const hits = tokens.filter((tok) => t.includes(tok)).length;
  return hits ? (hits / tokens.length) * 40 : 0;
}

function searchGazetteer(query: string): GeoHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const ranked: { hit: GeoHit; s: number }[] = [];
  for (const place of KANO_PLACES) {
    const hay = `${place.name} ${place.aliases.join(" ")} ${place.area}`.toLowerCase();
    const s = Math.max(score(q, place.name), score(q, hay), ...place.aliases.map((a) => score(q, a)));
    if (s < 20) continue;
    ranked.push({
      s,
      hit: {
        label: `${place.name}, ${place.area}`,
        lat: place.lat,
        lng: place.lng,
        source: "kano",
      },
    });
  }
  return ranked.sort((a, b) => b.s - a.s).slice(0, 8).map((row) => row.hit);
}

async function photonSearch(q: string): Promise<GeoHit[]> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "8");
  url.searchParams.set("lang", "en");
  url.searchParams.set("lat", String(MAP_ORIGIN.lat));
  url.searchParams.set("lon", String(MAP_ORIGIN.lng));
  url.searchParams.set(
    "bbox",
    `${KANO_BOUNDS.west},${KANO_BOUNDS.south},${KANO_BOUNDS.east},${KANO_BOUNDS.north}`,
  );
  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Place search failed");
  const data = (await res.json()) as { features?: PhotonFeature[] };
  const hits: GeoHit[] = [];
  for (const feature of data.features ?? []) {
    const coords = feature.geometry?.coordinates;
    if (!coords) continue;
    const [lng, lat] = coords;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    if (!inKanoState(lat, lng)) continue;
    hits.push({ lat, lng, label: labelOf(feature.properties), source: "photon" });
  }
  return hits;
}

function dedupe(hits: GeoHit[]) {
  const seen = new Set<string>();
  const out: GeoHit[] = [];
  for (const hit of hits) {
    const key = `${hit.label.toLowerCase()}|${hit.lat.toFixed(3)}|${hit.lng.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(hit);
  }
  return out;
}

export async function searchPlaces(query: string): Promise<GeoHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const local = searchGazetteer(q);
  let remote: GeoHit[] = [];
  try {
    remote = await photonSearch(q);
    if (!remote.length && !/kano/i.test(q)) {
      remote = await photonSearch(`${q}, Kano, Nigeria`);
    }
  } catch {
    remote = [];
  }
  return dedupe([...local, ...remote]).slice(0, 8);
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  if (!inKanoState(lat, lng)) return null;
  try {
    const url = new URL("https://photon.komoot.io/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("lang", "en");
    const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = (await res.json()) as { features?: PhotonFeature[] };
    const feature = data.features?.[0];
    if (!feature) return null;
    return labelOf(feature.properties);
  } catch {
    return null;
  }
}
