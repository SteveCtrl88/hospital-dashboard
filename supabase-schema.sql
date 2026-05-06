-- ============================================================
-- US HOSPITAL DASHBOARD — SUPABASE SCHEMA
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- Drop existing tables
drop table if exists idn_hospitals cascade;
drop table if exists idn_groups cascade;
drop table if exists hospitals cascade;

-- IDN Groups table (Top 20 largest US hospital networks)
create table idn_groups (
  id serial primary key,
  rank integer not null,
  name text not null,
  hq_city text not null,
  hq_state text not null,
  total_hospitals integer not null,
  total_beds integer not null,
  net_patient_revenue_b numeric,
  ownership_type text not null,
  states_covered integer not null default 1,
  created_at timestamptz default now()
);

-- Individual flagship hospitals within each IDN
create table idn_hospitals (
  id serial primary key,
  idn_id integer references idn_groups(id) on delete cascade,
  hospital_name text not null,
  city text not null,
  state text not null,
  beds integer
);

-- Full US hospital table (searchable, sortable, editable)
create table hospitals (
  id serial primary key,
  name text not null,
  city text not null,
  state text not null,
  beds integer,
  idn_name text,
  idn_rank integer,
  type text default 'General Acute Care',
  ownership text,
  created_at timestamptz default now()
);

-- Enable Row Level Security with public read
alter table idn_groups enable row level security;
alter table idn_hospitals enable row level security;
alter table hospitals enable row level security;

create policy "Public read idn_groups"    on idn_groups    for select using (true);
create policy "Public read idn_hospitals" on idn_hospitals for select using (true);
create policy "Public read hospitals"     on hospitals     for select using (true);
create policy "Auth write hospitals"      on hospitals     for all    using (true);

-- Useful indexes
create index idx_hospitals_state on hospitals(state);
create index idx_hospitals_beds  on hospitals(beds desc nulls last);
create index idx_hospitals_idn   on hospitals(idn_name);
