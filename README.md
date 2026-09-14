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

Neon on Vercel Storage injects `DATABASE_URL` (and usually `DATABASE_URL_UNPOOLED`). Do not put those in a `VITE_` variable. After connecting the database, redeploy so the migration runs.

## Map tiles

Set **`CARTO_API_KEY`** on the host (server only). Tiles are fetched at `/api/tiles`.
