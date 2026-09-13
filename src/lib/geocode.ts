import { inKanoState, KANO_BOUNDS, MAP_ORIGIN } from "./seed";

export type GeoHit = {
  label: string;
  lat: number;
  lng: number;
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
  return (data.features ?? [])
    .map((feature) => {
      const coords = feature.geometry?.coordinates;
      if (!coords) return null;
      const [lng, lat] = coords;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      if (!inKanoState(lat, lng)) return null;
      return { lat, lng, label: labelOf(feature.properties) };
    })
    .filter((hit): hit is GeoHit => hit != null);
}

export async function searchPlaces(query: string): Promise<GeoHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const hits = await photonSearch(q);
  if (hits.length) return hits.slice(0, 5);
  if (/kano/i.test(q)) return [];
  return (await photonSearch(`${q}, Kano, Nigeria`)).slice(0, 5);
}
