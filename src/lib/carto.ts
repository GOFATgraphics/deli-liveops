import { create } from "zustand";

const STORAGE = "deli.carto.apiKey";

export const CARTO_KEY_URL = "https://carto.com/basemaps/apikey";
export const CARTO_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>';

export const VOYAGER_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

function envKey() {
  const value = import.meta.env.VITE_CARTO_API_KEY;
  return typeof value === "string" ? value.trim() : "";
}

function readStoredKey() {
  if (typeof window === "undefined") return envKey();
  try {
    return localStorage.getItem(STORAGE)?.trim() || envKey();
  } catch {
    return envKey();
  }
}

export function currentCartoKey() {
  return useCarto.getState().apiKey || readStoredKey();
}

export function voyagerStyleUrl(key = currentCartoKey()) {
  const query = key ? `?key=${encodeURIComponent(key)}` : "";
  return `${VOYAGER_STYLE}${query}`;
}

export function voyagerTileUrl(key = currentCartoKey()) {
  const query = key ? `?key=${encodeURIComponent(key)}` : "";
  return `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${query}`;
}

export function cartoTransformRequest(url: string): { url: string } {
  const key = currentCartoKey();
  if (!key) return { url };
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("cartocdn.com") && parsed.hostname !== "basemaps.carto.com") {
      return { url };
    }
    if (!parsed.searchParams.has("key")) parsed.searchParams.set("key", key);
    return { url: parsed.toString() };
  } catch {
    return { url };
  }
}

export function satelliteStyle() {
  return {
    version: 8 as const,
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: {
      esri: {
        type: "raster" as const,
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution: "Tiles © Esri",
        maxzoom: 19,
      },
    },
    layers: [{ id: "esri", type: "raster" as const, source: "esri" }],
  };
}

export function circlePolygon(lng: number, lat: number, radiusKm: number, steps = 64) {
  const coords: [number, number][] = [];
  const latR = (lat * Math.PI) / 180;
  const lngR = (lng * Math.PI) / 180;
  const ang = radiusKm / 6371;
  for (let i = 0; i <= steps; i++) {
    const bearing = (i / steps) * 2 * Math.PI;
    const lat2 = Math.asin(
      Math.sin(latR) * Math.cos(ang) + Math.cos(latR) * Math.sin(ang) * Math.cos(bearing),
    );
    const lng2 =
      lngR +
      Math.atan2(
        Math.sin(bearing) * Math.sin(ang) * Math.cos(latR),
        Math.cos(ang) - Math.sin(latR) * Math.sin(lat2),
      );
    coords.push([(lng2 * 180) / Math.PI, (lat2 * 180) / Math.PI]);
  }
  return { type: "Polygon" as const, coordinates: [coords] };
}

type CartoStore = {
  apiKey: string;
  hydrate: () => void;
  setApiKey: (key: string) => void;
};

export const useCarto = create<CartoStore>((set) => ({
  apiKey: readStoredKey(),
  hydrate: () => set({ apiKey: readStoredKey() }),
  setApiKey: (key) => {
    const apiKey = key.trim();
    if (typeof window !== "undefined") {
      if (apiKey) localStorage.setItem(STORAGE, apiKey);
      else localStorage.removeItem(STORAGE);
    }
    set({ apiKey: apiKey || envKey() });
  },
}));
