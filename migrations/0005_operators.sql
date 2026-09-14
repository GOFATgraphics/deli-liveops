-- One Deli staff account may open /admin. First signed-in visitor to /admin
-- is claimed; after that only this row may run the desk.

create table if not exists operators (
  user_id     text primary key,
  created_at  timestamptz not null default now()
);
