-- Create foods table
create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  notes text,
  preference text not null check (preference in ('likes', 'dislikes', 'unknown')),
  in_stock boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
