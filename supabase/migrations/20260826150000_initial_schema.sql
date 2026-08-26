create extension if not exists "pgcrypto";

create type public.case_status as enum ('investigate', 'queued', 'monitoring', 'benign', 'confirmed');

create table public.raw_events (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('razorpay', 'merchant_demo')),
  external_event_id text unique,
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now()
);

create table public.risk_cases (
  id text primary key,
  account_ids text[] not null,
  coupon_code text not null,
  exposure_inr integer not null check (exposure_inr >= 0),
  score numeric not null check (score >= 0 and score <= 100),
  status public.case_status not null default 'investigate',
  explanation text not null,
  limitations text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.case_evidence (
  id uuid primary key default gen_random_uuid(),
  case_id text not null references public.risk_cases(id) on delete cascade,
  kind text not null,
  label text not null,
  detail text not null,
  strength text not null check (strength in ('strong', 'medium', 'weak')),
  contribution numeric not null,
  account_ids text[] not null
);

create table public.review_labels (
  id uuid primary key default gen_random_uuid(),
  case_id text not null references public.risk_cases(id) on delete cascade,
  decision public.case_status not null check (decision in ('investigate', 'benign', 'confirmed')),
  reviewer_note text,
  reviewed_at timestamptz not null default now()
);

alter table public.raw_events enable row level security;
alter table public.risk_cases enable row level security;
alter table public.case_evidence enable row level security;
alter table public.review_labels enable row level security;

-- Apply authenticated-user policies only after your merchant/analyst auth model is in place.
-- Service-role ingestion remains server-side and is never exposed to browsers.
