-- Helper functions to break RLS recursion
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.users
    where id = auth.uid()
    and role = 'admin'
  );
$$ language sql security definer set search_path = public;

create or replace function public.is_club_head(c_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.memberships
    where user_id = auth.uid()
    and club_id = c_id
    and role = 'head'
  );
$$ language sql security definer set search_path = public;

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.clubs enable row level security;
alter table public.memberships enable row level security;
alter table public.events enable row level security;
alter table public.achievements enable row level security;
alter table public.feed_posts enable row level security;
alter table public.activity_logs enable row level security;

-- USERS Table
create policy "Users are viewable by everyone" on public.users for select using (true);
create policy "Admins can update users" on public.users for update using (is_admin());
create policy "Admins can delete users" on public.users for delete using (is_admin());
create policy "Users can update their own profile" on public.users for update using (auth.uid() = id);

-- CLUBS Table
create policy "Clubs viewable by everyone" on public.clubs for select using (true);
create policy "Admins can insert clubs" on public.clubs for insert with check (is_admin());
create policy "Admins can update clubs" on public.clubs for update using (is_admin());
create policy "Admins can delete clubs" on public.clubs for delete using (is_admin());

-- MEMBERSHIPS Table
create policy "Memberships viewable by everyone" on public.memberships for select using (true);
create policy "Club heads can modify their club memberships" on public.memberships using (is_club_head(club_id));
create policy "Admins can modify all memberships" on public.memberships using (is_admin());
create policy "Students can join clubs" on public.memberships for insert with check (
  auth.uid() = user_id and role = 'member'
);
create policy "Students can leave clubs" on public.memberships for delete using (
  auth.uid() = user_id and role = 'member'
);

-- EVENTS Table
create policy "Events viewable by everyone" on public.events for select using (true);
create policy "Club heads can insert events" on public.events for insert with check (is_club_head(club_id));
create policy "Club heads can update events" on public.events for update using (is_club_head(club_id));
create policy "Club heads can delete events" on public.events for delete using (is_club_head(club_id));
create policy "Admins can manage events" on public.events using (is_admin());

-- ACHIEVEMENTS Table
create policy "Achievements viewable by everyone" on public.achievements for select using (true);
create policy "Club heads can insert achievements" on public.achievements for insert with check (is_club_head(club_id));
create policy "Club heads can update achievements" on public.achievements for update using (is_club_head(club_id));
create policy "Club heads can delete achievements" on public.achievements for delete using (is_club_head(club_id));
create policy "Admins can manage achievements" on public.achievements using (is_admin());

-- FEED_POSTS Table
create policy "Feed posts viewable by everyone" on public.feed_posts for select using (true);
create policy "Club heads can insert feed posts" on public.feed_posts for insert with check (is_club_head(club_id));
create policy "Club heads can update feed posts" on public.feed_posts for update using (is_club_head(club_id));
create policy "Club heads can delete feed posts" on public.feed_posts for delete using (is_club_head(club_id));
create policy "Admins can manage feed posts" on public.feed_posts using (is_admin());

-- ACTIVITY LOGS Table
create policy "Activity logs viewable by owners and admins" on public.activity_logs for select using (
  auth.uid() = user_id or is_admin()
);
create policy "Users can insert their own activity logs" on public.activity_logs for insert with check (
  auth.uid() = user_id
);
create policy "Club heads can insert logs for achievements/events" on public.activity_logs for insert with check (
  exists (select 1 from public.memberships where user_id = auth.uid() and role = 'head')
);
create policy "Admins manage logs" on public.activity_logs using (is_admin());
