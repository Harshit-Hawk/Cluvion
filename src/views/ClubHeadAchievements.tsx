'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Award, Plus, User, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const ClubHeadAchievements = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [managedClubId, setManagedClubId] = useState<any>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newAchievement, setNewAchievement] = useState<any>({ title: '', points: 10, user_id: '' });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        const { data: memberData } = await supabase
          .from('memberships')
          .select('club_id')
          .eq('user_id', user.id)
          .eq('role', 'head')
          .single();

        if (!memberData) {
          toast.warning("You aren't assigned as a head to any club yet.");
          setLoading(false);
          return;
        }

        const clubId = memberData.club_id;
        setManagedClubId(clubId);

        // Fetch all achievements granted by this club
        const { data: achData, error: achError } = await supabase
          .from('achievements')
          .select('id, title, points, created_at, users(full_name)')
          .eq('club_id', clubId)
          .order('created_at', { ascending: false });

        if (achError) throw achError;
        setAchievements(achData || []);

        // Fetch club members to populate the dropdown
        const { data: membersData, error: memError } = await supabase
          .from('memberships')
          .select('user_id, users(full_name)')
          .eq('club_id', clubId)
          .eq('role', 'member'); // Only grant to members ideally

        if (memError) throw memError;
        setMembers(membersData || []);

      } catch (err) {
        console.error('Error fetching achievements:', err);
        toast.error('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleGrantAchievement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!managedClubId || !newAchievement.user_id) {
       return toast.warning('Please select a member.');
    }

    setIsSaving(true);
    try {
      const { data, error }: any = await supabase
        .from('achievements')
        .insert({
          club_id: managedClubId,
          user_id: newAchievement.user_id,
          title: newAchievement.title,
          points: Number(newAchievement.points),
          granted_by: user!.id
        })
        .select('*, users(full_name)')
        .single();
        
      if (error) throw error;

      // 2. Insert into activity_logs automatically so scores update
      await supabase.from('activity_logs').insert({
         user_id: newAchievement.user_id,
         action_type: 'achievement_earned',
          points_awarded: Number(newAchievement.points)
      });

      setAchievements(prev => [data, ...prev]);
      toast.success('Achievement granted successfully!');
      setIsModalOpen(false);
      setNewAchievement({ title: '', points: 10, user_id: '' });
    } catch (err) {
      toast.error('Error granting achievement.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAchievement = async (achId: any, achTitle: any) => {
     if (!window.confirm(`Are you sure you want to revoke the "${achTitle}" achievement? (Points will not be automatically deducted from activity logs)`)) return;

     try {
        const { error } = await supabase
          .from('achievements')
          .delete()
          .eq('id', achId);
        if (error) throw error;
        setAchievements(prev => prev.filter(a => a.id !== achId));
        toast.success(`Achievement revoked.`);
     } catch (err) {
        toast.error('Failed to revoke achievement.');
        console.error(err);
     }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent dark:border-blue-400 dark:border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Premium Hero Header */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-8 md:p-10 shadow-lg"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 flex items-center justify-center md:justify-start gap-3">
              <Award size={40} className="hidden md:block opacity-90" />
              Achievements Board
            </h1>
            <p className="text-amber-50 font-medium text-lg max-w-2xl opacity-90">
              Reward your club members with points, titles, and public recognition.
            </p>
          </div>
          
          {managedClubId && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="shrink-0 bg-white text-orange-600 px-6 py-3.5 rounded-full font-bold hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2 group"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Grant Award
            </button>
          )}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-100/50 dark:border-gray-800/50 overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-gray-100/50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-gray-800/30 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Granted Achievements Roster</h3>
          <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full shadow-sm">{achievements.length} Total</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-transparent border-b border-gray-100/50 dark:border-gray-800/50 text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3">Achievement Title</th>
                <th className="px-6 py-3">Awarded To</th>
                <th className="px-6 py-3">Points</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {achievements.length > 0 ? (
                achievements.map((ach: any) => (
                  <tr key={ach.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors group">
                    <td className="px-6 py-5 font-bold text-gray-900 dark:text-gray-100 text-base">{ach.title}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold shadow-sm">
                            {ach.users?.full_name?.charAt(0) || <User size={14} />}
                         </div>
                         <span className="font-semibold text-gray-800 dark:text-gray-200">{ach.users?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 text-orange-700 dark:text-orange-400 font-bold px-3 py-1.5 rounded-lg text-xs border border-orange-200/50 dark:border-orange-800/50 shadow-sm">+{ach.points} Pts</span>
                    </td>
                    <td className="px-6 py-5 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                      {new Date(ach.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-5 text-right">
                       <button
                         onClick={() => handleDeleteAchievement(ach.id, ach.title)}
                         className="text-red-500 hover:text-red-600 dark:hover:text-red-400 p-2 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all inline-flex items-center shadow-sm"
                         title="Revoke Achievement"
                       >
                         <Trash2 size={16} />
                       </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No achievements have been granted yet. Click "Grant Achievement" to reward a member.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Basic Modal for New Achievement */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20 dark:border-gray-800/50"
            >
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600 mb-1">Grant Achievement</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Select a member and reward them with official points.</p>
              
              <form onSubmit={handleGrantAchievement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Achievement Title</label>
                  <input required type="text" className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                    placeholder="e.g. Best Hacker, Outstanding Leadership"
                    value={newAchievement.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAchievement({...newAchievement, title: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Select Member</label>
                  <select required className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                     value={newAchievement.user_id} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewAchievement({...newAchievement, user_id: e.target.value})}>
                     <option value="" disabled>-- Select a club member --</option>
                     {members.map((m: any) => (
                        <option key={m.user_id} value={m.user_id}>{m.users?.full_name}</option>
                     ))}
                  </select>
                  {members.length === 0 && <p className="text-xs text-red-500 dark:text-red-400 mt-1">You have no active members to reward.</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Points to Award</label>
                  <div className="flex items-center gap-3">
                     {[10, 25, 50, 100].map(pt => (
                        <button 
                           key={pt}
                           type="button" 
                           onClick={() => setNewAchievement({...newAchievement, points: pt})}
                           className={`flex-1 py-2 font-bold text-sm rounded-lg border transition-colors ${newAchievement.points === pt ? 'bg-amber-50 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700/50 text-amber-700 dark:text-amber-400' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                           +{pt}
                        </button>
                     ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                     <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Custom Points:</span>
                     <input type="number" min="1" max="1000" className="w-24 p-1 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md text-sm text-center" 
                      value={newAchievement.points} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAchievement({...newAchievement, points: e.target.value})} />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-gray-50 dark:border-gray-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSaving} className="flex-1 py-2.5 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent dark:border-gray-700 rounded-xl font-medium transition-colors text-sm">Cancel</button>
                  <button type="submit" disabled={isSaving || members.length===0} className="flex-1 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-medium disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-2">
                    {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Award size={16} />}
                    Grant to Member
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClubHeadAchievements;
