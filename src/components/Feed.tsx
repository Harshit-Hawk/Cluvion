'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Trophy, Award, Activity, Flame, Megaphone, Flag } from 'lucide-react';
import type { FeedPost, Comment } from '../types';
import { ActivityLogService } from '../services/gamification/ActivityLogService';
import { useRealtimeContext } from '../context/RealtimeContext';

export type FeedItemType = 'announcement' | 'gamification';

export interface DashboardFeedItem {
  id: string;
  type: FeedItemType;
  created_at: string;
  // Announcement
  content?: string;
  clubs?: { name: string };
  media_url?: string;
  media_type?: string;
  // Gamification (mapped from ActivityLogService)
  actionType?: string;
  pointsAwarded?: number;
  metadata?: any;
  user?: { fullName: string; avatarUrl: string; course?: string };
}

const AnnouncementCard = memo(({ post }: { post: DashboardFeedItem }) => {
   return (
      <motion.div
         initial={{ opacity: 0, scale: 0.95, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.9 }}
         layout
         className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-lg shadow-gray-200/50 dark:shadow-none overflow-hidden relative group"
      >
         {/* Top Gradient Bar */}
         <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
         
         <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Megaphone size={24} />
               </div>
               <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{post.clubs?.name || 'Campus Update'}</h4>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                     {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
               </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
               {post.content}
            </p>

            {post.media_url && (
               <div className="rounded-xl overflow-hidden mb-4">
                  {post.media_type === 'video' ? (
                     <video controls className="w-full h-48 object-cover bg-gray-100 dark:bg-gray-800" src={post.media_url} />
                  ) : (
                     <img src={post.media_url} alt="Update" className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500 bg-gray-100 dark:bg-gray-800" />
                  )}
               </div>
            )}
         </div>
      </motion.div>
   );
});

const ActivityCard = memo(({ post }: { post: DashboardFeedItem }) => {
   const action = post.actionType || '';
   
   let config = {
      icon: Activity,
      title: 'Activity',
      color: 'from-blue-400 to-cyan-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      message: 'participated in an activity.'
   };

   if (action.includes('badge') || action.includes('achievement')) {
      config = {
         icon: Award, title: 'Badge Unlocked', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-900/20', textColor: 'text-amber-600 dark:text-amber-400', message: 'unlocked a new badge!'
      };
   } else if (action.includes('streak')) {
      config = {
         icon: Flame, title: 'Streak Milestone', color: 'from-rose-400 to-red-500', bg: 'bg-rose-50 dark:bg-rose-900/20', textColor: 'text-rose-600 dark:text-rose-400', message: 'hit a new daily streak!'
      };
   } else if (action.includes('leaderboard') || action.includes('rank')) {
      config = {
         icon: Trophy, title: 'Leaderboard Update', color: 'from-yellow-300 to-amber-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', textColor: 'text-yellow-600 dark:text-yellow-400', message: 'climbed the leaderboard!'
      };
   } else if (action.includes('event')) {
      config = {
         icon: Activity, title: 'Event Activity', color: 'from-purple-400 to-fuchsia-500', bg: 'bg-purple-50 dark:bg-purple-900/20', textColor: 'text-purple-600 dark:text-purple-400', message: 'participated in a campus event.'
      };
   } else if (action.includes('challenge')) {
      config = {
         icon: Flag, title: 'Challenge Update', color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-600 dark:text-emerald-400', message: 'completed a challenge.'
      };
   }

   const Icon = config.icon;

   // Remove heavy backdrop-blur from ActivityCard — use simpler bg
   return (
      <motion.div
         initial={{ opacity: 0, y: 12 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0 }}
         className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-6 relative overflow-hidden group"
      >
         <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${config.color} group-hover:opacity-40 transition-opacity duration-500`}></div>
         
         <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.textColor} inline-flex items-center gap-1.5 shadow-sm border border-white/50 dark:border-gray-800`}>
               <Icon size={14} /> {config.title}
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
               {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
         </div>

         <div className="flex items-center gap-4 relative z-10">
            <div className="relative">
               <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border-2 border-white dark:border-gray-800 shadow-md">
                  {post.user?.avatarUrl ? (
                     <img src={post.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                     <div className={`w-full h-full flex items-center justify-center font-bold ${config.textColor} ${config.bg}`}>
                        {(post.user?.fullName || 'S').charAt(0)}
                     </div>
                  )}
               </div>
               {post.pointsAwarded && post.pointsAwarded > 0 && (
                  <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${config.color} shadow-sm border-2 border-white dark:border-gray-900`}>
                     +{post.pointsAwarded}
                  </div>
               )}
            </div>
            
            <div className="flex-1">
               <p className="text-gray-800 dark:text-gray-200 text-sm leading-snug">
                  <span className="font-bold text-gray-900 dark:text-gray-100">{post.user?.fullName || 'A student'}</span> {config.message}
               </p>
            </div>
         </div>
      </motion.div>
   );
});

const Feed = () => {
  const [posts, setPosts] = useState<DashboardFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { subscribeToFeedPosts, subscribeToActivityLogs } = useRealtimeContext();

  const fetchPosts = useCallback(async () => {
    try {
      const { data: socialData, error: socialError } = await supabase
        .from('feed_posts')
        .select('id, content, created_at, clubs(name), media_url, media_type')
        .order('created_at', { ascending: false })
        .limit(15);

      if (socialError && socialError.code !== '42P01') console.error(socialError);

      const gameData = await ActivityLogService.getGlobalFeed(20);

      const merged: DashboardFeedItem[] = [
         ...(socialData || []).map((p: any) => ({ 
            ...p, 
            type: 'announcement' as FeedItemType,
            clubs: Array.isArray(p.clubs) ? p.clubs[0] : p.clubs
         })),
         ...(gameData || []).map((g: any) => ({ 
            ...g, 
            type: 'gamification' as FeedItemType,
            created_at: g.createdAt
         }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
       .slice(0, 30);

      setPosts(merged);
    } catch (err) {
      console.error('Error fetching unified feed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();

    // Centralized realtime — no duplicate channels
    const unsubFeed = subscribeToFeedPosts(async (payload) => {
      const { data: clubData } = await supabase.from('clubs').select('name').eq('id', payload.new.club_id).maybeSingle();
      const newPost: DashboardFeedItem = { ...(payload.new as any), type: 'announcement', clubs: clubData || { name: 'Campus Update' } };
      setPosts(prev => [newPost, ...prev].slice(0, 30));
    });

    const unsubActivity = subscribeToActivityLogs(async (payload) => {
      const { data: userData } = await supabase.from('users').select('full_name, avatar_url, course').eq('id', payload.new.user_id).maybeSingle();
      const newEvent: DashboardFeedItem = {
        id: payload.new.id,
        type: 'gamification',
        actionType: payload.new.action_type,
        pointsAwarded: payload.new.points_awarded,
        created_at: payload.new.created_at,
        user: { fullName: userData?.full_name || 'A student', avatarUrl: userData?.avatar_url, course: userData?.course }
      };
      setPosts(prev => [newEvent, ...prev].slice(0, 30));
    });

    return () => { unsubFeed(); unsubActivity(); };
  }, [fetchPosts, subscribeToFeedPosts, subscribeToActivityLogs]);

  if (loading) {
    return (
       <div className="w-full">
         <div className="mb-8 flex items-center justify-between">
            <div>
               <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-2"></div>
               <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="bg-white dark:bg-gray-900 rounded-[2rem] h-48 border border-gray-100 dark:border-gray-800 shadow-sm p-6 animate-pulse flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                     <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-1/3"></div>
                     <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-1/4"></div>
                  </div>
                  <div className="flex gap-4 items-center">
                     <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                     <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-2/3"></div>
                  </div>
               </div>
            ))}
         </div>
       </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
         <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Campus Activity</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Live updates from around the campus</p>
         </div>
         <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full text-green-600 dark:text-green-400 text-xs font-bold border border-green-200 dark:border-green-800/50 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            Live Feed
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
         <AnimatePresence mode="popLayout">
            {posts.map((post) => (
               post.type === 'gamification' ? (
                  <ActivityCard key={`game-${post.id}`} post={post} />
               ) : (
                  <AnnouncementCard key={`announcement-${post.id}`} post={post} />
               )
            ))}
         </AnimatePresence>
      </div>
      
      {posts.length === 0 && (
         <div className="p-10 text-center bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm mt-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10">
              <Activity size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white relative z-10">Start the Action!</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto mb-6 relative z-10">You're the first one here. Join a club, attend an event, or complete a challenge to get the feed buzzing.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
              <a href="/student/events" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30">Find Events</a>
              <a href="/student/clubs" className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl transition-all">Explore Clubs</a>
            </div>
         </div>
      )}
    </div>
  );
};

export default Feed;
