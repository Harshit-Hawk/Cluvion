'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { 
  Pencil, Copy, Calendar, Building2, MapPin, Mail, Phone, 
  Star, Edit2, FileText, Award, Users, CalendarDays, Zap, 
  Shield, Flame, ChevronRight, X, Save, QrCode, CreditCard
} from 'lucide-react';
import type { UserProfile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import QRCode from 'react-qr-code';

// Calculate level helper (matching leaderboard)
const calculateLevel = (xp: number) => {
   const level = Math.floor(xp / 100) + 1;
   const nextLevelXp = level * 100;
   const xpToNext = nextLevelXp - xp;
   const progress = ((xp - ((level - 1) * 100)) / 100) * 100;
   
   let title = "Beginner";
   if (level >= 3) title = "Rising Star";
   if (level >= 5) title = "Achiever";
   if (level >= 7) title = "Prodigy";
   if (level >= 10) title = "Campus Legend";
   
   return { level, nextLevelXp, xpToNext, progress, title };
};

export default function StudentProfile() {
  const { user, userProfile, updateProfile } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showVirtualId, setShowVirtualId] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  
  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Settings form state
  const [formData, setFormData] = useState({
    full_name: '',
    department: '',
    semester: '',
    batch: '',
    section: '',
    phone: '',
    course: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        department: userProfile.department || '',
        semester: userProfile.semester ? String(userProfile.semester) : '',
        batch: userProfile.batch || '',
        section: userProfile.section || '',
        phone: userProfile.phone || '',
        course: userProfile.course || ''
      });
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  }, [userProfile]);

  const initials = userProfile?.full_name?.charAt(0) || 'S';
  const name = userProfile?.full_name || 'Student';
  const xp = (userProfile as any)?.total_score || 340;
  const levelInfo = calculateLevel(xp);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    
    let newAvatarUrl = userProfile?.avatar_url || '';

    if (avatarFile) {
       try {
          const fileExt = avatarFile.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}.${fileExt}`;
          const { data, error } = await supabase.storage.from('avatars').upload(fileName, avatarFile, { upsert: true });
          
          if (!error && data) {
             const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
             newAvatarUrl = publicUrl;
          } else {
             newAvatarUrl = avatarPreview || newAvatarUrl;
          }
       } catch (err) {
          newAvatarUrl = avatarPreview || newAvatarUrl;
       }
    }
    
    const payload = {
      full_name: formData.full_name,
      department: formData.department,
      semester: formData.semester ? Number(formData.semester) : null,
      batch: formData.batch,
      section: formData.section,
      phone: formData.phone,
      course: formData.course,
      avatar_url: newAvatarUrl
    };
    
    const { error } = await supabase.from('users').update(payload).eq('id', user.id);
    
    setIsSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Profile updated');
      updateProfile(payload as Partial<UserProfile>);
      setShowSettings(false);
    }
  };

  const copyRollNo = () => {
     if (userProfile?.roll_no) {
        navigator.clipboard.writeText(userProfile.roll_no);
        toast.success("Roll No. copied to clipboard!");
     }
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-20 pt-4 w-full text-gray-900 dark:text-white font-sans space-y-6">
      
      {/* 1. Header Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
         
         {/* Identity Card */}
         <div className="bg-white dark:bg-[#0e0e12] rounded-3xl border border-gray-100 dark:border-white/5 p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-sm relative">
            <button 
               onClick={() => setShowSettings(true)}
               className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors border border-gray-200 dark:border-white/10"
            >
               <Edit2 size={14} />
               Edit Profile
            </button>
            
            {/* Avatar container */}
            <div className="relative shrink-0 mx-auto md:mx-0">
               <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-gray-100 shadow-inner">
                  {userProfile?.avatar_url ? (
                     <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                     <div className="w-full h-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-4xl">
                        {initials}
                     </div>
                  )}
               </div>

            </div>

            {/* Info Container */}
            <div className="flex-1 flex flex-col justify-center text-center md:text-left">
               <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{name}</h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-full text-xs font-bold w-max mx-auto md:mx-0">
                     <Star size={12} className="fill-indigo-600 dark:fill-indigo-400" />
                     {levelInfo.title}
                  </span>
               </div>
               
               <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 dark:text-gray-400 text-sm mb-6">
                  <span>Roll No. {userProfile?.roll_no || 'N/A'}</span>
                  {userProfile?.roll_no && (
                     <button onClick={copyRollNo} className="hover:text-indigo-600 transition-colors">
                        <Copy size={14} />
                     </button>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm text-gray-600 dark:text-gray-300 font-medium">
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                     <Building2 size={16} className="text-gray-400" />
                     <span className="truncate">{userProfile?.department || userProfile?.course || 'Department not set'}</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                     <Calendar size={16} className="text-gray-400" />
                     <span>{userProfile?.semester ? `Semester ${userProfile.semester}` : 'Semester not set'}</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                     <MapPin size={16} className="text-gray-400" />
                     <span className="truncate">{userProfile?.college || 'College not set'}</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                     <Mail size={16} className="text-gray-400" />
                     <span className="truncate">{user?.email || 'Email not set'}</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                     <Phone size={16} className="text-gray-400" />
                     <span>{userProfile?.phone || 'Phone not set'}</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Rank Card */}
         <div className="bg-white dark:bg-[#0e0e12] rounded-3xl border border-gray-100 dark:border-white/5 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative z-10">
               <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Your Rank</h3>

            </div>

            <div className="flex flex-col relative z-10 space-y-4">
               <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                     <svg viewBox="0 0 24 24" className="absolute inset-0 w-full h-full text-indigo-600 drop-shadow-[0_4px_10px_rgba(79,70,229,0.3)]" fill="currentColor">
                        <path d="M12 2.5L21.5 8V16L12 21.5L2.5 16V8L12 2.5Z" />
                     </svg>
                     <Star className="relative z-10 text-white fill-white w-6 h-6" />
                  </div>
                  <div className="flex items-baseline gap-1">
                     <span className="text-4xl font-black text-gray-900 dark:text-white">21</span>
                     <span className="text-gray-400 font-medium">/128</span>
                  </div>
               </div>

               <div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                     Level {levelInfo.level} <span className="mx-1 text-gray-400">•</span> {levelInfo.title}
                  </div>
                  <div className="flex items-baseline gap-1 mb-3">
                     <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{xp.toLocaleString()}</span>
                     <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">XP</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                     <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${levelInfo.progress}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-indigo-600 rounded-full"
                     />
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                     {levelInfo.xpToNext.toLocaleString()} XP to Level {levelInfo.level + 1}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* 2. Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
         {[
            { label: 'Events Joined', count: '18', icon: CalendarDays, bg: 'bg-indigo-50 dark:bg-indigo-900/20', iconColor: 'text-indigo-600' },
            { label: 'Clubs Joined', count: '6', icon: Users, bg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600' },
            { label: 'Badges Earned', count: '12', icon: Award, bg: 'bg-orange-50 dark:bg-orange-900/20', iconColor: 'text-orange-600' },
            { label: 'Certificates', count: '7', icon: FileText, bg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600' },
            { label: 'Virtual ID', count: 'View', icon: QrCode, bg: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600', onClick: () => setShowVirtualId(true) },
         ].map((stat, i) => (
            <div key={i} onClick={stat.onClick} className="bg-white dark:bg-[#0e0e12] rounded-3xl border border-gray-100 dark:border-white/5 p-5 shadow-sm flex items-center justify-between group cursor-pointer hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-colors">
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                     <stat.icon size={24} className={stat.iconColor} />
                  </div>
                  <div>
                     <p className="text-xs font-semibold text-gray-500 mb-0.5">{stat.label}</p>
                     <p className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{stat.count}</p>
                  </div>
               </div>
               <div className="flex flex-col items-end gap-3 mt-auto">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-[10px] font-bold text-indigo-600 flex items-center">View all <ChevronRight size={12}/></span>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* 3. Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-100 dark:border-white/5 px-2 overflow-x-auto no-scrollbar">
         {['Overview', 'Activity', 'Events', 'Clubs', 'Badges', 'Certificates', 'Achievements'].map(tab => (
            <button 
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`py-4 font-bold text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === tab ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
               {tab}
            </button>
         ))}
      </div>

      {/* 4. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Left Column (Col-span-2) */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* About Me */}
            <div className="bg-white dark:bg-[#0e0e12] rounded-3xl border border-gray-100 dark:border-white/5 p-6 md:p-8 shadow-sm">
               <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  About Me
               </h2>
               <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  Enthusiastic {userProfile?.department || 'student'} passionate about Web Development, AI/ML and solving real-world problems through technology. Always eager to learn, collaborate and build impactful projects.
               </p>
            </div>

            {/* Skills */}
            <div className="bg-white dark:bg-[#0e0e12] rounded-3xl border border-gray-100 dark:border-white/5 p-6 md:p-8 shadow-sm">
               <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                  Skills
               </h2>
               <div className="flex flex-wrap gap-2">
                  {['Web Development', 'JavaScript', 'React.js', 'Node.js', 'Python', 'C++', 'UI/UX Design'].map(skill => (
                     <span key={skill} className="px-4 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold border border-gray-200 dark:border-white/10">
                        {skill}
                     </span>
                  ))}
               </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-[#0e0e12] rounded-3xl border border-gray-100 dark:border-white/5 p-6 md:p-8 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                     <Zap className="w-5 h-5 text-indigo-600" />
                     Recent Activity
                  </h2>
                  <button className="text-xs font-bold text-indigo-600 hover:underline">View all &rarr;</button>
               </div>
               
               <div className="space-y-6">
                  {[
                     { title: 'Registered for Hackathon 2024', time: '2 days ago', icon: CalendarDays, bg: 'bg-indigo-50 dark:bg-indigo-900/20', color: 'text-indigo-600' },
                     { title: 'Joined AI & ML Club', time: '5 days ago', icon: Users, bg: 'bg-emerald-50 dark:bg-emerald-900/20', color: 'text-emerald-600' },
                     { title: 'Earned badge "Event Explorer"', time: '1 week ago', icon: Award, bg: 'bg-orange-50 dark:bg-orange-900/20', color: 'text-orange-600' },
                  ].map((activity, i) => (
                     <div key={i} className="flex items-center gap-4 group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.bg} shrink-0`}>
                           <activity.icon size={18} className={activity.color} />
                        </div>
                        <div className="flex-1">
                           <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 transition-colors">{activity.title}</p>
                        </div>
                        <div className="text-xs font-medium text-gray-400">
                           {activity.time}
                        </div>
                     </div>
                  ))}
               </div>
            </div>

         </div>

         {/* Right Column (Col-span-1) */}
         <div className="space-y-6">
            
            {/* Achievements */}
            <div className="bg-white dark:bg-[#0e0e12] rounded-3xl border border-gray-100 dark:border-white/5 p-6 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                     <Award className="w-4 h-4 text-gray-400" />
                     Achievements
                  </h2>
                  <button className="text-xs font-bold text-indigo-600 hover:underline">View all &rarr;</button>
               </div>
               
               <div className="grid grid-cols-4 gap-2">
                  {[
                     { name: 'Event Explorer', icon: MapPin, color: 'text-indigo-600', glow: 'rgba(79,70,229,0.3)' },
                     { name: 'Early Bird', icon: Shield, color: 'text-emerald-600', glow: 'rgba(16,185,129,0.3)' },
                     { name: 'Streak Master', icon: Flame, color: 'text-orange-600', glow: 'rgba(249,115,22,0.3)' },
                     { name: 'Club Leader', icon: Star, color: 'text-blue-600', glow: 'rgba(59,130,246,0.3)' },
                  ].map((ach, i) => (
                     <div key={i} className="flex flex-col items-center text-center gap-2 group cursor-pointer">
                        <div className="relative w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-110">
                           <svg viewBox="0 0 24 24" className={`absolute inset-0 w-full h-full ${ach.color}`} style={{ filter: `drop-shadow(0 4px 6px ${ach.glow})` }} fill="currentColor">
                              <path d="M12 2.5L21.5 8V16L12 21.5L2.5 16V8L12 2.5Z" />
                           </svg>
                           <ach.icon size={16} className="relative z-10 text-white fill-white/20" />
                        </div>
                        <span className="text-[9px] font-bold text-gray-500 leading-tight">{ach.name}</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white dark:bg-[#0e0e12] rounded-3xl border border-gray-100 dark:border-white/5 p-6 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">Upcoming Events</h2>
                  <button className="text-xs font-bold text-indigo-600 hover:underline">View all &rarr;</button>
               </div>
               
               <div className="space-y-4">
                  {[
                     { title: 'Hackathon 2024', loc: 'Main Auditorium', day: '25', month: 'MAY', bg: 'bg-indigo-100 dark:bg-indigo-900' },
                     { title: 'Web Development Workshop', loc: 'Lab 301', day: '02', month: 'JUN', bg: 'bg-blue-100 dark:bg-blue-900' },
                     { title: 'Tech Trivia Night', loc: 'Seminar Hall', day: '10', month: 'JUN', bg: 'bg-slate-800 dark:bg-slate-800' },
                  ].map((event, i) => (
                     <div key={i} className="flex items-center gap-4 group cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-white/5 p-2 -mx-2 rounded-2xl transition-colors">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${event.bg} shrink-0`}>
                           <Calendar size={20} className="text-white opacity-80" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                           <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin size={12} /> {event.loc}
                           </p>
                        </div>
                        <div className="w-10 flex flex-col items-center justify-center border border-gray-200 dark:border-gray-800 rounded-lg py-1 shrink-0 bg-gray-50 dark:bg-white/5">
                           <span className="text-sm font-black text-gray-900 dark:text-white leading-none">{event.day}</span>
                           <span className="text-[8px] font-bold text-gray-500 mt-0.5">{event.month}</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Club Memberships */}
            <div className="bg-white dark:bg-[#0e0e12] rounded-3xl border border-gray-100 dark:border-white/5 p-6 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">Club Memberships</h2>
                  <button className="text-xs font-bold text-indigo-600 hover:underline">View all &rarr;</button>
               </div>
               
               <div className="space-y-4">
                  {[
                     { name: 'CodeCraft Club', role: 'Member', bg: 'bg-purple-600', pill: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' },
                     { name: 'AI & ML Club', role: 'Core Member', bg: 'bg-gray-900 dark:bg-gray-800', pill: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' },
                     { name: 'Photography Club', role: 'Member', bg: 'bg-slate-800 dark:bg-slate-700', pill: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' },
                  ].map((club, i) => (
                     <div key={i} className="flex items-center gap-3 group cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-white/5 p-2 -mx-2 rounded-2xl transition-colors">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${club.bg} shrink-0`}>
                           <span className="text-white font-bold text-sm">{club.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{club.name}</h4>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border border-transparent ${club.pill}`}>
                           {club.role}
                        </div>
                     </div>
                  ))}
               </div>
            </div>

         </div>
      </div>

      {/* Settings Modal (kept same functional logic) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 z-10 bg-white dark:bg-gray-900">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
                <button onClick={() => setShowSettings(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <X size={18} className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="flex flex-col items-center mb-6">
                     <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white dark:border-[#0e0e12] shadow-sm mb-3">
                        {avatarPreview ? (
                           <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : userProfile?.avatar_url ? (
                           <img src={userProfile.avatar_url} alt="Current" className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-3xl">
                              {initials}
                           </div>
                        )}
                        <div 
                           className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                           onClick={() => fileInputRef.current?.click()}
                        >
                           <Edit2 size={20} className="text-white" />
                        </div>
                     </div>
                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                     <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-indigo-600 hover:underline">Change Picture</button>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                    <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Department</label>
                    <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="e.g. Computer Science" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Batch</label>
                      <input type="text" value={formData.batch} onChange={e => setFormData({...formData, batch: e.target.value})} placeholder="e.g. 2026" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Semester</label>
                      <input type="number" min="1" max="10" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} placeholder="1-8" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Section</label>
                      <input type="text" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value.toUpperCase()})} placeholder="e.g. A" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone</label>
                      <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91..." className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
                    <button type="submit" disabled={isSaving} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-colors disabled:opacity-50">
                      {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={18} /> Save Changes</>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Virtual ID Modal */}
      <AnimatePresence>
        {showVirtualId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if(e.target === e.currentTarget) setShowVirtualId(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="w-full max-w-[480px] relative"
            >
               <button onClick={() => setShowVirtualId(false)} className="absolute -top-12 right-0 p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors shadow-sm z-10">
                 <X size={20} />
               </button>
               
               {/* ID Card */}
               <div className="bg-[#f2f0ff] dark:bg-[#1a192b] rounded-[2rem] shadow-2xl p-6 flex flex-col w-full relative">
                  <div className="text-[11px] font-black text-[#1e1b4b] dark:text-indigo-300 tracking-wider uppercase mb-6 ml-2">
                     Gateway Education
                  </div>
                  
                  <div className="flex flex-row items-center justify-between gap-4 px-2">
                     {/* Avatar */}
                     <div className="w-[88px] h-[104px] rounded-2xl bg-gray-200 overflow-hidden shrink-0 shadow-sm">
                        {userProfile?.avatar_url ? (
                           <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-500">{initials}</div>
                        )}
                     </div>
                     
                     {/* Info */}
                     <div className="flex-1 flex flex-col justify-center min-w-0 pr-2">
                        <h3 className="text-[19px] font-black text-[#1e1b4b] dark:text-white leading-tight truncate">{name}</h3>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-1 mb-2">{userProfile?.roll_no || 'N/A'}</p>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-semibold leading-snug">
                           {userProfile?.department || userProfile?.course || 'Computer Science Engineering'}
                        </p>
                     </div>
                     
                     {/* QR Code */}
                     <div className="shrink-0 bg-white p-2 rounded-xl shadow-sm">
                        <QRCode 
                           value={userProfile?.roll_no || user?.id || 'cluvion'}
                           size={88}
                           level="M"
                           fgColor="#1e1b4b"
                        />
                     </div>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
