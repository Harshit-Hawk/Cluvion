// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, Mail, Trash2, Save, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const ClubHeadMyClub = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clubDetails, setClubDetails] = useState(null);
  const [members, setMembers] = useState([]);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchClubAndMembers = async () => {
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

        // Fetch club details
        const { data: clubData, error: clubError } = await supabase
          .from('clubs')
          .select('*')
          .eq('id', clubId)
          .single();
        
        if (clubError) throw clubError;
        setClubDetails(clubData);
        setEditDescription(clubData.description || '');

        // Fetch all members of this club
        const { data: membersData, error: memError } = await supabase
          .from('memberships')
          .select('id, role, joined_at, users(full_name, email)')
          .eq('club_id', clubId)
          .order('role', { ascending: true }) // 'head' before 'member' typically, or sort manually
          .order('joined_at', { ascending: false });

        if (memError) throw memError;
        setMembers(membersData || []);

      } catch (err) {
        console.error('Error fetching club details:', err);
        toast.error('Failed to load club information.');
      } finally {
        setLoading(false);
      }
    };

    fetchClubAndMembers();
  }, [user]);

  const handleUpdateDescription = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('clubs')
        .update({ description: editDescription })
        .eq('id', clubDetails.id);

      if (error) throw error;
      
      setClubDetails(prev => ({ ...prev, description: editDescription }));
      setIsEditing(false);
      toast.success('Description updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update description');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMember = async (membershipId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the club?`)) return;

    try {
      const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('id', membershipId);
      if (error) throw error;
      setMembers(prev => prev.filter(m => m.id !== membershipId));
      toast.success(`${memberName} has been removed.`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove member.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent dark:border-blue-400 dark:border-t-transparent"></div>
      </div>
    );
  }

  if (!clubDetails) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">No club details found.</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Premium Hero Header */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 md:p-10 shadow-lg"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex items-center justify-between gap-6">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
              My Club Setup
            </h1>
            <p className="text-indigo-100 font-medium text-lg max-w-2xl opacity-90">
              Manage your club profile, coordinate activities, and oversee your membership roster.
            </p>
          </div>
          
          <div className="hidden md:flex shrink-0 items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white shadow-lg shadow-black/10">
             <Users size={36} />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Club Profile Details */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-100/50 dark:border-gray-800/50 p-6 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 dark:opacity-0 dark:group-hover:opacity-10 bg-indigo-500 blur-2xl transition-all duration-700" />
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-blue-500/30 mb-4 z-10 ring-4 ring-white dark:ring-gray-800">
              {clubDetails.name?.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{clubDetails.name}</h2>
            {clubDetails.faculty_coordinator_name && (
              <div className="mt-3 px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-full border border-purple-100 dark:border-purple-800/50 inline-flex items-center gap-1.5 cursor-default">
                <Shield size={12} /> Coord: {clubDetails.faculty_coordinator_name}
              </div>
            )}
            
            <div className="w-full mt-6 text-left border-t border-gray-50 dark:border-gray-800 pt-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">Edit</button>
                ) : (
                  <button onClick={() => setIsEditing(false)} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium">Cancel</button>
                )}
              </div>
              
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full p-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[100px]"
                      placeholder="Write a welcoming description for your club..."
                    />
                    <button
                      onClick={handleUpdateDescription}
                      disabled={isSaving}
                      className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                      Save Description
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="viewing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      {clubDetails.description || 'No description provided yet.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Membership List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100/50 dark:border-gray-800/50 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Users size={18} className="text-blue-500" /> Member Roster
              </h3>
              <span className="text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full shadow-sm">{members.length} Members</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white dark:bg-gray-900 border-b border-gray-50 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3">Member</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Joined</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 w-max">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-sm shrink-0">
                            {member.users?.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-gray-100">{member.users?.full_name || 'Unknown User'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5 font-medium">
                              <Mail size={12} /> {member.users?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {member.role === 'head' ? (
                          <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg uppercase shadow-sm border border-emerald-200/50 dark:border-emerald-800/50">Club Head</span>
                        ) : (
                          <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg uppercase shadow-sm border border-gray-200/50 dark:border-gray-700/50">Member</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(member.joined_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {member.role !== 'head' && (
                          <button
                            onClick={() => handleRemoveMember(member.id, member.users?.full_name)}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors inline-flex items-center"
                            title="Remove Member"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No members have joined your club yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClubHeadMyClub;
