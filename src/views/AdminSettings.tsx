// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Key, Shield, Bell, Save, RefreshCw, 
  Eye, EyeOff, Lock, Mail, Smartphone, Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

const AdminSettings = () => {
  const { userProfile, user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });
      if (error) throw error;
      toast.success('Password updated successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Account Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Manage your administrative profile and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl">
                {userProfile?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 text-white rounded-xl shadow-lg border-4 border-white dark:border-gray-900">
                <Shield size={14} />
              </div>
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{userProfile?.full_name || 'Administrator'}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Platform Admin</p>
            
            <div className="mt-8 space-y-3 text-left">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <Mail size={16} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300 truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <Globe size={16} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Global Region</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-blue-600 rounded-[2rem] text-white shadow-xl shadow-blue-500/20">
            <h4 className="text-sm font-black mb-2 uppercase tracking-wider">Two-Factor Auth</h4>
            <p className="text-[10px] text-blue-100 leading-relaxed mb-4">
              Add an extra layer of security to your admin account.
            </p>
            <button className="w-full py-2.5 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all">
              Configure 2FA
            </button>
          </div>
        </div>

        {/* Security Forms */}
        <div className="md:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-10 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl">
                <Key size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Security & Password</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Last changed 3 months ago</p>
              </div>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter new secure password"
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat new password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isSaving || !passwords.new}
                  className="w-full py-4 bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/10 active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                  Update Credentials
                </button>
              </div>
            </form>
          </motion.div>

          <div className="bg-rose-50 dark:bg-rose-900/10 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/30 p-10">
            <div className="flex items-center gap-4 mb-4 text-rose-600 dark:text-rose-400">
              <Lock size={24} strokeWidth={2.5} />
              <h3 className="text-xl font-black">Privacy Control</h3>
            </div>
            <p className="text-sm text-rose-800/70 dark:text-rose-300/70 leading-relaxed mb-6">
              Changing your password will log you out of all other active sessions. Make sure you have your new credentials saved.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-black text-rose-400 uppercase tracking-widest">
              <Shield size={12} /> Encrypted at Rest
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
