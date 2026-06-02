-- Badge & Achievement System Schema
-- Adds rarity, category, and xp_reward columns to badges table
-- and ensures the user_badges junction table exists.

-- ─── Badges Table ───────────────────────────────────────────
-- This is the canonical badge definitions table.
CREATE TABLE IF NOT EXISTS public.badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon_url TEXT DEFAULT '',
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  rarity TEXT NOT NULL DEFAULT 'common'
    CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  category TEXT NOT NULL DEFAULT 'special'
    CHECK (category IN ('academic', 'social', 'leadership', 'event', 'streak', 'special')),
  xp_reward INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── User Badges Junction ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- ─── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON public.badges(rarity);
CREATE INDEX IF NOT EXISTS idx_badges_category ON public.badges(category);

-- ─── Seed Default Badges ────────────────────────────────────
INSERT INTO public.badges (id, name, description, requirement_type, requirement_value, rarity, category, xp_reward)
VALUES
  -- Common
  ('b-first-steps',    'First Steps',     'Attend your first campus event.',              'events_attended',  1,    'common',    'event',      10),
  ('b-social-spark',   'Social Spark',    'Join your first club.',                        'clubs_joined',     1,    'common',    'social',     10),
  ('b-day-one',        'Day One',         'Log in for the first time.',                   'daily_logins',     1,    'common',    'streak',     5),
  -- Uncommon
  ('b-rising-star',    'Rising Star',     'Earn 100 total XP.',                           'total_xp',         100,  'uncommon',  'academic',   25),
  ('b-weekly-warrior', 'Weekly Warrior',  'Maintain a 7-day activity streak.',            'streak_days',      7,    'uncommon',  'streak',     30),
  ('b-event-explorer', 'Event Explorer',  'Attend 5 different events.',                   'events_attended',  5,    'uncommon',  'event',      25),
  -- Rare
  ('b-trailblazer',    'Trailblazer',     'Earn 500 total XP.',                           'total_xp',         500,  'rare',      'academic',   50),
  ('b-club-hopper',    'Club Hopper',     'Join 3 different clubs.',                      'clubs_joined',     3,    'rare',      'social',     40),
  ('b-iron-streak',    'Iron Streak',     'Maintain a 30-day activity streak.',           'streak_days',      30,   'rare',      'streak',     75),
  -- Epic
  ('b-gold-scholar',   'Gold Scholar',    'Earn 1000 total XP.',                          'total_xp',         1000, 'epic',      'academic',   100),
  ('b-event-veteran',  'Event Veteran',   'Attend 25 events.',                            'events_attended',  25,   'epic',      'event',      100),
  ('b-organizer',      'The Organizer',   'Organize 5 events as a club head.',            'events_organized', 5,    'epic',      'leadership', 120),
  -- Legendary
  ('b-legend',         'Campus Legend',   'Earn 5000 total XP. You are a living legend.', 'total_xp',         5000, 'legendary', 'special',    250),
  ('b-eternal-flame',  'Eternal Flame',   'Maintain a 100-day activity streak.',          'streak_days',      100,  'legendary', 'streak',     300)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  requirement_type = EXCLUDED.requirement_type,
  requirement_value = EXCLUDED.requirement_value,
  rarity = EXCLUDED.rarity,
  category = EXCLUDED.category,
  xp_reward = EXCLUDED.xp_reward;

-- ─── RLS Policies ───────────────────────────────────────────
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Badges are readable by everyone
CREATE POLICY IF NOT EXISTS "Badges are viewable by all" ON public.badges
  FOR SELECT USING (true);

-- Users can view their own earned badges
CREATE POLICY IF NOT EXISTS "Users can view own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert badges (for the engine)
CREATE POLICY IF NOT EXISTS "Service can insert user badges" ON public.user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);
