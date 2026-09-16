-- Business mark on sender accounts.

alter table senders add column if not exists logo text not null default '';
