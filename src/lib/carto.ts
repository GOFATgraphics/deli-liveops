export const CARTO_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>';

/** Same-origin proxy. The CARTO key never leaves the server. */
export const VOYAGER_TILES = "/api/tiles?z={z}&x={x}&y={y}";

export async function cartoStatus() {
  try {
    const res = await fetch("/api/tiles?status=1", { headers: { Accept: "application/json" } });
    if (!res.ok) return { configured: false };
    const data = (await res.json()) as { configured?: boolean };
    return { configured: Boolean(data.configured) };
  } catch {
    return { configured: false };
  }
}
