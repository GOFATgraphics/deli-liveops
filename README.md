# Deli LiveOps

Ops desk for Deli — last-mile delivery in a tight **Kano** zone. Fleets, jobs, quotes, and an event log live in **Postgres** (Neon in production, embedded PGLite in preview).

## Data

| Store | Role |
|---|---|
| Neon Postgres | Source of truth — fleets, jobs, quotes, payments, payouts, job_events |
| Kysely | Auth query layer already in the repo |
| CARTO | Map tiles only, signed on the server |
| Vercel Blob / Redis | Later — photos, OTPs |

Do not put operational records on the map provider. Do not use Firebase, MongoDB, or Supabase for this.

`DATABASE_URL` is injected on deploy. Do not put it in a `VITE_` variable.

## Map tiles

Set **`CARTO_API_KEY`** on the host (server only). Tiles are fetched at `/api/tiles`.
