'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { Plus, Building2, Save, X, Edit2, Trash2 } from 'lucide-react';

export default function DepartmentManager() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('departments').select('*').order('name');
    if (!error && data) setDepartments(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return toast.error('Name and Code are required');

    if (editingId) {
      const { error } = await supabase.from('departments').update({
        name: formData.name, code: formData.code
      }).eq('id', editingId);
      
      if (error) toast.error(error.message);
      else toast.success('Department updated');
    } else {
      const { error } = await supabase.from('departments').insert([{
        name: formData.name, code: formData.code
      }]);
      
      if (error) toast.error(error.message);
      else toast.success('Department created');
    }

    setShowForm(false);
    setFormData({ name: '', code: '' });
    setEditingId(null);
    fetchDepartments();
  };

  const handleEdit = (dept: any) => {
    setFormData({ name: dept.name, code: dept.code });
    setEditingId(dept.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Department deleted');
      fetchDepartments();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Departments</h2>
            <p className="text-sm text-gray-500">{departments.length} registered departments</p>
          </div>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', code: '' }); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md shadow-indigo-500/20"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'New Department'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Department Name</label>
            <input 
              type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Computer Science" 
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Department Code</label>
            <input 
              type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. CSE" 
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="md:col-span-2 flex justify-end mt-2">
            <button type="submit" className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
              <Save size={16} /> Save Department
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : departments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No departments found. Create one above.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Code</th>
                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                  <td className="py-4 font-semibold text-gray-900 dark:text-gray-100">{dept.name}</td>
                  <td className="py-4 font-mono text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md w-fit inline-block mt-3">{dept.code}</td>
                  <td className="py-4 text-right">
                    <button onClick={() => handleEdit(dept)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors inline-block mr-2"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(dept.id)} className="p-2 text-gray-400 hover:text-rose-600 transition-colors inline-block"><Trash2 size={16} /></button>
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
