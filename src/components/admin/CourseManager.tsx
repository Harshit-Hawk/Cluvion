'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { Plus, BookOpen, Save, X, Edit2, Trash2 } from 'lucide-react';

export default function CourseManager() {
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', code: '', department_id: '', credits: 3 });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [coursesRes, deptsRes] = await Promise.all([
      supabase.from('courses').select('*, departments(name)').order('name'),
      supabase.from('departments').select('id, name').order('name')
    ]);
    if (!coursesRes.error) setCourses(coursesRes.data);
    if (!deptsRes.error) setDepartments(deptsRes.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.department_id) return toast.error('Please fill all required fields');

    const payload = {
      name: formData.name,
      code: formData.code,
      department_id: formData.department_id,
      credits: Number(formData.credits)
    };

    if (editingId) {
      const { error } = await supabase.from('courses').update(payload).eq('id', editingId);
      if (error) toast.error(error.message);
      else toast.success('Course updated');
    } else {
      const { error } = await supabase.from('courses').insert([payload]);
      if (error) toast.error(error.message);
      else toast.success('Course created');
    }

    setShowForm(false);
    setFormData({ name: '', code: '', department_id: '', credits: 3 });
    setEditingId(null);
    fetchData();
  };

  const handleEdit = (course: any) => {
    setFormData({ 
      name: course.name, 
      code: course.code, 
      department_id: course.department_id, 
      credits: course.credits 
    });
    setEditingId(course.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Course deleted');
      fetchData();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Courses</h2>
            <p className="text-sm text-gray-500">{courses.length} registered courses</p>
          </div>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', code: '', department_id: '', credits: 3 }); }}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md shadow-orange-500/20"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'New Course'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Course Name</label>
            <input 
              type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Data Structures" 
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Course Code</label>
            <input 
              type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. CS201" 
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Department</label>
            <select 
              value={formData.department_id} onChange={e => setFormData({ ...formData, department_id: e.target.value })}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value="">Select Department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Credits</label>
            <input 
              type="number" min="1" max="10" value={formData.credits} onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div className="md:col-span-2 flex justify-end mt-2">
            <button type="submit" className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
              <Save size={16} /> Save Course
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No courses found. Create one above.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Code</th>
                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Department</th>
                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Credits</th>
                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                  <td className="py-4 font-semibold text-gray-900 dark:text-gray-100">{course.name}</td>
                  <td className="py-4 font-mono text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md w-fit inline-block mt-3">{course.code}</td>
                  <td className="py-4 text-gray-600 dark:text-gray-400 text-sm">{course.departments?.name}</td>
                  <td className="py-4 text-gray-900 dark:text-gray-100 font-semibold">{course.credits}</td>
                  <td className="py-4 text-right">
                    <button onClick={() => handleEdit(course)} className="p-2 text-gray-400 hover:text-orange-600 transition-colors inline-block mr-2"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(course.id)} className="p-2 text-gray-400 hover:text-rose-600 transition-colors inline-block"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
