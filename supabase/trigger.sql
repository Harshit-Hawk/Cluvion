-- Trigger to auto-create a public.users profile row whenever a new auth user signs up.
-- This runs as the database owner, bypassing RLS entirely.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, roll_no, college, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'roll_no', ''),
    coalesce(new.raw_user_meta_data->>'college', ''),
    'student'
  )
  on conflict (id) do nothing;  -- safe to re-run
  return new;
end;
$$;

-- Drop existing trigger if it exists, then recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
