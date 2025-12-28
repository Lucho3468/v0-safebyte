-- Triggers for SafeByte

-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (
    new.id,
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger to create profile when user signs up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to update dish safety scores based on feedback
create or replace function public.update_dish_safety_score()
returns trigger
language plpgsql
as $$
declare
  safe_count integer;
  issue_count integer;
  new_score numeric;
begin
  -- Count feedback for the dish
  select 
    count(*) filter (where type = 'safe'),
    count(*) filter (where type = 'issue')
  into safe_count, issue_count
  from public.feedback
  where dish_id = coalesce(new.dish_id, old.dish_id);
  
  -- Calculate new safety score
  -- Base score 90, +10 for community approval, -20 for issues
  new_score := 90 + least(10, safe_count) - least(20, issue_count * 2);
  new_score := greatest(40, least(98, new_score));
  
  -- Update the dish
  update public.dishes
  set 
    community_safe_count = safe_count,
    community_issue_count = issue_count,
    safety_score = new_score,
    updated_at = now()
  where id = coalesce(new.dish_id, old.dish_id);
  
  return new;
end;
$$;

-- Trigger to update safety scores when feedback changes
drop trigger if exists on_feedback_change on public.feedback;
create trigger on_feedback_change
  after insert or delete on public.feedback
  for each row
  execute function public.update_dish_safety_score();

-- Function to update profile updated_at timestamp
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger for profiles updated_at
drop trigger if exists on_profile_update on public.profiles;
create trigger on_profile_update
  before update on public.profiles
  for each row
  execute function public.update_updated_at();

-- Trigger for dishes updated_at
drop trigger if exists on_dish_update on public.dishes;
create trigger on_dish_update
  before update on public.dishes
  for each row
  execute function public.update_updated_at();
