-- Migration: 20260603_events_erp.sql
-- Description: Update events table with status, category, image_url

-- Modify events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'open', 'live', 'completed', 'pending'));
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update RLS for events
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (status != 'draft' OR is_admin() OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('club_coordinator', 'club_head', 'super_admin', 'college_admin')));

-- Enable RLS for event_attendance
ALTER TABLE public.event_attendance ENABLE ROW LEVEL SECURITY;

-- Students can read and insert their own event attendance
CREATE POLICY "Students can manage own attendance" ON public.event_attendance
FOR ALL USING (user_id = auth.uid());

-- Club heads and admins can read and update all attendance
CREATE POLICY "Club heads manage event attendance" ON public.event_attendance
FOR ALL USING (is_admin() OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('club_coordinator', 'club_head')));

-- Add unique constraint to event_attendance to prevent double registration
ALTER TABLE public.event_attendance ADD CONSTRAINT unique_event_user UNIQUE(event_id, user_id);
