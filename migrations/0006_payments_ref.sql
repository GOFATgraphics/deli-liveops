-- Unique Paystack / transfer refs. Duplicate channel names like "opay" were
-- stored as refs on more than one row; keep the newest and clear the rest.
update payments
set provider_ref = null
where id in (
  select id from (
    select id,
      row_number() over (
        partition by provider_ref
        order by created_at desc nulls last, id desc
      ) as rn
    from payments
    where provider_ref is not null
  ) ranked
  where rn > 1
);

create unique index if not exists payments_provider_ref_idx
  on payments (provider_ref)
  where provider_ref is not null;
