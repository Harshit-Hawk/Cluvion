-- Migration: 20260603_faculty_assignments.sql
-- Description: Create course_assignments table for Faculty

CREATE TABLE IF NOT EXISTS public.course_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  batch TEXT NOT NULL,
  semester INTEGER NOT NULL,
  section TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(faculty_id, course_id, batch, semester, section)
);

-- Enable RLS
ALTER TABLE public.course_assignments ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins manage course assignments" ON public.course_assignments
FOR ALL USING (is_admin());

-- Faculty can read their own assignments
CREATE POLICY "Faculty read own assignments" ON public.course_assignments
FOR SELECT USING (auth.uid() = faculty_id);

-- Students can read all assignments to know who teaches what
CREATE POLICY "Everyone read assignments" ON public.course_assignments
FOR SELECT USING (true);
