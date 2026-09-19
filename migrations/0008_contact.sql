create table if not exists contact_messages (
  id          text primary key,
  name        text not null,
  email       text not null,
  phone       text not null default '',
  message     text not null,
  created_at  timestamptz not null default now()
);
