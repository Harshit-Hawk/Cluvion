-- Schema for Student Activity Portal & Tracker
create type user_role as enum ('admin', 'club_head', 'student');
create type membership_role as enum ('member', 'head');
create type action_type as enum ('event_attended', 'achievement_earned', 'feed_interaction', 'event_registered');

create table public.users (
    id uuid references auth.users not null primary key,
    email text not null,
    role user_role default 'student' not null,
    full_name text not null,
    roll_no text,
    college text,
    course text,
    dob date,
    designation text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.clubs (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.memberships (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.users on delete cascade not null,
    club_id uuid references public.clubs on delete cascade not null,
    role membership_role default 'member' not null,
    joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, club_id)
);

create table public.events (
    id uuid default gen_random_uuid() primary key,
    club_id uuid references public.clubs on delete cascade not null,
    title text not null,
    description text,
    location text,
    event_date timestamp with time zone not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.achievements (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.users on delete cascade not null,
    club_id uuid references public.clubs on delete cascade not null,
    title text not null,
    points int default 0 not null,
    granted_by uuid references public.users not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.feed_posts (
    id uuid default gen_random_uuid() primary key,
    club_id uuid references public.clubs on delete cascade,
    user_id uuid references public.users(id),
    content text not null,
    media_url text,
    media_type text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.activity_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.users on delete cascade not null,
    action_type action_type not null,
    points_awarded int default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- View for dynamically calculating activeness score
create view public.student_scores as
select 
  user_id,
  sum(points_awarded) as activeness_score
from public.activity_logs
group by user_id;

-- Ensure replication is enabled for realtime on tables where it's needed
alter publication supabase_realtime add table public.feed_posts;
alter publication supabase_realtime add table public.events;
