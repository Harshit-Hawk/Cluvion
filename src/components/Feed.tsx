'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import type { FeedPost, Comment } from '../types';

const SocialPost = ({ post }: { post: FeedPost }) => {
   const [liked, setLiked] = useState(false);
   const [saved, setSaved] = useState(false);
   const [likesCount, setLikesCount] = useState(Math.floor(Math.random() * 50) + 5);
   const [showComments, setShowComments] = useState(false);
   const [comments, setComments] = useState<Comment[]>([]);
   const [newComment, setNewComment] = useState('');

   const handleLike = () => {
      setLiked(!liked);
      setLikesCount(prev => liked ? prev - 1 : prev + 1);
   };

   // Generate a placeholder gradient based on the club name length to make posts distinct
   const gradientVariations = [
      "from-blue-400 to-indigo-500",
      "from-emerald-400 to-teal-500",
      "from-orange-400 to-rose-500",
      "from-purple-400 to-pink-500",
      "from-cyan-400 to-blue-500"
   ];
   const clubNameLength = post.clubs?.name?.length || 0;
   const gradientClass = gradientVariations[clubNameLength % gradientVariations.length];

   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mb-6"
      >
         {/* Post Header */}
         <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-200 shadow-inner border border-white dark:border-gray-900">
                  {post.clubs?.name?.charAt(0) || 'C'}
               </div>
               <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{post.clubs?.name || 'Campus Club'}</h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                     {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
               </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-2">
               <MoreHorizontal size={20} />
            </button>
         </div>


         <div className="px-5 pb-3 pt-1">
            <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed whitespace-pre-wrap">
               {post.content}
            </p>
         </div>

         {post.media_url && (
            <div className="px-5 pb-4">
               {post.media_type === 'video' ? (
                  <video controls className="w-full rounded-2xl bg-gray-100 dark:bg-gray-800 max-h-96 object-contain" src={post.media_url} />
               ) : (
                  <img src={post.media_url} alt="Attached media" className="w-full rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 max-h-96 object-cover" />
               )}
            </div>
         )}

         {/* Action Bar */}
         <div className="px-5 pb-4">
            <div className="flex items-center gap-4 mb-3">
               <button onClick={handleLike} className="group flex items-center gap-1.5">
                  <Heart 
                     size={22} 
                     className={`transition-all ${liked ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-700 dark:text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300 hover:scale-110'}`} 
                  />
               </button>
               <button onClick={() => setShowComments(!showComments)} className="text-gray-700 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-all hover:scale-110 flex items-center gap-1.5">
                  <MessageCircle size={22} />
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-500">
                     {comments.length}
                  </span>
               </button>
            </div>

            {/* Comments Section */}
            {showComments && (
               <div className="mt-4 space-y-3">
                  {comments.length > 0 ? comments.map(c => (
                     <div key={c.id} className="text-sm">
                        <span className="font-bold text-gray-900 dark:text-gray-100 mr-2">{c.user}</span>
                        <span className="text-gray-800 dark:text-gray-300">{c.text}</span>
                     </div>
                  )) : (
                     <p className="text-sm text-gray-500 dark:text-gray-500 italic">No comments yet. Be the first!</p>
                  )}
                  
                  <form 
                     onSubmit={(e) => {
                        e.preventDefault();
                        if (!newComment.trim()) return;
                        setComments([...comments, { id: Date.now(), user: 'You', text: newComment }]);
                        setNewComment('');
                     }}
                     className="mt-3 flex items-center gap-2"
                  >
                     <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..." 
                        className="flex-1 text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 outline-none focus:border-blue-400 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-colors"
                     />
                     <button type="submit" disabled={!newComment.trim()} className="text-blue-600 font-semibold text-sm disabled:opacity-50 transition-opacity">
                        Post
                     </button>
                  </form>
               </div>
            )}
         </div>
      </motion.div>
   );
};

const Feed = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription;

    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('feed_posts')
          .select('id, content, created_at, clubs(name), media_url, media_type')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        // In Supabase, joining a single table returns an object or array depending on relation. We assume object here.
        setPosts((data as unknown as FeedPost[]) || []);
      } catch (err) {
        console.error('Error fetching feed:', err);
      } finally {
        setLoading(false);
      }
    };

    const subscribeToPosts = () => {
      subscription = supabase
        .channel('public:feed_posts')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'feed_posts' 
        }, async (payload) => {
          const { data: clubData } = await supabase
            .from('clubs')
            .select('name')
            .eq('id', payload.new.club_id)
            .single();

          const newPost: FeedPost = {
            ...(payload.new as FeedPost),
            clubs: clubData || { name: 'Unknown Club' }
          };

          setPosts(prev => [newPost, ...prev]);
        })
        .subscribe();
    };

    fetchPosts();
    subscribeToPosts();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  if (loading) {
    return (
       <div className="space-y-6">
           {[1,2,3].map(i => (
             <div key={i} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 animate-pulse">
                <div className="flex gap-3 items-center mb-4">
                   <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                   <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
                <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4"></div>
             </div>
          ))}
       </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto md:max-w-none md:mx-0">
      <AnimatePresence>
        {posts.map((post) => (
           <SocialPost key={post.id} post={post} />
        ))}
      </AnimatePresence>
      {posts.length === 0 && (
         <div className="p-12 text-center text-gray-400 border border-dashed rounded-3xl">No posts available.</div>
      )}
    </div>
  );
};

export default Feed;
