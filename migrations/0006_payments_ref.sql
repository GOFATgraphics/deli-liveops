-- Desk "mark paid" stored short channel names (opay, card, …) as provider_ref.
-- Paystack needs that column unique. Rewrite dummy / duplicate refs first.

update payments
set provider_ref = 'desk-' || id
where provider_ref is not null
  and (
    lower(btrim(provider_ref)) in (
      'opay', 'card', 'bank', 'ussd', 'paystack', 'cash', 'manual', 'transfer', 'desk'
    )
    or length(btrim(provider_ref)) < 8
  );

with ranked as (
  select id,
         row_number() over (partition by provider_ref order by created_at desc, id desc) as rn
  from payments
  where provider_ref is not null
)
update payments p
set provider_ref = 'desk-' || p.id
from ranked r
where p.id = r.id
  and r.rn > 1;

create unique index if not exists payments_provider_ref_idx
  on payments (provider_ref)
  where provider_ref is not null;
