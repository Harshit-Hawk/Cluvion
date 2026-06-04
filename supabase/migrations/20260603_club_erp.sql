-- Migration: 20260603_club_erp.sql
-- Description: Create club_recruitment table for application workflows

CREATE TABLE IF NOT EXISTS public.club_recruitment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(club_id, student_id)
);

-- Enable RLS
ALTER TABLE public.club_recruitment ENABLE ROW LEVEL SECURITY;

-- Students can read their own applications
CREATE POLICY "Students can read own applications" ON public.club_recruitment
FOR SELECT USING (student_id = auth.uid());

-- Students can insert their own applications
CREATE POLICY "Students can insert own applications" ON public.club_recruitment
FOR INSERT WITH CHECK (student_id = auth.uid());

-- Club heads and admins can read and update applications for their clubs
CREATE POLICY "Club heads manage applications" ON public.club_recruitment
FOR ALL USING (
  is_admin() OR auth.uid() IN (
    SELECT user_id FROM public.memberships 
    WHERE club_id = club_recruitment.club_id AND role = 'head'
  )
);
