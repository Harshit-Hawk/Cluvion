'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { DashboardContainer, SectionHeader } from '../../components/ui/DashboardLayout';
import { 
  BarChart2, Calendar, CheckCircle, XCircle, Clock, Award
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentAttendance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('attendance_records')
          .select(`
            id,
            status,
            marked_at,
            class_sessions!inner (
              id,
              date,
              topic,
              course_assignments!inner (
                course_id,
                course:course_id(name, code)
              )
            )
          `)
          .eq('student_id', user.id)
          .order('marked_at', { ascending: false });
          
        if (error) throw error;
        setRecords(data || []);
      } catch (error) {
        console.error('Error fetching student attendance:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendance();
  }, [user]);

  // Compute metrics
  const totalClasses = records.length;
  const presentClasses = records.filter(r => r.status === 'present').length;
  const lateClasses = records.filter(r => r.status === 'late').length;
  const absentClasses = records.filter(r => r.status === 'absent').length;
  const overallPercentage = totalClasses > 0 ? Math.round(((presentClasses + lateClasses) / totalClasses) * 100) : 0;

  // Group by course
  const subjectMap = new Map();
  records.forEach(r => {
    const session = r.class_sessions;
    if (!session) return;
    
    // In our query, course_assignments is an array if joined, or an object if inner joined 1:1. 
    // Wait, assignment_id is a foreign key on class_sessions, so course_assignments is an object.
    const courseObj = session.course_assignments?.course;
    if (!courseObj) return;
    
    const courseId = session.course_assignments.course_id;
    
    if (!subjectMap.has(courseId)) {
      subjectMap.set(courseId, {
        name: courseObj.name,
        code: courseObj.code,
        total: 0,
        present: 0
      });
    }
    const subj = subjectMap.get(courseId);
    subj.total += 1;
    if (r.status === 'present' || r.status === 'late') {
      subj.present += 1;
    }
  });

  const subjectStats = Array.from(subjectMap.values());

  return (
    <DashboardContainer className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Academic Attendance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Track your class presence and stay above the 75% threshold.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
          className="md:col-span-1 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <p className="text-sm font-bold text-white/80 uppercase tracking-wider mb-2">Overall</p>
          <div className="flex items-end gap-2 mb-2">
            <h2 className="text-5xl font-black leading-none">{overallPercentage}%</h2>
          </div>
          <p className="text-xs text-white/70">
            {overallPercentage >= 75 ? 'You are doing great! Keep it up.' : 'Warning: Below 75% minimum requirement.'}
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none mb-1">{presentClasses}</h3>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Present</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
              <Clock size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none mb-1">{lateClasses}</h3>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Late</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
              <XCircle size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none mb-1">{absentClasses}</h3>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Absent</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Subject wise breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader title="Subject Wise Attendance" />
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4">
            {loading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ) : subjectStats.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <BarChart2 size={32} className="mx-auto mb-3 opacity-30" />
                <p>No attendance records found.</p>
              </div>
            ) : (
              subjectStats.map((subj, idx) => {
                const percentage = Math.round((subj.present / subj.total) * 100);
                const isWarning = percentage < 75;
                
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white">{subj.name}</span>
                        <span className="text-gray-400 ml-2 text-xs">({subj.code})</span>
                      </div>
                      <span className={`font-black ${isWarning ? 'text-rose-600' : 'text-emerald-600'}`}>{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden flex">
                      <div 
                        className={`h-2.5 rounded-full ${isWarning ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-gray-400 text-right">
                      {subj.present}/{subj.total} Classes Attended
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Classes */}
        <div className="lg:col-span-1 space-y-4">
          <SectionHeader title="Recent Sessions" />
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-1">
            {records.slice(0, 10).map((r, i) => {
              const isPresent = r.status === 'present' || r.status === 'late';
              const courseName = r.class_sessions?.course_assignments?.course?.name || 'Unknown Subject';
              const date = new Date(r.class_sessions?.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              
              return (
                <div key={r.id} className="flex items-center gap-4 p-4 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isPresent 
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                  }`}>
                    {isPresent ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{courseName}</p>
                    <p className="text-xs text-gray-500 truncate">{r.class_sessions?.topic || 'Daily Lecture'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-gray-400">{date}</p>
                    <p className={`text-[10px] font-bold uppercase mt-0.5 ${isPresent ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {r.status}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {records.length === 0 && !loading && (
              <div className="p-8 text-center text-gray-500 text-sm">
                No recent activity.
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardContainer>
  );
}
