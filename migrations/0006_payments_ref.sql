create unique index if not exists payments_provider_ref_idx
  on payments (provider_ref)
  where provider_ref is not null;
