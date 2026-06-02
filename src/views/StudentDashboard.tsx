// @ts-nocheck
'use client';

import {
  Activity, Star, Calendar, Image as ImageIcon,
  Video, Paperclip, Send, X, Award, Trophy, Zap, Flame,
  Users, QrCode
} from 'lucide-react';
import Feed from '../components/Feed';
import BadgeShowcase from '../components/badges/BadgeShowcase';
import { motion, useSpring, useTransform } from 'framer-motion';
import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useRealtimeContext } from '../context/RealtimeContext';
import { toast } from 'react-toastify';
import { EngagementService } from '../services/EngagementService';
import { StatCard, SectionHeader, EmptyState, DashboardContainer } from '../components/ui/DashboardLayout';

/* ── Animated counter ── */
const AnimatedCounter = memo(({ value }: { value: number }) => {
  const spring = useSpring(0, { stiffness: 70, damping: 20, mass: 1 });
  const display = useTransform(spring, (v) => Math.round(v));
  useEffect(() => { spring.set(value); }, [value, spring]);
  return <motion.span>{display}</motion.span>;
});

/* ── XP Progress bar ── */
const XPBar = memo(({ progress, label }: { progress: number; label: string }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center">
      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">XP Progress</p>
      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500">{progress}% · {label}</p>
    </div>
    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
      />
    </div>
  </div>
));

/* ── Compact profile header ── */
const ProfileHeader = memo(({ name, initial, tier, rank, streak, xp, nextXp, progress }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 relative overflow-hidden"
  >
    {/* accent bar */}
    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-500" />

    <div className="flex items-center gap-3 mt-1 mb-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-100 to-emerald-50 dark:from-blue-900/40 dark:to-emerald-900/20 text-blue-600 dark:text-emerald-400 border border-blue-200/60 dark:border-blue-800/50 flex items-center justify-center font-black text-xl flex-shrink-0">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{name || 'Student'}</h3>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Star size={11} className="text-amber-500" /> {tier}
          </span>
          {rank && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">#{rank}</span>
          )}
          {streak > 0 && (
            <span className="text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              🔥 {streak}d
            </span>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-lg font-black text-gray-900 dark:text-white leading-none">
          <AnimatedCounter value={xp} />
        </p>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">XP</p>
      </div>
    </div>

    <XPBar progress={progress} label={`${nextXp} XP to next tier`} />
  </motion.div>
));

/* ── Post composer ── */
const PostComposer = ({ user, userProfile, onPost }) => {
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);
  const initial = userProfile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'S';

  const submit = async () => {
    if (!content.trim() || posting) return;
    setPosting(true);
    try {
      const mediaData = file ? { media_url: file.preview, media_type: file.type.startsWith('video/') ? 'video' : 'image' } : {};
      const { error } = await supabase.from('feed_posts').insert({ content, user_id: user.id, ...mediaData });
      if (error) throw error;
      toast.success('Posted!');
      setContent('');
      setFile(null);
      onPost?.();
    } catch { toast.error('Failed to post.'); }
    finally { setPosting(false); }
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error('Max file size is 10MB'); return; }
    setFile({ file: f, preview: URL.createObjectURL(f), type: f.type });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-200/60 flex-shrink-0 flex items-center justify-center font-bold text-sm">
          {initial}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 font-medium py-1.5 min-h-[52px]"
          placeholder="Share a campus update..."
          disabled={posting}
        />
      </div>
      {file && (
        <div className="relative mt-2 mb-3 inline-block">
          {file.type.startsWith('video/') ? (
            <video src={file.preview} className="max-h-40 rounded-xl object-contain bg-gray-100" />
          ) : (
            <img src={file.preview} alt="" className="max-h-40 rounded-xl object-contain bg-gray-100 border border-gray-200" />
          )}
          <button onClick={() => setFile(null)} className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 shadow hover:bg-gray-700">
            <X size={12} />
          </button>
        </div>
      )}
      <div className="border-t border-gray-100 dark:border-gray-800 mt-3 pt-3 flex items-center justify-between">
        <input type="file" ref={fileRef} onChange={handleFile} className="hidden" accept="image/*,video/*" />
        <div className="flex gap-1">
          {[
            { Icon: ImageIcon, label: 'Photo', color: 'hover:text-blue-600' },
            { Icon: Video, label: 'Video', color: 'hover:text-indigo-600' },
            { Icon: Paperclip, label: 'File', color: 'hover:text-amber-600' },
          ].map(({ Icon, label, color }) => (
            <button key={label} onClick={() => fileRef.current?.click()} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-gray-400 ${color} transition-colors`}>
              <Icon size={16} />
              <span className="text-xs font-semibold hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={submit}
          disabled={!content.trim() || posting}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-full font-bold text-xs shadow-sm shadow-blue-200 transition-colors flex items-center gap-1.5"
        >
          {posting ? 'Posting…' : (<>Post <Send size={12} /></>)}
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   STUDENT DASHBOARD
══════════════════════════════════════════════════════════ */
const StudentDashboard = () => {
  const { user, userProfile } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { subscribeToActivityLogs } = useRealtimeContext();
  const [stats, setStats] = useState({
    score: 0, achievements: 0, events: 0,
    tier: 'Novice', nextXp: 100, progress: 0, currentStreak: 0
  });
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [statsData, rankData] = await Promise.all([
        EngagementService.getUserEngagement(user.id),
        supabase.from('leaderboard').select('rank').eq('user_id', user.id).maybeSingle(),
      ]);
      setStats({
        score: statsData.totalXp,
        achievements: statsData.achievementsEarned,
        events: statsData.eventsAttended,
        tier: statsData.reputationTier,
        nextXp: statsData.nextTierXp,
        progress: statsData.progressPercent,
        currentStreak: statsData.currentStreak,
      });
      setUserRank(rankData?.data?.rank || null);
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchData();

    // Use centralized realtime context — no per-component channel creation
    const unsub = subscribeToActivityLogs((payload) => {
      if (payload.new?.user_id !== user.id) return;
      setStats(prev => ({
        ...prev,
        score: prev.score + (payload.new.points_awarded || 0),
        events: payload.new.action_type === 'event_attended' ? prev.events + 1 : prev.events,
      }));
      toast.success(`+${payload.new.points_awarded} XP earned! 🎉`);
    });

    return unsub;
  }, [user, fetchData, subscribeToActivityLogs]);

  const initial = userProfile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'S';

  return (
    <DashboardContainer>
      {/* ── Layout: sidebar-left + main-right on desktop ── */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── LEFT COLUMN ── */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-4">

          {/* Profile + XP Header */}
          <ProfileHeader
            name={userProfile?.full_name}
            initial={initial}
            tier={stats.tier}
            rank={userRank}
            streak={stats.currentStreak}
            xp={stats.score}
            nextXp={stats.nextXp}
            progress={stats.progress}
          />

          {/* Stat Row: Events · Awards · Streak */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={Calendar} label="Events" value={stats.events} accent="blue" loading={loading} />
            <StatCard icon={Award} label="Badges" value={stats.achievements} accent="amber" loading={loading} />
            <StatCard icon={Zap} label="Streak" value={stats.currentStreak > 0 ? `${stats.currentStreak}d` : '—'} accent="emerald" loading={loading} />
          </div>

          {/* Rank card */}
          {userRank && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30 p-4 flex items-center gap-3"
            >
              <Trophy size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-blue-400 dark:text-blue-500 uppercase tracking-widest">Campus Rank</p>
                <p className="text-2xl font-black text-blue-700 dark:text-blue-300 leading-none">#{userRank}</p>
              </div>
            </motion.div>
          )}

          {/* Badge Showcase */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <SectionHeader title="My Badges" />
            <BadgeShowcase
              userId={user?.id}
              stats={{ total_xp: stats.score, events_attended: stats.events, streak_days: stats.currentStreak }}
              compact
            />
          </div>
        </div>

        {/* ── RIGHT COLUMN: Feed ── */}
        <div className="flex-1 min-w-0 space-y-4">
          
          {/* Quick Actions (Mobile optimized) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
             <a href="/student/events" className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all text-center group">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><Calendar size={20} /></div>
                <span className="text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300">Find Events</span>
             </a>
             <a href="/student/clubs" className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all text-center group">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><Users size={20} /></div>
                <span className="text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300">Explore Clubs</span>
             </a>
             <a href="/student/leaderboard" className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800 transition-all text-center group">
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><Award size={20} /></div>
                <span className="text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300">Leaderboard</span>
             </a>
             <a href="/student/profile" className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all text-center group">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><QrCode size={20} /></div>
                <span className="text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300">My ID Card</span>
             </a>
          </div>

          {/* Feed composer */}
          <PostComposer user={user} userProfile={userProfile} />

          {/* Section header */}
          <SectionHeader
            title="Campus Feed"
            subtitle="What's happening right now"
          />

          {/* The unified feed */}
          <Feed />
        </div>

      </div>
    </DashboardContainer>
  );
};

export default StudentDashboard;
