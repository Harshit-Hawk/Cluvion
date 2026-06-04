'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { DashboardContainer, SectionHeader } from '../components/ui/DashboardLayout';
import { 
  Users, BookOpen, Calendar, Clock, 
  ChevronRight, CheckCircle, FileText, ArrowRight,
  UserCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface CourseAssignment {
  id: string;
  batch: string;
  semester: number;
  section: string;
  course: {
    name: string;
    code: string;
  };
}

const StatCard = ({ title, value, subtitle, icon: Icon, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={20} />
      </div>
    </div>
    <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none mb-1">{value}</h3>
    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{title}</p>
    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{subtitle}</p>
  </motion.div>
);

const QuickActionCard = ({ href, icon: Icon, iconColor, title, subtitle, cta, gradient = false }: any) => {
  const base = gradient
    ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-500/20'
    : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:border-purple-200 dark:hover:border-purple-900/50';

  return (
    <Link href={href} className={`group block p-5 rounded-2xl transition-all relative overflow-hidden ${base}`}>
      {gradient && <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />}
      <Icon className={`mb-4 ${gradient ? 'text-white/80' : iconColor} group-hover:scale-110 transition-transform duration-300`} size={28} />
      <h4 className={`font-bold mb-1 text-lg ${gradient ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{title}</h4>
      <p className={`text-sm ${gradient ? 'text-white/70' : 'text-gray-500'} mb-4 leading-relaxed`}>{subtitle}</p>
      <div className={`flex items-center text-sm font-bold gap-1 ${gradient ? 'text-white/90' : 'text-purple-600 dark:text-purple-400'}`}>
        {cta} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};

export default function FacultyDashboard() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);

  useEffect(() => {
    const fetchFacultyData = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('course_assignments')
          .select(`
            id,
            batch,
            semester,
            section,
            course:course_id (
              name,
              code
            )
          `)
          .eq('faculty_id', user.id);
        
        if (error) throw error;
        setAssignments((data || []) as unknown as CourseAssignment[]);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFacultyData();
  }, [user]);

  return (
    <DashboardContainer className="space-y-6 pb-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Faculty Hub</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Manage your classes and academic duties.</p>
        </div>
      </div>

      {/* ── Stat Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Assigned Classes" 
          value={loading ? '-' : assignments.length} 
          subtitle="Active courses this semester"
          icon={BookOpen} 
          color="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
          delay={0.1} 
        />
        <StatCard 
          title="Total Students" 
          value={loading ? '-' : (assignments.length * 60)} // Dummy multiplier for now
          subtitle="Across all your sections"
          icon={Users} 
          color="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" 
          delay={0.2} 
        />
        <StatCard 
          title="Avg. Attendance" 
          value="87%" 
          subtitle="Up 2% from last week"
          icon={CheckCircle} 
          color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
          delay={0.3} 
        />
        <StatCard 
          title="Pending Reports" 
          value="3" 
          subtitle="Mid-term evaluations"
          icon={FileText} 
          color="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" 
          delay={0.4} 
        />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: Quick Actions & Schedule */}
        <div className="lg:col-span-1 space-y-6">
          <SectionHeader title="Quick Actions" />
          <div className="flex flex-col gap-4">
            <QuickActionCard
              href="/faculty/attendance"
              icon={UserCheck}
              title="Mark Attendance"
              subtitle="Record daily attendance for your active sections using QR or manual."
              cta="Open Register"
              gradient
            />
            <QuickActionCard
              href="/faculty/classes"
              icon={BookOpen}
              iconColor="text-blue-500"
              title="Course Material"
              subtitle="Upload notes, assignments, and grades for your students."
              cta="Manage Content"
            />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
             <div className="flex items-center justify-between mb-4">
               <SectionHeader title="Today's Schedule" />
               <Calendar size={18} className="text-gray-400" />
             </div>
             <div className="space-y-4">
               {/* Dummy Schedule for aesthetics */}
               <div className="flex gap-4 border-l-2 border-purple-500 pl-4 py-1">
                 <div className="w-16 flex-shrink-0 text-sm font-bold text-gray-900 dark:text-white">09:00 AM</div>
                 <div>
                   <p className="text-sm font-bold text-gray-900 dark:text-white">Data Structures</p>
                   <p className="text-xs text-gray-500">Section A • Room 304</p>
                 </div>
               </div>
               <div className="flex gap-4 border-l-2 border-emerald-500 pl-4 py-1">
                 <div className="w-16 flex-shrink-0 text-sm font-bold text-gray-900 dark:text-white">11:30 AM</div>
                 <div>
                   <p className="text-sm font-bold text-gray-900 dark:text-white">Algorithms Lab</p>
                   <p className="text-xs text-gray-500">Batch 2026 • Lab 1</p>
                 </div>
               </div>
               <div className="flex gap-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4 py-1 opacity-60">
                 <div className="w-16 flex-shrink-0 text-sm font-bold text-gray-900 dark:text-white">02:00 PM</div>
                 <div>
                   <p className="text-sm font-bold text-gray-900 dark:text-white">Faculty Meeting</p>
                   <p className="text-xs text-gray-500">Conference Hall</p>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* RIGHT: My Classes */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader title="My Active Classes" subtitle="Courses assigned to you this semester" />
          
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 animate-pulse">Loading classes...</div>
            ) : assignments.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <BookOpen size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No classes assigned</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
                  You haven't been assigned any courses for this semester yet. Contact your department head if this is a mistake.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {assignments.map((assignment) => (
                  <Link 
                    key={assignment.id} 
                    href={`/faculty/classes/${assignment.id}`}
                    className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-lg border border-purple-100 dark:border-purple-800/50 group-hover:scale-105 transition-transform">
                        {assignment.course?.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {assignment.course?.name} 
                          <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">
                            {assignment.course?.code}
                          </span>
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                          Sem {assignment.semester} • Section {assignment.section} • Batch {assignment.batch}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block text-right mr-4">
                        <p className="text-xs font-bold text-gray-400 uppercase">Students</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">~60</p>
                      </div>
                      <ChevronRight size={20} className="text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardContainer>
  );
}
