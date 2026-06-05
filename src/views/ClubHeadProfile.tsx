'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  User, Mail, Shield, Save, Camera, Building2, 
  Lock, Key, ShieldCheck, ArrowRight, RefreshCw,
  LayoutDashboard, UserCircle
} from 'lucide-react';

const ClubHeadProfile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'security'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    role: 'club_head',
    designation: '',
    managed_club: null
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [userResp, clubResp]: any[] = await Promise.all([
           supabase.from('users').select('*').eq('id', user!.id).single(),
           supabase.from('memberships').select('clubs(name)').eq('user_id', user!.id).eq('role', 'head').single()
        ]);

        if (userResp.data) {
          setProfileData({
             ...userResp.data,
             managed_club: clubResp.data?.clubs?.name || 'Unassigned'
          });
        }
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfileData();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ full_name: profileData.full_name, designation: profileData.designation })
        .eq('id', user!.id);
      if (error) throw error;
      updateProfile({ full_name: profileData.full_name, designation: profileData.designation });
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
      if (error) throw error;
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error((error as any).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><RefreshCw className="animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-500/20">
              {profileData.full_name?.charAt(0) || 'H'}
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
              <ShieldCheck size={16} className="text-blue-500" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{profileData.full_name}</h1>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-[0.2em] mt-1">{profileData.managed_club} Head</p>
          </div>
        </div>
        
        <div className="flex bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-[1.5rem] border border-gray-100 dark:border-gray-800">
          <button 
            onClick={() => setActiveTab('personal')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'personal' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Personal
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'security' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Security
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Affiliation</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Club</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white">{profileData.managed_club}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Privileges</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white">Club Commander</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] p-8 text-white shadow-xl">
             <LayoutDashboard size={32} className="text-blue-500 mb-6" />
             <h4 className="text-lg font-black mb-2">Lead Statistics</h4>
             <p className="text-xs text-gray-400 mb-6 leading-relaxed">Your club has grown by <span className="text-emerald-400 font-black">+14%</span> this month. Great work, Lead!</p>
             <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">View Analytics</button>
          </div>
        </div>

        {/* Main Form Area */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {activeTab === 'personal' ? (
              <motion.div
                key="personal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-10 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl"><UserCircle size={24} /></div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Personal Settings</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Identity & Branding</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input 
                        value={profileData.full_name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({...profileData, full_name: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Designation</label>
                      <input 
                        value={profileData.designation}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({...profileData, designation: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email (Immutable)</label>
                    <div className="w-full px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl font-bold text-gray-400 flex items-center gap-3">
                      <Mail size={16} /> {profileData.email}
                    </div>
                  </div>

                  <button 
                    disabled={saving}
                    className="px-8 py-4 bg-gray-900 dark:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-blue-700 transition-all active:scale-95 shadow-xl"
                  >
                    {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                    Apply Changes
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-10 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-2xl"><Lock size={24} /></div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Security Console</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Credential Management</p>
                  </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                      <div className="relative">
                        <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl font-bold focus:ring-4 focus:ring-rose-500/10 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl font-bold focus:ring-4 focus:ring-rose-500/10 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    disabled={saving}
                    className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-rose-700 transition-all active:scale-95 shadow-xl shadow-rose-500/20"
                  >
                    {saving ? <RefreshCw className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                    Update Security
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ClubHeadProfile;
