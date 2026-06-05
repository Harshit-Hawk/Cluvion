'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, Send, Trash2, Calendar, Users, Eye, 
  MessageSquare, Star, Info, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { format, formatDistanceToNow } from 'date-fns';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMsg, setNewMsg] = useState({
    title: '',
    message: '',
    type: 'announcement', // 'announcement', 'event', 'points', 'achievement'
    target: 'all' // 'all', 'students', 'club_heads'
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data, error }: any = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'announcement')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMsg.title || !newMsg.message) return;

    setIsSending(true);
    try {
      // 1. Get all users for the target group
      let query = supabase.from('users').select('id');
      if (newMsg.target === 'students') query = query.eq('role', 'student');
      if (newMsg.target === 'club_heads') query = query.eq('role', 'club_head');
      
      const { data: targetUsers, error: userError }: any = await query;
      if (userError) throw userError;

      // 2. Insert notifications for all target users
      const notifications = targetUsers.map((u: any) => ({
        user_id: u.id,
        title: newMsg.title,
        message: newMsg.message,
        type: newMsg.type,
        is_read: false
      }));

      const { error }: any = await supabase.from('notifications').insert(notifications);
      if (error) throw error;

      toast.success('Broadcast sent successfully!');
      setNewMsg({ title: '', message: '', type: 'announcement', target: 'all' });
      fetchAnnouncements();
    } catch (err: any) {
      toast.error('Failed to send broadcast');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Platform Announcements</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Broadcast messages to the entire campus or specific groups.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compose Section */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm sticky top-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                <Send size={24} />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">New Broadcast</h3>
            </div>

            <form onSubmit={handleSend} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Announcement Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Campus Holiday Notice"
                  value={newMsg.title}
                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMsg({...newMsg, title: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Message Body</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Tell students what's happening..."
                  value={newMsg.message}
                   onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewMsg({...newMsg, message: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                  <select 
                    value={newMsg.type}
                     onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewMsg({...newMsg, type: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="event">Event Alert</option>
                    <option value="points">XP Reward</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Target Group</label>
                  <select 
                    value={newMsg.target}
                     onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewMsg({...newMsg, target: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold"
                  >
                    <option value="all">Everyone</option>
                    <option value="students">Students Only</option>
                    <option value="club_heads">Club Heads</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSending || !newMsg.title || !newMsg.message}
                className="w-full py-4 bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/10 active:scale-95 flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Send Broadcast <Send size={18} /></>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8">Broadcast History</h3>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-50 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
              </div>
            ) : announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((msg) => (
                  <div key={msg.id} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-800 group hover:bg-white dark:hover:bg-gray-800 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
                          <Bell size={16} className="text-blue-500" />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{msg.title}</h4>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 pl-11 mb-4">{msg.message}</p>
                    <div className="flex items-center gap-4 pl-11">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <Eye size={12} /> 124 Views
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <Users size={12} /> All Target
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                <MessageSquare className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-500 font-bold">No announcements sent yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncements;
