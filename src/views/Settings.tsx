'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Moon, Sun, Monitor, LogOut, ChevronRight, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const Settings = () => {
  const { userProfile, user, logout } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('theme') === 'dark' || 
           (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Sign out first
      await logout();
      // Then navigate to welcome page
      router.push('/welcome');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-4">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Profile Summary Section */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/30 shadow-sm flex items-center justify-center font-bold text-2xl overflow-hidden">
              {userProfile?.avatar_url ? (
                 <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                 userProfile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{userProfile?.full_name || user?.email?.split('@')[0] || 'User'}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Appearance</h3>
          </div>
          <div className="p-2">
            <button 
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg">
                  {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Theme Preference</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{isDarkMode ? 'Dark Mode Active' : 'Light Mode Active'}</p>
                </div>
              </div>
              
              {/* Toggle Switch */}
              <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isDarkMode ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-[2px] shadow-sm transition-all duration-300 ${isDarkMode ? 'left-[26px]' : 'left-[2px]'}`}></div>
              </div>
            </button>
          </div>
        </section>

        {/* Account Section */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Actions</h3>
          </div>
          <div className="p-2">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-500 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <LogOut size={20} />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Sign Out</p>
                  <p className="text-sm text-red-400 dark:text-red-500/70 group-hover:text-red-500 transition-colors">End your current session securely</p>
                </div>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
