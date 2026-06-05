'use client';

import React, { useState } from 'react';
import { 
  Bell, CheckCheck, Trash2, Calendar, Award, Activity, 
  Star, TrendingUp, Trophy, Search, Filter, Clock, 
  MoreVertical, ChevronRight, Inbox, AlertCircle, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const TYPE_COLORS = {
  event:        { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', icon: Calendar },
  achievement:  { bg: 'bg-amber-50 dark:bg-amber-900/30',     text: 'text-amber-600 dark:text-amber-400',     icon: Award },
  points:       { bg: 'bg-blue-50 dark:bg-blue-900/30',       text: 'text-blue-600 dark:text-blue-400',       icon: Activity },
  announcement: { bg: 'bg-indigo-50 dark:bg-indigo-900/30',   text: 'text-indigo-600 dark:text-indigo-400',   icon: Bell },
  challenge:    { bg: 'bg-purple-50 dark:bg-purple-900/30',   text: 'text-purple-600 dark:text-purple-400',   icon: Trophy },
  leaderboard:  { bg: 'bg-rose-50 dark:bg-rose-900/30',       text: 'text-rose-600 dark:text-rose-400',       icon: TrendingUp },
};

const NotificationCenter = () => {
  const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification, clearAll } = useNotifications();
  const [activeFilter, setActiveFilter] = useState('all');
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = activeFilter === 'all' || 
                         (activeFilter === 'unread' && !n.is_read) ||
                         n.type === activeFilter;
    return matchesFilter;
  });

  const categories = [
    { id: 'all', label: 'All', icon: Inbox },
    { id: 'unread', label: 'Unread', icon: AlertCircle },
    { id: 'event', label: 'Events', icon: Calendar },
    { id: 'achievement', label: 'Badges', icon: Award },
    { id: 'announcement', label: 'Announcements', icon: Bell },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Notification Center</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Manage your campus updates and achievements.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-row justify-end items-center gap-3 w-full">
        <div className="relative z-10 flex-1">
          <button
            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
            className="flex w-full justify-center items-center gap-2 bg-white dark:bg-gray-900 px-4 py-4 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm font-black text-gray-900 dark:text-white whitespace-nowrap"
          >
            <div className="flex items-center gap-2">
              <Menu size={18} className="text-gray-500" />
              <span>{categories.find(c => c.id === activeFilter)?.label || 'Filter'}</span>
            </div>
            {activeFilter !== 'all' && (
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
            )}
          </button>
          
          <AnimatePresence>
            {isCategoriesOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute left-0 top-[calc(100%+8px)] w-max min-w-[200px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-xl overflow-hidden flex flex-col p-2"
              >
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveFilter(cat.id);
                      setIsCategoriesOpen(false);
                    }}
                    className={`flex items-center justify-between px-5 py-3 rounded-2xl text-xs font-black transition-all ${
                      activeFilter === cat.id 
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <cat.icon size={16} className={activeFilter === cat.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'} />
                      {cat.label}
                    </div>
                    {cat.id === 'unread' && unreadCount > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button 
          onClick={markAllRead}
          className="flex-1 flex justify-center px-4 py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] text-sm font-black items-center gap-2 hover:bg-gray-50 transition-all shadow-sm text-gray-900 dark:text-white whitespace-nowrap"
        >
          <CheckCheck size={18} className="text-blue-500 shrink-0" />
          <span>Mark all read</span>
        </button>
      </div>

      {/* Notification List */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredNotifications.map((notif) => {
                const scheme = TYPE_COLORS[notif.type] || TYPE_COLORS.announcement;
                const Icon = scheme.icon;
                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`group flex items-start gap-5 p-8 transition-all hover:bg-gray-50/50 dark:hover:bg-gray-800/30 ${notif.is_read ? 'opacity-60' : 'bg-blue-50/10'}`}
                  >
                    <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-sm ${scheme.bg} ${scheme.text}`}>
                      <Icon size={24} strokeWidth={2.5} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white truncate pr-4">
                          {notif.title}
                        </h3>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 shrink-0">
                          <Clock size={10} /> {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">
                        {notif.message}
                      </p>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => markAsRead(notif.id)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            notif.is_read 
                              ? 'text-gray-400 bg-gray-50 dark:bg-gray-800' 
                              : 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100'
                          }`}
                        >
                          {notif.is_read ? 'Read' : 'Mark as read'}
                        </button>
                      </div>
                    </div>
                    
                    {!notif.is_read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-3" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 px-10">
              <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Inbox size={40} className="text-gray-200" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Notifications Found</h3>
              <p className="text-gray-500 max-w-xs mx-auto">
                We couldn't find any notifications matching your current filters.
              </p>
              <button 
                onClick={() => setActiveFilter('all')}
                className="mt-6 text-sm font-black text-blue-600 uppercase tracking-widest hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationCenter;
