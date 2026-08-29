create table public.checkout_signals (
  id uuid primary key default gen_random_uuid(),
  merchant_order_id text not null unique,
  account_id text not null,
  created_at timestamptz not null,
  device_hash text,
  payment_token_hash text,
  address_hash text,
  ip_hash text,
  coupon_code text not null,
  discount_inr integer not null check (discount_inr >= 0),
  received_at timestamptz not null default now()
);

create index checkout_signals_account_id_idx on public.checkout_signals (account_id);
alter table public.checkout_signals enable row level security;

-- Only the server-side service role writes checkout signals. Do not expose this table to browsers.
