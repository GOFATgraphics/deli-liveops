-- Sender accounts: profile (phone) plus the user_id on jobs they file.

create table if not exists senders (
  user_id     text primary key,
  name        text not null default '',
  phone       text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table jobs add column if not exists sender_user_id text;
create index if not exists jobs_sender_user_idx on jobs (sender_user_id);
