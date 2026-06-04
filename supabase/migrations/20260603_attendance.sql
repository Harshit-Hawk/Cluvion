-- Migration: 20260603_attendance.sql
-- Description: Create academic attendance tables (class_sessions and attendance_records)

CREATE TABLE IF NOT EXISTS public.class_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.course_assignments(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  topic TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.class_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by UUID NOT NULL REFERENCES public.users(id),
  marked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

-- Enable RLS
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Faculty can manage their own class sessions
CREATE POLICY "Faculty manage own class sessions" ON public.class_sessions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.course_assignments
    WHERE id = class_sessions.assignment_id AND faculty_id = auth.uid()
  )
);

-- Students can read class sessions they are enrolled in
CREATE POLICY "Students read enrolled sessions" ON public.class_sessions
FOR SELECT USING (true); -- Keep simple for now, refine later if needed

-- Faculty can manage attendance records for their sessions
CREATE POLICY "Faculty manage attendance records" ON public.attendance_records
FOR ALL USING (marked_by = auth.uid());

-- Students can read their own attendance records
CREATE POLICY "Students read own attendance records" ON public.attendance_records
FOR SELECT USING (student_id = auth.uid());

-- Admins can do everything
CREATE POLICY "Admins manage class sessions" ON public.class_sessions
FOR ALL USING (is_admin());

CREATE POLICY "Admins manage attendance records" ON public.attendance_records
FOR ALL USING (is_admin());
