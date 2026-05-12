// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, useSpring, useTransform } from 'framer-motion';
import { toast } from 'react-toastify';
import { Award, Calendar, Users, Activity, LogIn, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AnimatedCounter = ({ value }) => {
  const springValue = useSpring(0, {
    stiffness: 70,
    damping: 20,
    mass: 1,
  });
  
  const displayValue = useTransform(springValue, (current) => Math.round(current));

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  return <motion.span>{displayValue}</motion.span>;
};

const ActionIcon = ({ type }) => {
   switch(type) {
      case 'event_attended':
         return <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10"><Calendar size={18} /></div>;
      case 'achievement_earned':
         return <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10"><Award size={18} /></div>;
      case 'joined_club':
         return <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10"><Users size={18} /></div>;
      default:
         return <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10"><Activity size={18} /></div>;
   }
};

const ActionDescription = ({ type, points }) => {
   switch(type) {
      case 'event_attended':
         return <span>Attended a campus event <strong className="text-emerald-600">+{points} pts</strong></span>;
      case 'achievement_earned':
         return <span>Earned a new club achievement <strong className="text-amber-600">+{points} pts</strong></span>;
      case 'joined_club':
         return <span>Joined a new club <strong className="text-indigo-600">+{points} pts</strong></span>;
      case 'login':
         return <span>Daily Login Bonus <strong className="text-blue-600">+{points} pts</strong></span>;
      default:
         return <span>Earned <strong className="text-gray-900">+{points} pts</strong></span>;
   }
}

const StudentActivity = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ score: 0, achievements: 0, events: 0 });

  useEffect(() => {
    if (!user) return;

    const fetchActivityData = async () => {
      setLoading(true);

      try {
        const [
          { data: logsData, error: logsError },
          { data: scoreData },
          { count: achievementsCount },
          { count: eventsCount }
        ] = await Promise.all([
          supabase.from('activity_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('student_scores').select('activeness_score').eq('user_id', user.id).maybeSingle(),
          supabase.from('achievements').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('action_type', 'event_attended')
        ]);

        if (logsError) throw logsError;

        setLogs(logsData || []);
        setStats({
          score: scoreData?.activeness_score || 0,
          achievements: achievementsCount || 0,
          events: eventsCount || 0
        });

      } catch (err) {
        console.error('Error fetching activity data:', err);
        toast.error('Failed to load activity details');
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-900 via-emerald-900 to-teal-800 p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative z-10 text-center md:text-left">
           <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">My Activity</h1>
           <p className="text-emerald-100 max-w-lg leading-relaxed">Track your campus engagement, review your past events, and monitor your activeness progression.</p>
        </div>
      </div>

      {/* 3 Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="bg-gradient-to-br from-indigo-500 to-blue-600 p-6 rounded-3xl shadow-lg border border-white/10 text-white relative overflow-hidden group hover:-translate-y-1 transition-transform"
         >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
            <div className="flex items-start justify-between">
               <div>
                  <p className="text-blue-100 font-semibold text-sm mb-1">Activeness Score</p>
                  <div className="flex items-baseline gap-2">
                     <h3 className="text-4xl font-black tracking-tight"><AnimatedCounter value={stats.score} /></h3>
                     <span className="text-blue-200 font-semibold">pts</span>
                  </div>
               </div>
               <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                  <Activity size={24} className="text-white" />
               </div>
            </div>
         </motion.div>

         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 rounded-3xl shadow-lg border border-white/10 text-white relative overflow-hidden group hover:-translate-y-1 transition-transform"
         >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
            <div className="flex items-start justify-between">
               <div>
                  <p className="text-orange-100 font-semibold text-sm mb-1">Achievements</p>
                  <div className="flex items-baseline gap-2">
                     <h3 className="text-4xl font-black tracking-tight"><AnimatedCounter value={stats.achievements} /></h3>
                     <span className="text-orange-200 font-semibold">badges</span>
                  </div>
               </div>
               <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                  <Star size={24} className="text-white" />
               </div>
            </div>
         </motion.div>

         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="bg-gradient-to-br from-teal-500 to-emerald-600 p-6 rounded-3xl shadow-lg border border-white/10 text-white relative overflow-hidden group hover:-translate-y-1 transition-transform"
         >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
            <div className="flex items-start justify-between">
               <div>
                  <p className="text-emerald-100 font-semibold text-sm mb-1">Events Attended</p>
                  <div className="flex items-baseline gap-2">
                     <h3 className="text-4xl font-black tracking-tight"><AnimatedCounter value={stats.events} /></h3>
                     <span className="text-emerald-200 font-semibold">total</span>
                  </div>
               </div>
               <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                  <Calendar size={24} className="text-white" />
               </div>
            </div>
         </motion.div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">Activity Timeline</h2>
        {logs.length > 0 ? (
          <div className="relative border-l-2 border-gray-100 dark:border-gray-800 pl-6 ml-4 space-y-10">
            {logs.map((log, index) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 + 0.3 }}
                className="relative"
              >
                <div className="absolute -left-[45px]">
                  <ActionIcon type={log.action_type} />
                  {index === 0 && (
                     <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-75"></div>
                  )}
                </div>
                
                <div className={`bg-white dark:bg-gray-800/80 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-xl dark:shadow-gray-900 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden ${
                   log.action_type === 'event_attended' ? 'border-l-4 border-l-emerald-500 dark:border-l-emerald-500' :
                   log.action_type === 'achievement_earned' ? 'border-l-4 border-l-amber-500 dark:border-l-amber-500' :
                   log.action_type === 'joined_club' ? 'border-l-4 border-l-indigo-500 dark:border-l-indigo-500' :
                   'border-l-4 border-l-blue-500 dark:border-l-blue-500'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 relative z-10">
                     <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                        <ActionDescription type={log.action_type} points={log.points_awarded} />
                     </p>
                     <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-gray-800 group-hover:bg-white dark:group-hover:bg-gray-800 group-hover:shadow-sm transition-all duration-300">
                       {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                     </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400/80 relative z-10">Activity logged automatically by Cluvion.</p>
                  
                  {/* Subtle Background Icon on hover */}
                  <div className="absolute -right-4 -top-4 opacity-0 group-hover:opacity-5 transition-opacity duration-300 scale-150 rotate-12 pointer-events-none">
                     <Activity size={100} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-800">
               <Activity size={24} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">No Activity Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">Start joining clubs and attending events to earn points and level up your profile!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentActivity;
