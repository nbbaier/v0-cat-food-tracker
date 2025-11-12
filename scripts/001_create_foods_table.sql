-- Updated schema to use inventory_quantity instead of in_stock boolean
create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  notes text,
  preference text not null check (preference in ('likes', 'dislikes', 'unknown')),
  inventory_quantity integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
