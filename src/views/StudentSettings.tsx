'use client';

import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Palette, LogOut, ChevronRight, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function StudentSettings() {
  const { user, userProfile, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Account');

  // Account State
  const [fullName, setFullName] = useState(userProfile?.full_name || '');
  const [rollNo, setRollNo] = useState(userProfile?.roll_no || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial theme
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setRollNo(userProfile.roll_no || '');
      setPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  const handleSaveAccount = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const { error } = await supabase
        .from('users')
        .update({ full_name: fullName, roll_no: rollNo, phone: phone })
        .eq('id', user.id);
      
      if (error) throw error;
      
      updateProfile({ full_name: fullName, roll_no: rollNo, phone: phone });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTheme = (dark: boolean) => {
    setIsDarkMode(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 md:pb-8 pt-safe">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <Settings className="text-indigo-600" size={32} />
            Settings
          </h1>
          <p className="text-gray-500 font-medium mt-2">Manage your account preferences, theme, and security.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          {['Account', 'Theme', 'Notifications'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-colors ${
                activeTab === tab 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white dark:bg-[#0e0e12] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                {tab === 'Account' && <User size={20} />}
                {tab === 'Theme' && <Palette size={20} />}
                {tab === 'Notifications' && <Bell size={20} />}
                {tab}
              </div>
              <ChevronRight size={16} className={activeTab === tab ? 'opacity-100' : 'opacity-50'} />
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 transition-colors border border-rose-100 dark:border-rose-900/30"
            >
              <LogOut size={20} />
              Log Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-[#0e0e12] rounded-3xl border border-gray-100 dark:border-white/5 p-6 md:p-8 shadow-sm h-fit">
          {activeTab === 'Account' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-white dark:bg-[#0e0e12] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Roll Number</label>
                  <input type="text" value={rollNo} onChange={(e) => setRollNo(e.target.value)} className="w-full bg-white dark:bg-[#0e0e12] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +1 234 567 8900" className="w-full bg-white dark:bg-[#0e0e12] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email (Read-only)</label>
                  <input type="email" disabled value={user?.email || ''} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-400 cursor-not-allowed font-medium" />
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <button 
                  onClick={handleSaveAccount}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all disabled:opacity-70"
                >
                  {isSaving ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <Save size={18} />
                  )}
                  Save Changes
                </button>
                {saveSuccess && (
                  <span className="flex items-center gap-1.5 text-emerald-600 font-medium text-sm animate-pulse">
                    <CheckCircle size={16} /> Saved Successfully
                  </span>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'Theme' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Appearance</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => toggleTheme(false)}
                  className={`flex items-center gap-4 p-4 border-2 rounded-2xl font-bold transition-colors ${
                    !isDarkMode 
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-xl">☀️</div>
                  Light Mode
                </button>
                <button 
                  onClick={() => toggleTheme(true)}
                  className={`flex items-center gap-4 p-4 border-2 rounded-2xl font-bold transition-colors ${
                    isDarkMode 
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center shadow-sm text-xl">🌙</div>
                  Dark Mode
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'Notifications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Push Notifications</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Receive alerts for new events and activities.</p>
                  </div>
                  <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer shadow-inner">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Email Alerts</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Important academic updates sent to email.</p>
                  </div>
                  <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative cursor-pointer shadow-inner transition-colors">
                    <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
