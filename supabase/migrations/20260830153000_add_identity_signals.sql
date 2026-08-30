alter table public.checkout_signals
  add column if not exists email_hash text,
  add column if not exists phone_hash text,
  add column if not exists referral_code text;

create index if not exists checkout_signals_email_hash_idx on public.checkout_signals (email_hash);
create index if not exists checkout_signals_phone_hash_idx on public.checkout_signals (phone_hash);
create index if not exists checkout_signals_referral_code_idx on public.checkout_signals (referral_code);
