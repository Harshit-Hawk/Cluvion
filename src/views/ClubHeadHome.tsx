'use client';

import { Activity, Star, Calendar, Image as ImageIcon, Video, Paperclip, Send, X } from 'lucide-react';
import Feed from '../components/Feed';
import { motion, useSpring, useTransform } from 'framer-motion';
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ClubHeadHome = () => {
  const { user, userProfile } = useAuth();
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const fileInputRef = useRef<any>(null);

  const handlePostSubmit: any = async () => {
    if (!postContent.trim() || isPosting) return;

    setIsPosting(true);
    try {
      const mediaData = selectedFile ? {
        media_url: selectedFile.preview,
        media_type: selectedFile.type.startsWith('video/') ? 'video' : 'image'
      } : {};

      const { error } = await supabase.from('feed_posts').insert({
        content: postContent,
        user_id: user!.id,
        ...mediaData
      });

      if (error) throw error;
      toast.success('Post shared successfully!');
      setPostContent('');
      setSelectedFile(null);
    } catch (err) {
      toast.error('Failed to share post.');
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
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

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 justify-center max-w-5xl mx-auto">

        {/* CENTER COLUMN: Main Feed */}
        <div className="w-full lg:flex-1 min-w-0">
          {/* Desktop Centered Logo */}
          <div className="hidden md:flex justify-center items-center py-4 mb-2">
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500 tracking-tight select-none cursor-pointer hover:scale-[1.02] transition-transform">
              Cluvion
            </h2>
          </div>

          {/* Create Post Box */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 mb-6 relative z-10">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-sm flex-shrink-0 flex items-center justify-center font-bold">
                {userProfile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'C'}
              </div>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="flex-1 bg-transparent resize-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 font-medium py-2 min-h-[60px]"
                placeholder="Share an update, announcement, or media with your club..."
                disabled={isPosting}
              />
            </div>

            {/* Media Preview */}
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

        {/* RIGHT COLUMN: Notifications */}
        <div className="hidden lg:block w-80 flex-shrink-0 space-y-6">
          <div className="sticky top-24">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900 dark:text-gray-100">Notifications</h3>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-md">3 New</span>
              </div>

              <div className="space-y-5">
                <div className="flex gap-3 items-start group cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-100 transition-colors"><Calendar size={14} /></div>
                  <div>
                    <p className="text-sm text-gray-800 dark:text-gray-300 line-clamp-2">Reminder: <strong>Hackathon Kickoff</strong> starts tomorrow at 10 AM.</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">1 hour ago</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start group cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-100 transition-colors"><Activity size={14} /></div>
                  <div>
                    <p className="text-sm text-gray-800 dark:text-gray-300 line-clamp-2">A new member joined <strong>your club</strong>!</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">4 hours ago</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start group cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-indigo-100 transition-colors"><Star size={14} /></div>
                  <div>
                    <p className="text-sm text-gray-800 dark:text-gray-300 line-clamp-2">Your announcement got <strong>12 reactions</strong>.</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 text-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                View all notifications
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClubHeadHome;
