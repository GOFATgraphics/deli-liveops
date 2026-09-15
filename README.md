# Deli

Kano last-mile. **Senders** request a pickup on the public app. Staff run fleets and jobs from **Admin** (`/ops`) — the LiveOps desk.

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

## Paystack

Set **`PAYSTACK_SECRET_KEY`** (test `sk_test_…` first, then live). Webhook URL in the Paystack dashboard:

`https://deli-liveops.vercel.app/api/paystack/webhook`

Enable card, bank, USSD, and OPay on the Paystack checkout. The sender pays after they accept a price; the 4-digit receiver code appears only when Paystack confirms.
