export const CARTO_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a> · Esri';

/** Same-origin proxy. The CARTO key never leaves the server. */
export const VOYAGER_TILES = "/api/tiles?z={z}&x={x}&y={y}&v=2";

export type CartoStatus = {
  configured: boolean;
  valid: boolean;
  provider: "carto" | "esri";
};

export async function cartoStatus(): Promise<CartoStatus> {
  try {
    const res = await fetch("/api/tiles?status=1", { headers: { Accept: "application/json" } });
    if (!res.ok) return { configured: false, valid: false, provider: "esri" };
    const data = (await res.json()) as Partial<CartoStatus>;
    return {
      configured: Boolean(data.configured),
      valid: Boolean(data.valid),
      provider: data.provider === "carto" ? "carto" : "esri",
    };
  } catch {
    return { configured: false, valid: false, provider: "esri" };
  }
}
