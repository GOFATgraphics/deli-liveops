import { createFileRoute } from "@tanstack/react-router";
import {
  cartoApiKey,
  esriStreetTileUpstream,
  probeCartoBasemap,
  voyagerTileUpstream,
} from "@/lib/carto.server";

export const Route = createFileRoute("/api/tiles")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.has("status")) {
          const probe = await probeCartoBasemap();
          return Response.json({
            configured: Boolean(cartoApiKey()),
            valid: probe.valid,
            provider: probe.provider,
          });
        }

        const z = parseInt(url.searchParams.get("z") ?? "", 10);
        const x = parseInt(url.searchParams.get("x") ?? "", 10);
        const y = parseInt(url.searchParams.get("y") ?? "", 10);
        if (!Number.isInteger(z) || !Number.isInteger(x) || !Number.isInteger(y)) {
          return new Response("Bad tile", { status: 400 });
        }
        if (z < 0 || z > 20 || x < 0 || y < 0 || x >= 2 ** z || y >= 2 ** z) {
          return new Response("Bad tile", { status: 400 });
        }

        const probe = await probeCartoBasemap();
        const useCarto = probe.provider === "carto";
        const upstream = useCarto
          ? voyagerTileUpstream(z, x, y)
          : esriStreetTileUpstream(z, x, y);
        const res = await fetch(upstream, {
          headers: { "User-Agent": "DeliLiveOps/1.0" },
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) {
          return new Response("Tile upstream failed", { status: 502 });
        }
        const body = await res.arrayBuffer();
        return new Response(body, {
          headers: {
            "Content-Type": res.headers.get("content-type") || "image/png",
            "Cache-Control": useCarto
              ? "public, max-age=86400, s-maxage=604800, immutable"
              : "public, max-age=3600",
            "X-Deli-Basemap": probe.provider,
          },
        });
      },
    },
  },
});
