'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import {
  Users, Calendar, Award, Megaphone, Send,
  TrendingUp, UserPlus, ShieldCheck, Activity, 
  Plus, Zap, QrCode, ClipboardList, AlertCircle, 
  Clock, CheckCircle2, MoreVertical, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardContainer } from '../../components/ui/DashboardLayout';
import Link from 'next/link';

/* ── Operational Stat Cards ── */
const HealthScoreCard = ({ score, trend, loading }: { score: number; trend: string; loading: boolean }) => (
  <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 rounded-2xl text-white relative overflow-hidden shadow-md shadow-emerald-500/20 col-span-2 sm:col-span-1 flex flex-col justify-between">
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
    <div className="relative z-10 flex justify-between items-start mb-2">
      <Activity size={20} className="text-emerald-100" />
      <span className="px-2 py-0.5 bg-emerald-800/40 rounded-full text-[10px] font-bold backdrop-blur-sm border border-emerald-400/20">
        {trend}
      </span>
    </div>
    <div className="relative z-10">
      <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest mb-0.5">Club Health</p>
      {loading ? (
        <div className="h-8 w-16 bg-emerald-800/50 rounded animate-pulse" />
      ) : (
        <div className="flex items-end gap-1">
          <span className="text-3xl font-black leading-none tracking-tighter">{score}</span>
          <span className="text-sm font-bold text-emerald-200 mb-0.5">/100</span>
        </div>
      )}
    </div>
  </div>
);

const OpStatCard = ({ title, value, icon: Icon, accent, subtitle, loading, delay }: { title: string; value: string | number; icon: React.ElementType; accent: 'blue' | 'amber' | 'rose'; subtitle?: string; loading?: boolean; delay?: number }) => {
  const styles = {
    blue:  'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30',
    rose:  'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/30',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`p-4 rounded-2xl border flex flex-col justify-between ${styles[accent]}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="p-2 rounded-xl bg-white dark:bg-gray-800/50 shadow-sm">
          <Icon size={16} />
        </div>
      </div>
      <div>
        {loading ? (
          <div className="h-7 w-12 bg-black/5 dark:bg-white/5 rounded animate-pulse mb-1" />
        ) : (
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-0.5 leading-none">{value}</h3>
        )}
        <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">{title}</p>
        {subtitle && <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );
};

export default function ClubHeadDashboard() {
  const { user } = useAuth();
  const [managedClub, setManagedClub] = useState<any>(null);
  const [stats, setStats] = useState({ members: 0, events: 0, health: 92 });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcementText, setAnnouncementText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const { data: memberData }: any = await supabase
          .from('memberships')
          .select('club_id, clubs(*)')
          .eq('user_id', user.id)
          .eq('role', 'head')
          .maybeSingle();

        if (cancelled) return;
        if (!memberData) {
          setLoading(false);
          return;
        }

        const clubId = memberData.club_id;
        setManagedClub(memberData.clubs);

        const [mCount, eData]: any = await Promise.all([
          supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('club_id', clubId),
          supabase.from('events').select('*').eq('club_id', clubId).order('created_at', { ascending: false })
        ]);

        if (cancelled) return;

        setStats({
          members: mCount.count || 0,
          events: (eData.data || []).length,
          health: 92 // Example computed score
        });

        // Mock operational activity
        setRecentActivities([
          { id: 1, type: 'Event Live', user: 'Tech Meetup started', time: '2m', icon: Activity, accent: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' },
          { id: 2, type: 'New Member', user: 'Alex Chen joined', time: '1h', icon: UserPlus, accent: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
          { id: 3, type: 'Task Done', user: 'Sam finished "Room Setup"', time: '2h', icon: CheckCircle2, accent: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDashboardData();

    const channel = supabase
      .channel('club_head_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memberships' }, () => fetchDashboardData())
      .subscribe();

    return () => { 
      cancelled = true;
      supabase.removeChannel(channel); 
    };
  }, [user]);

  const handlePost = async () => {
    if (!announcementText.trim() || !managedClub) return;
    setIsPosting(true);
    try {
      const { error }: any = await supabase
        .from('feed_posts')
        .insert({ club_id: managedClub.id, content: announcementText });
      if (error) throw error;
      toast.success('Broadcast sent!');
      setAnnouncementText('');
    } catch {
      toast.error('Broadcast failed');
    } finally {
      setIsPosting(false);
    }
  };

  /* ── Unassigned state ── */
  if (!managedClub && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
        <ShieldCheck size={44} className="text-gray-200 dark:text-gray-700 mb-4" />
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-2">No Operational Access</h2>
        <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
          You are not designated as Head for any club. Contact an admin to configure your permissions.
        </p>
      </div>
    );
  }

  return (
    <DashboardContainer className="space-y-6 pb-24 sm:pb-8">
      {/* ── Page Header & Desktop Actions ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full">
              Operations Center
            </span>
            {managedClub?.name && (
              <span className="text-xs font-bold text-gray-500">{managedClub.name}</span>
            )}
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Command Center
          </h1>
        </div>

        {/* Desktop Quick Actions */}
        <div className="hidden sm:flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors shadow-sm">
            <QrCode size={16} /> Scan Attendance
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-blue-500/20">
            <Plus size={16} /> New Event
          </button>
        </div>
      </div>

      {/* ── Top Priority KPI Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <HealthScoreCard score={stats.health} trend="+4.2% This Month" loading={loading} />
        <OpStatCard title="Upcoming" value="3" subtitle="Events this week" icon={Calendar} accent="blue" loading={loading} delay={0.1} />
        <OpStatCard title="Pending" value="12" subtitle="Tasks & Approvals" icon={AlertCircle} accent="amber" loading={loading} delay={0.2} />
        <OpStatCard title="Active" value={stats.members} subtitle="Engaged members" icon={Users} accent="rose" loading={loading} delay={0.3} />
      </div>

      {/* ── Main Operational Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Events & Workflows (Spans 2 cols on Desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Event Command Pipeline */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-base font-black text-gray-900 dark:text-white">Event Operations</h2>
                <p className="text-[11px] font-medium text-gray-500 mt-0.5">Manage lifecycle and attendance</p>
              </div>
              <Link href="/head/events" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            
            <div className="space-y-3">
              {/* Event Card: Live */}
              <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/10">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 rounded text-[9px] font-black uppercase tracking-wider">
                      <Activity size={10} className="animate-pulse" /> Live Now
                    </span>
                    <span className="text-[11px] font-bold text-gray-500">Hackathon Kickoff</span>
                  </div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">Main Hall Setup & Registration</h3>
                  <div className="flex items-center gap-4 mt-2 text-[11px] font-semibold text-gray-500">
                    <span className="flex items-center gap-1"><Users size={12} /> 45 Checked In</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> Ends in 2h</span>
                  </div>
                </div>
                <div className="flex sm:flex-col gap-2 justify-center">
                  <button className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2">
                    <QrCode size={14} /> Scan
                  </button>
                </div>
              </div>

              {/* Event Card: Upcoming */}
              <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-[9px] font-black uppercase tracking-wider">
                      Registration Open
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">Web Dev Workshop</h3>
                  <div className="flex items-center gap-4 mt-2 text-[11px] font-semibold text-gray-500">
                    <span className="flex items-center gap-1"><Calendar size={12} /> Tomorrow, 4:00 PM</span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><Users size={12} /> 120 RSVPs</span>
                  </div>
                </div>
                <div className="flex sm:flex-col gap-2 justify-center">
                  <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Broadcast Center */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex-shrink-0">
                <Megaphone size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900 dark:text-white leading-tight">Broadcast Center</h2>
                <p className="text-[11px] font-medium text-gray-500">Push high-priority alerts to members</p>
              </div>
            </div>
            <div className="relative">
              <textarea
                placeholder="Announce room changes, deadlines, or urgent updates..."
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="w-full h-24 p-3 pr-12 bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm text-gray-900 dark:text-white font-medium resize-none placeholder-gray-400"
              />
              <button
                onClick={handlePost}
                disabled={isPosting || !announcementText.trim()}
                className="absolute bottom-3 right-3 px-3 py-1.5 bg-gray-900 dark:bg-indigo-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-indigo-700 transition-all disabled:opacity-40 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                Send <Send size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Tracking & Live Feed */}
        <div className="space-y-6">
          
          {/* Volunteer & Task Tracker */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base font-black text-gray-900 dark:text-white">Active Tasks</h2>
                <p className="text-[11px] font-medium text-gray-500">Volunteer coordination</p>
              </div>
              <button className="p-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-500 hover:text-blue-600 transition-colors">
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Social Media Posters', assignee: 'Sarah J.', status: 'Pending', color: 'amber' },
                { title: 'Catering Confirm', assignee: 'Mike T.', status: 'Done', color: 'emerald' },
                { title: 'Speaker Outreach', assignee: 'Unassigned', status: 'Urgent', color: 'rose' }
              ].map((task, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <ClipboardList size={14} className="text-gray-400" />
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{task.title}</p>
                      <p className="text-[10px] text-gray-500">{task.assignee}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded bg-${task.color}-100 text-${task.color}-700 dark:bg-${task.color}-900/30 dark:text-${task.color}-400`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Gamification & Leaderboard Integration */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-5 text-white shadow-md shadow-blue-500/15 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Award size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white">Gamification</h2>
                  <p className="text-[10px] text-indigo-200">Club Global Ranking</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-full border border-white/10">Top 10%</span>
            </div>
            
            <div className="bg-white/10 border border-white/20 rounded-xl p-3 mb-3 relative z-10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-bold text-indigo-100">Club XP Level</span>
                <span className="text-[11px] font-bold text-white">Lvl 12</span>
              </div>
              <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[65%] rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
              <p className="text-[9px] text-indigo-200 mt-1.5 text-right">350 XP to Next Level</p>
            </div>

            <Link href="/student/leaderboard" className="w-full py-2 bg-white text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-1.5 relative z-10">
              View Global Leaderboard <ChevronRight size={14} />
            </Link>
          </div>

          {/* Live Operations Feed */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-gray-900 dark:text-white">Activity Log</h2>
                <p className="text-[11px] font-medium text-gray-500">Real-time system feed</p>
              </div>
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </div>
            <div className="space-y-4">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3">
                  <div className={`w-7 h-7 mt-0.5 rounded-lg flex items-center justify-center flex-shrink-0 ${act.accent}`}>
                    <act.icon size={12} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{act.user}</p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">{act.type}</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-300 dark:text-gray-600 flex-shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Mobile Floating Quick Action Bar ── */}
      <div className="fixed bottom-20 left-4 right-4 sm:hidden bg-gray-900/90 dark:bg-white/10 backdrop-blur-md border border-gray-800 dark:border-white/10 p-2 rounded-2xl flex items-center justify-around shadow-2xl z-50">
        <button className="flex flex-col items-center gap-1 p-2 text-gray-300 dark:text-gray-300 hover:text-white transition-colors">
          <Calendar size={18} />
          <span className="text-[9px] font-bold tracking-wide">Event</span>
        </button>
        <div className="w-px h-8 bg-gray-700 dark:bg-white/20" />
        <button className="flex flex-col items-center gap-1 p-2 text-blue-400 hover:text-blue-300 transition-colors -mt-4 relative">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 border-4 border-gray-900 dark:border-black text-white">
            <QrCode size={20} />
          </div>
          <span className="text-[9px] font-bold tracking-wide text-white">Scan</span>
        </button>
        <div className="w-px h-8 bg-gray-700 dark:bg-white/20" />
        <button className="flex flex-col items-center gap-1 p-2 text-gray-300 dark:text-gray-300 hover:text-white transition-colors">
          <Megaphone size={18} />
          <span className="text-[9px] font-bold tracking-wide">Alert</span>
        </button>
      </div>

    </DashboardContainer>
  );
}
