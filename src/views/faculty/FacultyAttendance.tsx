'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { DashboardContainer, SectionHeader } from '../../components/ui/DashboardLayout';
import { 
  Users, Check, X, Calendar, Clock,
  ArrowRight, Save, Search, CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

interface CourseAssignment {
  id: string;
  batch: string;
  semester: number;
  section: string;
  course: { name: string; code: string; };
}

interface Student {
  id: string;
  full_name: string;
  roll_no: string;
  avatar_url: string;
}

export default function FacultyAttendance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  
  const [selectedAssignment, setSelectedAssignment] = useState<CourseAssignment | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [topic, setTopic] = useState('');
  
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('course_assignments')
          .select(`id, batch, semester, section, course:course_id(name, code)`)
          .eq('faculty_id', user.id);
        
        if (error) throw error;
        setAssignments((data || []) as unknown as CourseAssignment[]);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [user]);

  const loadStudents = async (assignment: CourseAssignment) => {
    setSelectedAssignment(assignment);
    setTopic('');
    setAttendance({});
    try {
      setFetchingStudents(true);
      // Fetch students matching the batch, semester, and section
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, roll_no, avatar_url')
        .eq('role', 'student')
        .eq('batch', assignment.batch)
        .eq('semester', assignment.semester)
        .eq('section', assignment.section)
        .order('roll_no', { ascending: true });
        
      if (error) throw error;
      
      const studentsList = data || [];
      setStudents(studentsList);
      
      // Default everyone to present
      const defaultAtt: Record<string, 'present'> = {};
      studentsList.forEach(s => {
        defaultAtt[s.id] = 'present';
      });
      setAttendance(defaultAtt as any);
      
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students for this class.');
    } finally {
      setFetchingStudents(false);
    }
  };

  const toggleStatus = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const markAll = (status: 'present' | 'absent') => {
    const newAtt: Record<string, any> = {};
    students.forEach(s => {
      newAtt[s.id] = status;
    });
    setAttendance(newAtt);
  };

  const handleSaveAttendance = async () => {
    if (!selectedAssignment || students.length === 0 || !user) return;
    
    try {
      setSaving(true);
      
      // 1. Create Class Session
      const { data: sessionData, error: sessionError } = await supabase
        .from('class_sessions')
        .insert({
          assignment_id: selectedAssignment.id,
          topic: topic || 'Daily Lecture',
          date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();
        
      if (sessionError) throw sessionError;
      
      // 2. Create Attendance Records
      const records = students.map(s => ({
        session_id: sessionData.id,
        student_id: s.id,
        status: attendance[s.id] || 'absent',
        marked_by: user.id
      }));
      
      const { error: recordsError } = await supabase
        .from('attendance_records')
        .insert(records);
        
      if (recordsError) throw recordsError;
      
      // Award Gamification XP asynchronously using pg_net or edge function if available, 
      // but for now we skip or mock. Let's just award a toast for now.
      
      toast.success(`Successfully saved attendance for ${students.length} students!`);
      
      // Reset view
      setSelectedAssignment(null);
      setStudents([]);
      
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      toast.error(error.message || 'Failed to save attendance records.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardContainer className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Mark Attendance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Select a class to record daily attendance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COL: Class Selector */}
        <div className="lg:col-span-1 space-y-4">
          <SectionHeader title="Your Classes" />
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-3 space-y-2 shadow-sm">
            {loading ? (
              <div className="p-4 text-center text-gray-400 animate-pulse">Loading classes...</div>
            ) : assignments.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">No classes assigned yet.</div>
            ) : (
              assignments.map(assignment => (
                <button
                  key={assignment.id}
                  onClick={() => loadStudents(assignment)}
                  className={`w-full text-left p-4 rounded-xl transition-all border ${
                    selectedAssignment?.id === assignment.id 
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50 ring-1 ring-purple-500' 
                    : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <h4 className={`font-bold text-sm ${selectedAssignment?.id === assignment.id ? 'text-purple-700 dark:text-purple-400' : 'text-gray-900 dark:text-white'}`}>
                    {assignment.course?.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                    <span>Sem {assignment.semester}</span>•
                    <span>Sec {assignment.section}</span>•
                    <span>Batch {assignment.batch}</span>
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COL: Attendance Register */}
        <div className="lg:col-span-2 space-y-4">
          {selectedAssignment ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)] min-h-[600px]"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    {selectedAssignment.course?.name} - Section {selectedAssignment.section}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date().toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Users size={14} /> {students.length} Enrolled</span>
                  </div>
                </div>
                <div className="w-full sm:w-auto">
                  <input 
                    type="text" 
                    placeholder="Topic / Lecture No (Optional)" 
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    className="w-full sm:w-64 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bulk Actions</span>
                <div className="flex gap-2">
                  <button onClick={() => markAll('present')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors">Mark All Present</button>
                  <button onClick={() => markAll('absent')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors">Mark All Absent</button>
                </div>
              </div>

              {/* Student List */}
              <div className="flex-1 overflow-y-auto p-2">
                {fetchingStudents ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
                    <p>Loading roster...</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                    <Users size={48} className="mb-4 opacity-20" />
                    <p className="font-bold text-gray-600 dark:text-gray-300">No Students Found</p>
                    <p className="text-sm mt-2 max-w-xs">There are no students matching Batch {selectedAssignment.batch}, Semester {selectedAssignment.semester}, Section {selectedAssignment.section}.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {students.map(student => (
                      <div key={student.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                            {student.avatar_url ? (
                              <img src={student.avatar_url} alt={student.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">{student.full_name?.charAt(0)}</div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{student.full_name}</p>
                            <p className="text-xs text-gray-500 font-mono">{student.roll_no || 'No Roll No'}</p>
                          </div>
                        </div>
                        
                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                          <button
                            onClick={() => toggleStatus(student.id, 'present')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                              attendance[student.id] === 'present'
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                            }`}
                          >
                            <Check size={14} /> P
                          </button>
                          <button
                            onClick={() => toggleStatus(student.id, 'late')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                              attendance[student.id] === 'late'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                            }`}
                          >
                            L
                          </button>
                          <button
                            onClick={() => toggleStatus(student.id, 'absent')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                              attendance[student.id] === 'absent'
                              ? 'bg-rose-500 text-white shadow-sm'
                              : 'text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                            }`}
                          >
                            <X size={14} /> A
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer / Submit */}
              {students.length > 0 && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center">
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Present</p>
                      <p className="text-lg font-black text-emerald-600">{Object.values(attendance).filter(v => v === 'present').length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Absent</p>
                      <p className="text-lg font-black text-rose-600">{Object.values(attendance).filter(v => v === 'absent').length}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSaveAttendance}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Submit Register'}
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="h-64 sm:h-96 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <CheckSquare size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Class Selected</h3>
              <p className="text-sm text-gray-500 max-w-sm">Select one of your assigned classes from the left menu to start marking attendance for today.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardContainer>
  );
}
