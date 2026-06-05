'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, XCircle, Clock, Search, MapPin, Calendar, 
  Users, ArrowRight, Trash2, Shield, Filter, Info,
  CheckSquare, Flag, UserCheck, AlertCircle, Eye
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const AdminModeration = () => {
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'clubs' | 'logs'
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    fetchData();
  }, [activeTab, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'events') {
        const { data, error }: any = await supabase
          .from('events')
          .select('*, clubs(name)')
          .eq('status', statusFilter)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setItems(data || []);
      } else if (activeTab === 'clubs') {
        const { data, error }: any = await supabase
          .from('clubs')
          .select('*')
          .eq('status', statusFilter)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setItems(data || []);
      }
    } catch (err) {
      toast.error(`Failed to load ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: any, newStatus: any) => {
    try {
      const table = activeTab === 'events' ? 'events' : 'clubs';
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`${activeTab === 'events' ? 'Event' : 'Club'} ${newStatus === 'active' ? 'Approved' : 'Rejected'}`);
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const filteredItems = items.filter((item: any) => 
    (item.title || item.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.clubs?.name || item.description)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Main Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Moderation Desk</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Verify content and platform applications.</p>
        </div>

        <div className="flex bg-white dark:bg-gray-900 p-1.5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto">
          {[
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'clubs', label: 'Clubs', icon: Flag },
            { id: 'logs', label: 'History', icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
          {['pending', 'active', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === s 
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <motion.div 
            key={activeTab + statusFilter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filteredItems.map((item: any) => (
              <motion.div
                key={item.id}
                layout
                className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
              >
                {/* Visual Flair */}
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full blur-3xl -mr-10 -mt-10 ${activeTab === 'events' ? 'bg-blue-600' : 'bg-emerald-600'}`} />

                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${
                      activeTab === 'events' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {(item.title || item.name)?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white line-clamp-1">{item.title || item.name}</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                        {activeTab === 'events' ? item.clubs?.name : `By Student #${item.head_id?.slice(0,4)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-full">
                    <Clock size={12} className="text-amber-500" />
                    <span className="text-[10px] font-black text-gray-500 uppercase">2h ago</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                    {item.description || 'No detailed description available for this submission.'}
                  </p>
                  
                  {activeTab === 'events' && (
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Calendar size={14} className="text-blue-500" />
                        {item.date ? format(new Date(item.date), 'MMM d, yyyy') : 'TBA'}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <MapPin size={14} className="text-emerald-500" />
                        {item.location || 'Campus'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-800">
                  <button className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
                    <Trash2 size={18} />
                  </button>

                  <div className="flex gap-3">
                    {statusFilter !== 'rejected' && (
                      <button 
                        onClick={() => handleAction(item.id, 'rejected')}
                        className="px-6 py-3 text-xs font-black text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all uppercase tracking-widest"
                      >
                        Decline
                      </button>
                    )}
                    {statusFilter !== 'active' && (
                      <button 
                        onClick={() => handleAction(item.id, 'active')}
                        className={`px-8 py-3 text-white text-xs font-black rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest ${
                          activeTab === 'events' ? 'bg-blue-600 shadow-blue-500/20' : 'bg-emerald-600 shadow-emerald-500/20'
                        }`}
                      >
                        Approve Now
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 py-32 text-center">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckSquare size={40} className="text-gray-200" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">Clear for now!</h3>
            <p className="text-gray-500 mt-2 max-w-xs mx-auto font-medium">
              No pending {activeTab} require your attention. Check back later for new submissions.
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminModeration;
