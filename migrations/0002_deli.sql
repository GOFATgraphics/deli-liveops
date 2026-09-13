-- Deli operating foundation. Applied on PGLite (preview) and Neon (deploy).

create sequence if not exists job_public_seq start with 1042;

create table if not exists fleets (
  id            text primary key,
  name          text not null,
  notes         text not null default '',
  address       text not null default '',
  lat           double precision not null,
  lng           double precision not null,
  radius_km     integer not null,
  max_job_km    integer not null,
  vehicles      text[] not null default '{}',
  status        text not null default 'active' check (status in ('active', 'paused')),
  image         text not null default '',
  zone          text not null default 'kano-core',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  actor         text not null default 'ops'
);

create table if not exists fleet_contacts (
  id          text primary key,
  fleet_id    text not null references fleets(id) on delete cascade,
  name        text not null default '',
  phone       text not null,
  channel     text not null default 'whatsapp',
  is_primary  boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists fleet_contacts_fleet_idx on fleet_contacts (fleet_id);

create table if not exists jobs (
  id                 text primary key,
  public_id          text not null unique,
  status             text not null,
  pickup_lat         double precision not null,
  pickup_lng         double precision not null,
  pickup_landmark    text not null default '',
  dropoff_lat        double precision not null,
  dropoff_lng        double precision not null,
  dropoff_landmark   text not null default '',
  distance_km        numeric not null,
  goods              text not null default '',
  constraints        text not null default '',
  window_kind        text not null default 'now' check (window_kind in ('now', 'scheduled')),
  window_at          timestamptz,
  sender_name        text not null default '',
  sender_phone       text not null default '',
  selected_quote_id  text,
  selected_fleet_id  text references fleets(id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  actor              text not null default 'ops',
  check (status in (
    'requested', 'quote_pending', 'quoted', 'accepted',
    'payment_pending', 'paid', 'assigned',
    'picked_up', 'in_transit', 'delivery_confirmation_pending',
    'delivered', 'settlement_pending', 'settled',
    'cancelled', 'failed', 'disputed', 'refund_pending', 'refunded'
  ))
);

create index if not exists jobs_status_idx on jobs (status, created_at desc);

create table if not exists quotes (
  id                 text primary key,
  job_id             text not null references jobs(id) on delete cascade,
  fleet_id           text not null references fleets(id),
  total_ngn          integer not null,
  fleet_payout_ngn   integer not null,
  deli_fee_ngn       integer not null,
  payment_fee_payer  text not null default 'sender',
  eta_minutes        integer not null,
  expires_at         timestamptz not null,
  terms              text not null default '',
  status             text not null default 'offered' check (status in ('offered', 'accepted', 'expired', 'withdrawn')),
  created_at         timestamptz not null default now(),
  actor              text not null default 'ops'
);

create index if not exists quotes_job_idx on quotes (job_id);

create table if not exists payments (
  id            text primary key,
  job_id        text not null references jobs(id),
  quote_id      text not null references quotes(id),
  amount_ngn    integer not null,
  currency      text not null default 'NGN',
  provider      text not null default 'paystack',
  provider_ref  text,
  status        text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refund_pending', 'refunded')),
  paid_at       timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists payments_job_idx on payments (job_id);

create table if not exists payouts (
  id            text primary key,
  job_id        text not null references jobs(id),
  fleet_id      text not null references fleets(id),
  amount_ngn    integer not null,
  provider      text not null default 'paystack_transfer',
  provider_ref  text,
  status        text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  approved_by   text not null default 'ops',
  released_at   timestamptz,
  created_at    timestamptz not null default now()
);

create table if not exists job_events (
  id           text primary key,
  job_id       text not null references jobs(id) on delete cascade,
  kind         text not null,
  from_status  text,
  to_status    text,
  payload      jsonb not null default '{}',
  actor        text not null,
  at           timestamptz not null default now()
);

create index if not exists job_events_job_idx on job_events (job_id, at);

insert into fleets (id, name, notes, address, lat, lng, radius_km, max_job_km, vehicles, status, image, zone, created_at, updated_at)
values
  ('p-swiftwheel', 'SwiftWheel Couriers', 'WhatsApp first. Quotes within 10 minutes. Night cutoff 9pm.', '18 France Road, Sabon Gari, Kano', 12.0126, 8.5378, 8, 8, '{bike}', 'active', '/partners/swiftwheel.jpg', 'kano-core', '2026-08-02T09:00:00Z', '2026-09-10T11:20:00Z'),
  ('p-northline', 'Northline Logistics', 'Call the ops desk. Vans need 45 minutes notice.', '7 Club Road, Bompai, Kano', 12.0185, 8.551, 15, 15, '{car,van}', 'active', '/partners/northline.jpg', 'kano-core', '2026-07-18T08:30:00Z', '2026-09-08T16:04:00Z'),
  ('p-kekerun', 'KekeRun', 'Bikes only. Best for envelopes and small bags. Amina dispatches.', '42 Murtala Mohammed Way, Fagge, Kano', 12.0078, 8.5312, 6, 6, '{bike}', 'active', '/partners/kekerun.jpg', 'kano-core', '2026-08-21T12:10:00Z', '2026-09-11T09:40:00Z'),
  ('p-harbor', 'Harbor Van Co', 'Paused — insurance renewal. Recheck 20 Sep.', 'Sharada Industrial Estate, Kano', 11.968, 8.4985, 20, 20, '{van}', 'paused', '/partners/harbor.jpg', 'kano-core', '2026-06-04T10:00:00Z', '2026-09-05T14:12:00Z'),
  ('p-cityhop', 'CityHop Express', 'Prefer them for Tarauni and Zoo Road. Fast on small bags.', 'Zoo Road, Tarauni, Kano', 11.9735, 8.5488, 10, 10, '{bike,car}', 'active', '/partners/cityhop.jpg', 'kano-core', '2026-07-29T15:45:00Z', '2026-09-12T08:18:00Z')
on conflict (id) do nothing;

insert into fleet_contacts (id, fleet_id, name, phone, channel, is_primary)
values
  ('c-swiftwheel', 'p-swiftwheel', 'Dispatch', '+234 803 441 2290', 'whatsapp', true),
  ('c-northline', 'p-northline', 'Ops desk', '+234 809 220 1184', 'call', true),
  ('c-kekerun', 'p-kekerun', 'Amina', '+234 701 554 8831', 'whatsapp', true),
  ('c-harbor', 'p-harbor', 'Desk', '+234 802 667 0912', 'call', true),
  ('c-cityhop', 'p-cityhop', 'Dispatch', '+234 815 330 7742', 'whatsapp', true)
on conflict (id) do nothing;
