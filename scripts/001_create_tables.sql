-- SafeByte Database Schema
-- Creates all necessary tables for the food allergy safety app

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  allergies text[] default '{}',
  diet_tags text[] default '{}',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Restaurants table
create table if not exists public.restaurants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  cuisine text,
  price_range text check (price_range in ('$', '$$', '$$$', '$$$$')),
  address text,
  latitude numeric,
  longitude numeric,
  last_updated date default current_date,
  community_verified boolean default false,
  safety_rating numeric default 0 check (safety_rating >= 0 and safety_rating <= 100),
  created_at timestamptz default now()
);

-- Dishes table
create table if not exists public.dishes (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  description text,
  price numeric,
  calories integer,
  allergens text[] default '{}',
  free_of text[] default '{}',
  ingredients text[] default '{}',
  trending_score integer default 0,
  community_safe_count integer default 0,
  community_issue_count integer default 0,
  safety_score numeric default 90,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Feedback table (safe/issue reports)
create table if not exists public.feedback (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dish_id uuid not null references public.dishes(id) on delete cascade,
  type text not null check (type in ('safe', 'issue')),
  comment text,
  created_at timestamptz default now(),
  unique(user_id, dish_id, type)
);

-- Saved items table
create table if not exists public.saved_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  dish_id uuid not null references public.dishes(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, dish_id)
);

-- Create indexes for performance
create index if not exists idx_dishes_restaurant on public.dishes(restaurant_id);
create index if not exists idx_dishes_allergens on public.dishes using gin(allergens);
create index if not exists idx_dishes_free_of on public.dishes using gin(free_of);
create index if not exists idx_dishes_trending on public.dishes(trending_score desc);
create index if not exists idx_dishes_safety on public.dishes(safety_score desc);
create index if not exists idx_feedback_dish on public.feedback(dish_id);
create index if not exists idx_restaurants_location on public.restaurants(latitude, longitude);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.dishes enable row level security;
alter table public.feedback enable row level security;
alter table public.saved_items enable row level security;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- RLS Policies for restaurants (public read, authenticated write)
create policy "Anyone can view restaurants"
  on public.restaurants for select
  to authenticated, anon
  using (true);

create policy "Authenticated users can insert restaurants"
  on public.restaurants for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update restaurants"
  on public.restaurants for update
  to authenticated
  using (true);

-- RLS Policies for dishes (public read, authenticated write)
create policy "Anyone can view dishes"
  on public.dishes for select
  to authenticated, anon
  using (true);

create policy "Authenticated users can insert dishes"
  on public.dishes for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update dishes"
  on public.dishes for update
  to authenticated
  using (true);

-- RLS Policies for feedback
create policy "Users can view all feedback"
  on public.feedback for select
  to authenticated, anon
  using (true);

create policy "Users can insert their own feedback"
  on public.feedback for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own feedback"
  on public.feedback for delete
  to authenticated
  using (auth.uid() = user_id);

-- RLS Policies for saved_items
create policy "Users can view their own saved items"
  on public.saved_items for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own saved items"
  on public.saved_items for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own saved items"
  on public.saved_items for delete
  to authenticated
  using (auth.uid() = user_id);
