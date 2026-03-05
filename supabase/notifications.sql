-- ============================================================
-- Cluvion: Live Notification System Migration
-- Run this in the Supabase SQL Editor (nukfeygpfqouxnxwwovl)
-- ============================================================

-- 1. Notification type enum
create type notification_type as enum ('event', 'achievement', 'points', 'announcement');

-- 2. Notifications table
create table public.notifications (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.users(id) on delete cascade not null,
  title       text not null,
  body        text not null,
  type        notification_type not null default 'announcement',
  is_read     boolean not null default false,
  link        text,                        -- optional frontend route e.g. '/student/events'
  created_at  timestamp with time zone default timezone('utc', now()) not null
);

-- 3. Enable Realtime for live delivery
alter publication supabase_realtime add table public.notifications;

-- 4. Row Level Security
alter table public.notifications enable row level security;

-- Users can only see their own notifications
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Users can mark their own notifications as read (update only is_read)
create policy "Users can mark own notifications read"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Only security-definer functions (triggers) may insert — no client-side inserts
-- (no insert policy → clients cannot INSERT directly)

-- 5. Auto-deletion after 7 days via pg_cron
-- pg_cron is enabled by default on Supabase. If you see an error, enable it in
-- Database → Extensions in the Supabase dashboard first.

select cron.schedule(
  'delete-old-notifications',          -- job name (unique)
  '0 3 * * *',                         -- daily at 03:00 UTC
  $$
    delete from public.notifications
    where created_at < now() - interval '7 days';
  $$
);

-- Manual cleanup helper (callable by admins/SQL if needed)
create or replace function public.cleanup_old_notifications()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.notifications
  where created_at < now() - interval '7 days';
$$;


-- ============================================================
-- 6. Helper: insert a notification for a single user
-- ============================================================
create or replace function public.create_notification(
  p_user_id  uuid,
  p_title    text,
  p_body     text,
  p_type     notification_type,
  p_link     text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, title, body, type, link)
  values (p_user_id, p_title, p_body, p_type, p_link);
end;
$$;


-- ============================================================
-- 7. Trigger: Achievement granted → notify recipient
-- ============================================================
create or replace function public.notify_on_achievement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_club_name text;
begin
  select name into v_club_name from public.clubs where id = NEW.club_id;

  perform public.create_notification(
    NEW.user_id,
    '🏆 New Achievement Unlocked!',
    'You earned "' || NEW.title || '" (+' || NEW.points || ' pts) from ' || coalesce(v_club_name, 'your club') || '.',
    'achievement',
    '/student/activity'
  );
  return NEW;
end;
$$;

drop trigger if exists on_achievement_insert on public.achievements;
create trigger on_achievement_insert
  after insert on public.achievements
  for each row execute procedure public.notify_on_achievement();


-- ============================================================
-- 8. Trigger: Activity log insert → notify for points/events
-- ============================================================
create or replace function public.notify_on_activity_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title  text;
  v_body   text;
  v_type   notification_type;
  v_link   text;
begin
  if NEW.action_type = 'event_attended' then
    v_title := '✅ Event Attendance Recorded';
    v_body  := 'Nice work! You earned +' || NEW.points_awarded || ' pts for attending an event.';
    v_type  := 'points';
    v_link  := '/student/activity';
  elsif NEW.action_type = 'achievement_earned' then
    v_title := '⭐ Points Awarded';
    v_body  := 'You received +' || NEW.points_awarded || ' pts for an achievement!';
    v_type  := 'points';
    v_link  := '/student/activity';
  elsif NEW.action_type = 'event_registered' then
    v_title := '📋 Event Registration Confirmed';
    v_body  := 'You have been registered for an event (+' || NEW.points_awarded || ' pts).';
    v_type  := 'event';
    v_link  := '/student/events';
  else
    -- feed_interaction or other — skip notification
    return NEW;
  end if;

  perform public.create_notification(NEW.user_id, v_title, v_body, v_type, v_link);
  return NEW;
end;
$$;

drop trigger if exists on_activity_log_insert on public.activity_logs;
create trigger on_activity_log_insert
  after insert on public.activity_logs
  for each row execute procedure public.notify_on_activity_log();


-- ============================================================
-- 9. Trigger: New event created → notify all club members
-- ============================================================
create or replace function public.notify_on_new_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_club_name text;
  v_member    record;
begin
  select name into v_club_name from public.clubs where id = NEW.club_id;

  for v_member in
    select user_id from public.memberships where club_id = NEW.club_id
  loop
    perform public.create_notification(
      v_member.user_id,
      '📅 New Event: ' || NEW.title,
      coalesce(v_club_name, 'Your club') || ' just posted a new event on ' ||
        to_char(NEW.event_date at time zone 'UTC', 'Mon DD, YYYY') || '.',
      'event',
      '/student/events'
    );
  end loop;

  return NEW;
end;
$$;

drop trigger if exists on_event_insert on public.events;
create trigger on_event_insert
  after insert on public.events
  for each row execute procedure public.notify_on_new_event();


-- ============================================================
-- 10. Trigger: New feed post in a club → notify all members
-- ============================================================
create or replace function public.notify_on_new_feed_post()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_club_name   text;
  v_author_name text;
  v_member      record;
begin
  -- Only notify if the post belongs to a club
  if NEW.club_id is null then
    return NEW;
  end if;

  select name into v_club_name   from public.clubs where id = NEW.club_id;
  select full_name into v_author_name from public.users where id = NEW.user_id;

  for v_member in
    select user_id from public.memberships
    where club_id = NEW.club_id
      and user_id <> NEW.user_id   -- don't notify the author themselves
  loop
    perform public.create_notification(
      v_member.user_id,
      '📢 New Post in ' || coalesce(v_club_name, 'your club'),
      coalesce(v_author_name, 'Someone') || ' shared an update: "' ||
        left(NEW.content, 60) || case when length(NEW.content) > 60 then '…' else '' end || '"',
      'announcement',
      '/student'
    );
  end loop;

  return NEW;
end;
$$;

drop trigger if exists on_feed_post_insert on public.feed_posts;
create trigger on_feed_post_insert
  after insert on public.feed_posts
  for each row execute procedure public.notify_on_new_feed_post();
