'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Target, Users, Search, Activity, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

export default function ClubManager() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    faculty_coordinator_name: '',
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClubs();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clubs' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setClubs(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setClubs(prev => prev.filter(c => c.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setClubs(prev => prev.map(c => c.id === payload.new.id ? payload.new : c));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setClubs(data || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      toast.error('Failed to load clubs.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClub.name || !newClub.description) {
      return toast.error('Please fill all required fields.');
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('clubs')
        .insert([{
          name: newClub.name,
          description: newClub.description,
          faculty_coordinator_name: newClub.faculty_coordinator_name || null,
          status: newClub.status
        }]);

      if (error) throw error;

      toast.success('Club created successfully!');
      setIsModalOpen(false);
      setNewClub({ name: '', description: '', faculty_coordinator_name: '', status: 'active' });
    } catch (error) {
      console.error('Error creating club:', error);
      toast.error('Could not create club.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClubs = clubs.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="text-indigo-600" />
            Club Management
          </h2>
          <p className="text-gray-500">Create and oversee all university clubs.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
        >
          <Plus size={20} />
          Create Club
        </button>
      </div>

      <div className="bg-white dark:bg-[#0e0e12] border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search clubs by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0e0e12] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-900 dark:text-white"
            />
          </div>
          <div className="text-sm font-bold text-gray-500">
            Total Clubs: <span className="text-indigo-600 dark:text-indigo-400">{clubs.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading clubs...</div>
        ) : filteredClubs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Target className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Clubs Found</h3>
            <p className="text-gray-500 max-w-sm mt-2">There are currently no clubs matching your search. Create one to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Club Name</th>
                  <th className="p-4 font-bold hidden sm:table-cell">Description</th>
                  <th className="p-4 font-bold">Coordinator</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredClubs.map(club => (
                  <tr key={club.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                          {club.name.charAt(0).toUpperCase()}
                        </div>
                        {club.name}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500 hidden sm:table-cell max-w-xs truncate">
                      {club.description}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {club.faculty_coordinator_name || <span className="italic opacity-50">Not assigned</span>}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        club.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                      }`}>
                        {club.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Club Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative bg-white dark:bg-[#0e0e12] w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Club</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-full p-1.5 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateClub} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Club Name <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={newClub.name}
                    onChange={e => setNewClub({...newClub, name: e.target.value})}
                    placeholder="e.g. Coding Club" 
                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description <span className="text-rose-500">*</span></label>
                  <textarea 
                    required
                    value={newClub.description}
                    onChange={e => setNewClub({...newClub, description: e.target.value})}
                    placeholder="What does this club do?" 
                    rows={3}
                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Faculty Coordinator Name</label>
                  <input 
                    type="text" 
                    value={newClub.faculty_coordinator_name}
                    onChange={e => setNewClub({...newClub, faculty_coordinator_name: e.target.value})}
                    placeholder="e.g. Prof. Alan Turing" 
                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select 
                    value={newClub.status}
                    onChange={e => setNewClub({...newClub, status: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <Save size={18} />
                    )}
                    Create Club
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
