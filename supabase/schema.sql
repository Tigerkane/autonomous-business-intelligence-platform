-- ==============================================================================
-- Autonomous Business Intelligence Platform (ABIP) - Database Schema & RLS
-- ==============================================================================
-- This schema provisions:
-- 1. User Profiles linked to Supabase Auth (`public.profiles`)
-- 2. Automatic user creation trigger on auth.users signup
-- 3. Datasets metadata table with Row Level Security (`public.datasets`)
-- 4. Sales Transactions table with Row Level Security (`public.sales_transactions`)
-- 5. Strict multi-tenant isolation: Users can ONLY access their own datasets.
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Profiles Table (Linked to auth.users)
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  company text default 'Retail Enterprise',
  role text default 'Enterprise Business Analyst',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security for Profiles
alter table public.profiles enable row level security;

-- Profiles Policies
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 2. Automatic Profile Creation on Signup (Trigger)
-- ------------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, company, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'company', 'Retail Enterprise'),
    coalesce(new.raw_user_meta_data->>'role', 'Enterprise Business Analyst')
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(excluded.name, profiles.name),
    company = coalesce(excluded.company, profiles.company),
    role = coalesce(excluded.role, profiles.role);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. Datasets Table (Multi-tenant with RLS)
-- ------------------------------------------------------------------------------
create table if not exists public.datasets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  filename text not null,
  total_rows integer not null default 0,
  total_quantity integer default 0,
  total_sales numeric(12, 2) default 0.00,
  average_transaction numeric(10, 2) default 0.00,
  quality_report jsonb default '{}'::jsonb,
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security for Datasets
alter table public.datasets enable row level security;

-- Datasets Policies: Strict multi-tenant isolation
drop policy if exists "Users can view own datasets" on public.datasets;
create policy "Users can view own datasets"
  on public.datasets for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own datasets" on public.datasets;
create policy "Users can insert own datasets"
  on public.datasets for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own datasets" on public.datasets;
create policy "Users can update own datasets"
  on public.datasets for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own datasets" on public.datasets;
create policy "Users can delete own datasets"
  on public.datasets for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4. Sales Transactions Table (Multi-tenant with RLS)
-- ------------------------------------------------------------------------------
create table if not exists public.sales_transactions (
  id uuid default gen_random_uuid() primary key,
  dataset_id uuid references public.datasets(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  transaction_id text,
  date date not null,
  customer_id text not null,
  gender text not null,
  age integer default 0,
  product_category text not null,
  quantity integer not null,
  price_per_unit numeric(10, 2) not null,
  total_amount numeric(12, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security for Sales Transactions
alter table public.sales_transactions enable row level security;

-- Sales Transactions Policies: Strict multi-tenant isolation
drop policy if exists "Users can view own sales transactions" on public.sales_transactions;
create policy "Users can view own sales transactions"
  on public.sales_transactions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own sales transactions" on public.sales_transactions;
create policy "Users can insert own sales transactions"
  on public.sales_transactions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own sales transactions" on public.sales_transactions;
create policy "Users can delete own sales transactions"
  on public.sales_transactions for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. High-Performance Analytical Indexes
-- ------------------------------------------------------------------------------
create index if not exists idx_datasets_user on public.datasets(user_id);
create index if not exists idx_sales_user_date on public.sales_transactions(user_id, date);
create index if not exists idx_sales_user_category on public.sales_transactions(user_id, product_category);
create index if not exists idx_sales_user_gender on public.sales_transactions(user_id, gender);
create index if not exists idx_sales_dataset_id on public.sales_transactions(dataset_id);
