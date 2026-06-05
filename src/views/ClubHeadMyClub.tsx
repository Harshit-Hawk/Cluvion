'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, Mail, Trash2, Save, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const ClubHeadMyClub = () => {
  const { user, sessionReady } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clubDetails, setClubDetails] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Wait until auth session is confirmed before querying
    if (!sessionReady) return;
    if (!user) { setLoading(false); return; }

    let cancelled = false;

    const withTimeout = (promise: any, ms = 8000) =>
      Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Query timed out')), ms)
        ),
      ]);

    const fetchClubAndMembers = async () => {
      setLoading(true);

      try {
        // Use maybeSingle() — returns null (not error) when 0 rows found
        const { data: memberData, error: headError }: any = await withTimeout(
          supabase
            .from('memberships')
            .select('club_id')
            .eq('user_id', user.id)
            .eq('role', 'head')
            .maybeSingle()
        );

        if (cancelled) return;

        if (headError) throw headError;

        if (!memberData) {
          // User is logged in but not a club head — show empty state, don't error
          setLoading(false);
          return;
        }

        const clubId = memberData.club_id;

        // Fetch club details + members + applications in parallel
        const [clubRes, membersRes, appsRes]: any[] = await withTimeout(
          Promise.all([
            supabase.from('clubs').select('*').eq('id', clubId).maybeSingle(),
            supabase
              .from('memberships')
              .select('id, role, joined_at, users(id, full_name, email, avatar_url)')
              .eq('club_id', clubId)
              .order('role', { ascending: true })
              .order('joined_at', { ascending: false }),
            supabase
              .from('club_recruitment')
              .select('id, message, created_at, users(id, full_name, email, avatar_url, roll_no)')
              .eq('club_id', clubId)
              .eq('status', 'pending')
              .order('created_at', { ascending: false }),
          ])
        );

        if (cancelled) return;

        if (clubRes.error) throw clubRes.error;
        if (membersRes.error) throw membersRes.error;
        if (appsRes.error) throw appsRes.error;

        setClubDetails(clubRes.data);
        setEditDescription(clubRes.data?.description || '');
        setMembers(membersRes.data || []);
        setApplications(appsRes.data || []);

      } catch (err: any) {
        if (cancelled) return;
        console.error('Error fetching club details:', err);
        const isTimeout = err?.message?.includes('timed out');
        toast.error(isTimeout ? 'Connection timed out — please refresh' : 'Failed to load club information.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchClubAndMembers();
    return () => { cancelled = true; };
  }, [user, sessionReady]);

  const handleUpdateDescription = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('clubs')
        .update({ description: editDescription })
        .eq('id', clubDetails.id);

      if (error) throw error;
      
      setClubDetails((prev: any) => ({ ...prev, description: editDescription }));
      setIsEditing(false);
      toast.success('Description updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update description');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMember = async (membershipId: any, memberName: any) => {
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

  const handleProcessApplication = async (appId: any, studentId: any, action: any) => {
    try {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      const { error } = await supabase.from('club_recruitment').update({ status: newStatus }).eq('id', appId);
      if (error) throw error;

      if (action === 'approve') {
        const { error: insertError } = await supabase.from('memberships').insert({
          club_id: clubDetails.id,
          user_id: studentId,
          role: 'member'
        });
        if (insertError) throw insertError;
        toast.success('Application approved. Member added to roster.');
      } else {
        toast.success('Application rejected.');
      }
      
      // Remove from pending list
      setApplications(prev => prev.filter(a => a.id !== appId));
      // Refresh member list if approved (simplest way is to reload but we can manually append)
      if (action === 'approve') {
        // Just trigger a re-fetch of members if possible, or trust user to refresh
      }
      
    } catch (err) {
      toast.error('Failed to process application');
    }
  };

  const handlePromoteMember = async (membershipId: any, memberName: any) => {
    if (!window.confirm(`Promote ${memberName} to Core Team?`)) return;
    try {
      const { error } = await supabase.from('memberships').update({ role: 'core' }).eq('id', membershipId);
      if (error) throw error;
      setMembers(prev => prev.map(m => m.id === membershipId ? { ...m, role: 'core' } : m));
      toast.success(`${memberName} promoted to Core Team.`);
    } catch (err) {
      toast.error('Promotion failed.');
    }
  };

  if (!sessionReady || loading) {
    return (
      <div className="space-y-4 max-w-6xl mx-auto animate-pulse">
        {/* Header skeleton */}
        <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="lg:col-span-2 h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!clubDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center px-6">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Users size={24} className="text-gray-400" />
        </div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">No Club Assigned</h2>
        <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
          You are not assigned as Head for any club. Contact an admin to configure your permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Compact Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-5 shadow-md"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="text-white min-w-0">
            <h1 className="text-xl font-black tracking-tight mb-0.5">Club Members</h1>
            <p className="text-indigo-100 text-xs font-medium opacity-90 truncate">
              Manage your club profile and membership roster
            </p>
          </div>
          <div className="flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 flex items-center justify-center text-white">
            <Users size={20} />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Club Profile Details */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 space-y-4"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-blue-500/30 mb-4 ring-4 ring-white dark:ring-gray-800">
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
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditDescription(e.target.value)}
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

        {/* Right Column - Membership List & Applications */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="lg:col-span-2 flex flex-col gap-4"
        >
          {applications.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-amber-50 dark:bg-amber-900/10">
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-500 flex items-center gap-2">
                  <Mail size={16} /> Pending Applications
                </h3>
                <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-2.5 py-1 rounded-full">{applications.length} New</span>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-80 overflow-y-auto">
                {applications.map((app: any) => (
                  <div key={app.id} className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{app.users?.full_name}</p>
                      <p className="text-xs text-gray-500 font-mono mb-2">{app.users?.roll_no}</p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg italic">
                        "{app.message}"
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                      <button onClick={() => handleProcessApplication(app.id, app.users?.id, 'reject')} className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition">Reject</button>
                      <button onClick={() => handleProcessApplication(app.id, app.users?.id, 'approve')} className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-sm">Approve</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users size={16} className="text-blue-500" /> Member Roster
              </h3>
              <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full">{members.length} Members</span>
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
                  {members.map((member: any) => (
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
                        ) : member.role === 'core' ? (
                          <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 rounded-lg uppercase shadow-sm border border-purple-200/50 dark:border-purple-800/50">Core Team</span>
                        ) : (
                          <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg uppercase shadow-sm border border-gray-200/50 dark:border-gray-700/50">Member</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(member.joined_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        {member.role === 'member' && (
                          <button
                            onClick={() => handlePromoteMember(member.id, member.users?.full_name)}
                            className="text-purple-600 hover:text-purple-800 p-1.5 hover:bg-purple-50 rounded-lg transition-colors text-[10px] font-bold uppercase tracking-wider"
                          >
                            Promote
                          </button>
                        )}
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
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
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
