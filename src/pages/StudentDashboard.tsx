// @ts-nocheck
'use client';

import { Activity, Star, Calendar, Image as ImageIcon, Video, Paperclip, Send, X, Award } from 'lucide-react';
import Feed from '../components/Feed';
import { motion, useSpring, useTransform } from 'framer-motion';
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { toast } from 'react-toastify';
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

const NOTIF_TYPE_CONFIG = {
  event:        { icon: Calendar, bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
  achievement:  { icon: Award,    bg: 'bg-amber-50 dark:bg-amber-900/30',     text: 'text-amber-600 dark:text-amber-400' },
  points:       { icon: Activity, bg: 'bg-blue-50 dark:bg-blue-900/30',       text: 'text-blue-600 dark:text-blue-400' },
  announcement: { icon: Star,     bg: 'bg-indigo-50 dark:bg-indigo-900/30',   text: 'text-indigo-600 dark:text-indigo-400' },
};

const StudentDashboard = () => {
  const { user, userProfile } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const [stats, setStats] = useState({ score: 0, achievements: 0, events: 0 });
  const [myClubs, setMyClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);


  useEffect(() => {
    if (!user) return;

    const fetchStudentData = async () => {
      setLoading(true);

      try {
        // Execute queries in parallel
        const [
          { data: scoreData },
          { count: achievementsCount },
          { count: eventsCount }, /* events count is tricky since it's events attended. We check activity_logs with 'event_attended' */
          { data: clubsData }
        ] = await Promise.all([
          supabase.from('student_scores').select('activeness_score').eq('user_id', user.id).maybeSingle(),
          supabase.from('achievements').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('action_type', 'event_attended'),
          supabase.from('memberships')
            .select(`
              id, joined_at,
              clubs (name, id)
            `)
            .eq('user_id', user.id)
            .eq('role', 'member')
        ]);

        setStats({
          score: scoreData?.activeness_score || 0,
          achievements: achievementsCount || 0,
          events: eventsCount || 0
        });

        setMyClubs(clubsData || []);
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();



    // Setup realtime listener for score updates
    const logSubscription = supabase
      .channel('activity_logs_student')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs', filter: `user_id=eq.${user.id}` }, 
        (payload) => {
           setStats(prev => ({
              ...prev,
              score: prev.score + payload.new.points_awarded,
              events: payload.new.action_type === 'event_attended' ? prev.events + 1 : prev.events
           }));
           toast.success(`You earned +${payload.new.points_awarded} points!`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(logSubscription);
    };
  }, [user]);

  const handleLeaveClub = async (membershipId) => {
    try {
      const { error } = await supabase.from('memberships').delete().eq('id', membershipId);
      if (error) throw error;
      setMyClubs(prev => prev.filter(c => c.id !== membershipId));
      toast.info('You left the club.');
    } catch (err) {
      toast.error('Failed to leave club.');
      console.error(err);
    }
  };

  const handlePostSubmit = async () => {
    if (!postContent.trim() || isPosting) return;

    setIsPosting(true);
    try {
      const mediaData = selectedFile ? {
        media_url: selectedFile.preview,
        media_type: selectedFile.type.startsWith('video/') ? 'video' : 'image'
      } : {};

      const { error } = await supabase.from('feed_posts').insert({
        content: postContent,
        user_id: user.id,
        ...mediaData
      });

      if (error) throw error;
      toast.success('Announcement shared successfully!');
      setPostContent('');
      setSelectedFile(null);
    } catch (err) {
      toast.error('Failed to post announcement.');
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
         toast.error("File size must be less than 10MB");
         return;
      }
      setSelectedFile({
         file,
         preview: URL.createObjectURL(file),
         type: file.type
      });
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const initial = user?.user_metadata?.full_name ? user.user_metadata.full_name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'S');

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* 2-Column Social Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 justify-center max-w-5xl mx-auto">
        
        {/* LEFT COLUMN: Removed per user request */}

        {/* CENTER COLUMN: Main Feed */}
        <div className="w-full lg:flex-1 min-w-0">
           {/* Desktop Centered Logo (Hidden on mobile) */}
           <div className="hidden md:flex justify-center items-center py-4 mb-2">
             <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500 tracking-tight select-none cursor-pointer hover:scale-[1.02] transition-transform">
               Cluvion
             </h2>
           </div>

           {/* 'Create Post' Interactive Input */}
           <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 mb-6 relative z-10">
              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-sm flex-shrink-0 flex items-center justify-center font-bold">
                    {userProfile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'S'}
                 </div>
                 <textarea 
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="flex-1 bg-transparent resize-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 font-medium py-2 min-h-[60px]"
                    placeholder="Share a campus update, photo, or video..."
                    disabled={isPosting}
                 ></textarea>
              </div>
               {/* Media Preview Area */}
               {selectedFile && (
                  <div className="relative mt-2 mb-4 inline-block">
                     {selectedFile.type.startsWith('video/') ? (
                        <video src={selectedFile.preview} className="max-h-48 rounded-xl object-contain bg-gray-100" />
                     ) : (
                        <img src={selectedFile.preview} alt="Upload preview" className="max-h-48 rounded-xl object-contain bg-gray-100 border border-gray-200" />
                     )}
                     <button 
                        onClick={removeFile}
                        className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 shadow-md hover:bg-gray-700 transition-colors"
                     >
                        <X size={14} />
                     </button>
                  </div>
               )}

              <div className="border-t border-gray-100 dark:border-gray-800 mt-3 pt-3 flex items-center justify-between relative">
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*,video/*"
                 />
                 <div className="flex gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors">
                       <ImageIcon size={18} className="text-blue-500" />
                       <span className="text-sm font-semibold hidden sm:inline">Photo</span>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 transition-colors">
                       <Video size={18} className="text-indigo-500" />
                       <span className="text-sm font-semibold hidden sm:inline">Video</span>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-amber-50 text-gray-500 hover:text-amber-600 transition-colors">
                       <Paperclip size={18} className="text-amber-500" />
                       <span className="text-sm font-semibold hidden sm:inline">Attach</span>
                    </button>
                 </div>
                 <button 
                    onClick={handlePostSubmit} 
                    disabled={(!postContent.trim() && !selectedFile) || isPosting}
                    className={`bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded-full font-bold text-sm shadow-md shadow-blue-200 transition-colors flex items-center gap-2 ${((!postContent.trim() && !selectedFile) || isPosting) ? 'opacity-50 cursor-not-allowed hover:bg-blue-600' : ''}`}
                 >
                    {isPosting ? 'Posting...' : 'Post'}
                    {!isPosting && <Send size={14} />}
                 </button>
              </div>
           </div>

           {/* The Feed */}
           <Feed />
        </div>


      </div>
    </div>
  );
};

export default StudentDashboard;
