'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useRealtimeContext } from '../context/RealtimeContext';
import { Heart, MessageSquare, Repeat2, Bookmark, Filter, Plus, MoreHorizontal, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ActivityLogService } from '../services/gamification/ActivityLogService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const tabs = ['All', 'Clubs', 'Events', 'Announcements'];

const PostCard = ({ post, onLike, currentUserId }: { post: any, onLike: (postId: string) => void, currentUserId?: string }) => {
  const isGamification = post.type === 'gamification';
  const [localLiked, setLocalLiked] = useState(post.is_liked || false);
  const [localLikeCount, setLocalLikeCount] = useState(post.likes || (isGamification ? Math.floor(Math.random() * 100) + 10 : 0));
  
  const handleLike = () => {
    if (isGamification) return; // Gamification posts are read-only for now or simulated
    setLocalLiked(!localLiked);
    setLocalLikeCount((prev: number) => localLiked ? prev - 1 : prev + 1);
    onLike(post.id);
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
            {post.user?.avatarUrl ? (
              <img src={post.user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                {(post.user?.fullName || 'S').charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                {post.user?.fullName || 'A student'}
              </h4>
              {post.clubs?.name && (
                <span className="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {post.clubs.name}
                </span>
              )}
              {isGamification && (
                <span className="text-[10px] text-gray-500">{post.actionType?.replace('_', ' ')}</span>
              )}
              <span className="text-xs text-gray-400">
                {post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'just now'}
              </span>
            </div>
            {!isGamification && post.content && (
              <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{post.content}</p>
            )}
            {isGamification && (
              <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
                Just earned {post.pointsAwarded} XP! ✨
              </p>
            )}
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {post.media_url && (
        <div className="mt-3 mb-4 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 relative">
          {post.media_type === 'video' ? (
            <video src={post.media_url} controls className="w-full max-h-80 object-cover" />
          ) : (
            <img src={post.media_url} alt="Post media" className="w-full max-h-80 object-cover" />
          )}
          {/* Example Hackathon overlay if media is hackathon */}
          {post.content?.toLowerCase().includes('hackathon') && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
               <div>
                  <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded">HACKATHON 2026</span>
                  <p className="text-white text-xs mt-1">Code. Innovate. Impact.</p>
               </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors group ${localLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
          >
            <Heart size={16} className={localLiked ? 'fill-current' : 'group-hover:fill-current'} />
            <span className="text-xs font-semibold">{localLikeCount}</span>
          </button>
          <button className="flex items-center gap-1.5 text-gray-400 hover:text-blue-500 transition-colors">
            <MessageSquare size={16} />
            <span className="text-xs font-semibold">{post.comments || (isGamification ? Math.floor(Math.random() * 20) + 2 : 0)}</span>
          </button>
          <button className="flex items-center gap-1.5 text-gray-400 hover:text-green-500 transition-colors">
            <Repeat2 size={16} />
            <span className="text-xs font-semibold">{post.reposts || (isGamification ? Math.floor(Math.random() * 15) + 1 : 0)}</span>
          </button>
        </div>
        <button className="text-gray-400 hover:text-purple-600 transition-colors group">
          <Bookmark size={16} className="group-hover:fill-current" />
        </button>
      </div>
    </div>
  );
};

export default function Feed() {
  const [activeTab, setActiveTab] = useState('All');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, userProfile } = useAuth();
  const { subscribeToFeedPosts, subscribeToActivityLogs } = useRealtimeContext();

  const fetchPosts = useCallback(async () => {
    try {
      const { data: socialData, error: socialError } = await supabase
        .from('posts')
        .select(`
          id, 
          content, 
          created_at, 
          image_url,
          user:users ( full_name, avatar_url, course ),
          likes:post_likes ( user_id ),
          comments:post_comments ( count )
        `)
        .order('created_at', { ascending: false })
        .limit(15);

      const gameData = await ActivityLogService.getGlobalFeed(20);

      const merged = [
         ...(socialData || []).map((p: any) => ({ 
            ...p, 
            type: 'announcement',
            media_url: p.image_url,
            media_type: 'image',
            user: p.user,
            likes: Array.isArray(p.likes) ? p.likes.length : 0,
            is_liked: Array.isArray(p.likes) ? p.likes.some((l: any) => l.user_id === user?.id) : false,
            comments: p.comments?.[0]?.count || 0,
            clubs: { name: p.user?.course || 'Campus' }
         })),
         ...(gameData || []).map((g: any) => ({ 
            ...g, 
            type: 'gamification',
            created_at: g.createdAt
         }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
       .slice(0, 30);

      setPosts(merged);
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();

    const unsubFeed = subscribeToFeedPosts(async (payload) => {
      const { data: clubData } = await supabase.from('clubs').select('name').eq('id', payload.new.club_id).maybeSingle();
      const newPost = { ...(payload.new as any), type: 'announcement', clubs: clubData || { name: 'Campus Update' } };
      setPosts(prev => [newPost, ...prev].slice(0, 30));
    });

    const unsubActivity = subscribeToActivityLogs(async (payload) => {
      const { data: userData } = await supabase.from('users').select('full_name, avatar_url, course').eq('id', payload.new.user_id).maybeSingle();
      const newEvent = {
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

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: newPostContent.trim()
      });
      
      if (error) throw error;
      
      toast.success('Post created successfully!');
      setNewPostContent('');
      setIsCreating(false);
      fetchPosts(); // Refresh feed
    } catch (err: any) {
      toast.error('Failed to create post');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    try {
      if (post.is_liked) {
        await supabase.from('post_likes').delete().match({ post_id: postId, user_id: user.id });
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
      }
    } catch (err) {
      console.error('Like toggle failed:', err);
    }
  };

  // If no posts yet but not loading, add a couple of dummy posts based on the image
  const displayPosts = posts.length > 0 ? posts : [
    {
      id: 1, type: 'announcement', user: { fullName: 'Priya Singh' }, clubs: { name: 'AI Society' },
      content: 'Excited to announce our new AI workshop this weekend! 🚀', created_at: new Date(Date.now() - 1200000).toISOString(),
      media_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2070&auto=format&fit=crop'
    },
    {
      id: 2, type: 'gamification', user: { fullName: 'Rahul Verma' }, clubs: { name: 'Coding Club' }, actionType: 'badge_unlocked',
      pointsAwarded: 50, created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 3, type: 'announcement', user: { fullName: 'Cluvion Official' }, clubs: { name: 'Admin' },
      content: 'Hackathon 2026 registrations are now open! Don\'t miss out 🔥', created_at: new Date(Date.now() - 7200000).toISOString(),
      media_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop'
    }
  ];

  return (
    <div className="w-full">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-1 flex-1 overflow-x-auto scrollbar-hide">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mr-2 whitespace-nowrap">Campus Feed</h2>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          <button className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-2 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Filter <Filter size={16} />
          </button>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl shadow-sm shadow-purple-600/30 transition-all"
          >
            <Plus size={16} strokeWidth={3} />
            Create Post
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-6 shadow-sm">
          <div className="flex gap-4">
             <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
               {userProfile?.avatar_url ? (
                 <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                   {userProfile?.full_name?.charAt(0) || 'U'}
                 </div>
               )}
             </div>
             <div className="flex-1">
               <textarea
                 value={newPostContent}
                 onChange={(e) => setNewPostContent(e.target.value)}
                 placeholder="What's happening on campus?"
                 className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 min-h-[100px] resize-none outline-none dark:text-white"
               />
               <div className="flex items-center justify-between mt-3">
                  <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                    <ImageIcon size={20} />
                  </button>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsCreating(false)}
                      className="px-4 py-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleCreatePost}
                      disabled={isSubmitting || !newPostContent.trim()}
                      className="px-6 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-sm shadow-purple-600/20 transition-all"
                    >
                      {isSubmitting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
               </div>
             </div>
          </div>
        </div>
      )}

      {loading ? (
         <div className="space-y-4">
            {[1,2,3].map(i => (
               <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl h-40 border border-gray-100 dark:border-gray-800 shadow-sm p-5 animate-pulse">
                  <div className="flex gap-4 items-center mb-4">
                     <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                     <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-1/4"></div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-1/2"></div>
               </div>
            ))}
         </div>
      ) : (
        <div className="space-y-0">
          {displayPosts.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLikePost} currentUserId={user?.id} />
          ))}
        </div>
      )}
    </div>
  );
}
