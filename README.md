# Deli LiveOps

Ops desk for Deli — last-mile delivery in **Kano State**. Register courier fleets, pin hubs on the map, and hold coverage radii until a sender requests a quote.

## Stack

TanStack Start, React, Tailwind, Leaflet. Streets tiles are CARTO Voyager, signed on the server.

Auth and database are off for this step. Partners persist in the browser.

## Map tiles

Set **`CARTO_API_KEY`** on the host (Vercel → Environment Variables). Do **not** prefix it with `VITE_` — that would put the secret in the browser.

Tiles are fetched at `/api/tiles` on the server, with the key attached there. The map never sees it.

Get a free key at [carto.com/basemaps/apikey](https://carto.com/basemaps/apikey).
