-- Migration: 20260603_rbac_erp_base.sql
-- Description: Expands user roles to support 6 full ERP roles and adds core ERP fields to users.

-- 1. Expand `user_role` Enum (safe addition)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'college_admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'faculty';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'club_coordinator';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'placement_officer';

-- 2. Expand `users` table with core ERP fields
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS semester int,
ADD COLUMN IF NOT EXISTS batch text,
ADD COLUMN IF NOT EXISTS section text,
ADD COLUMN IF NOT EXISTS phone text;

-- 3. Create Departments Table (Module 1 foundation)
CREATE TABLE IF NOT EXISTS public.departments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    code text UNIQUE NOT NULL,
    head_of_department_id uuid REFERENCES public.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    department_id uuid REFERENCES public.departments(id) ON DELETE CASCADE,
    name text NOT NULL,
    code text UNIQUE NOT NULL,
    credits int DEFAULT 3,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies for Departments & Courses
-- Everyone can read
CREATE POLICY "Departments are viewable by everyone" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Courses are viewable by everyone" ON public.courses FOR SELECT USING (true);

-- Only admins can modify
CREATE POLICY "Admins can insert departments" ON public.departments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND role::text IN ('super_admin', 'college_admin'))
);
CREATE POLICY "Admins can update departments" ON public.departments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND role::text IN ('super_admin', 'college_admin'))
);
CREATE POLICY "Admins can delete departments" ON public.departments FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND role::text IN ('super_admin', 'college_admin'))
);

CREATE POLICY "Admins can insert courses" ON public.courses FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND role::text IN ('super_admin', 'college_admin'))
);
CREATE POLICY "Admins can update courses" ON public.courses FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND role::text IN ('super_admin', 'college_admin'))
);
CREATE POLICY "Admins can delete courses" ON public.courses FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND role::text IN ('super_admin', 'college_admin'))
);
