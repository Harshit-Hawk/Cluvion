'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealtimeContext } from '../context/RealtimeContext';
import { LeaderboardService } from '../services/gamification/LeaderboardService';
import { Calendar, Building2, Star, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to calculate Level and Next Level XP
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

// Hexagon SVG Component
const HexagonBadge = ({ rank, baseColor, glowColor, textColor = 'text-white', size = 'w-10 h-10' }: { rank: string | number; baseColor: string; glowColor: string; textColor?: string; size?: string }) => (
  <div className={`relative ${size} flex items-center justify-center z-10`}>
    <svg viewBox="0 0 24 24" className={`absolute inset-0 w-full h-full ${baseColor} drop-shadow-md`} style={{ filter: `drop-shadow(0 4px 6px ${glowColor})` }}>
      <path d="M12 2.5L21.5 8V16L12 21.5L2.5 16V8L12 2.5Z" fill="currentColor" />
    </svg>
    <span className={`relative z-10 ${textColor} font-bold text-sm md:text-base`}>{rank}</span>
  </div>
);

const StudentLeaderboard = () => {
   const { user, userProfile } = useAuth();
   const [leaderboard, setLeaderboard] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   
   // Filters
   const [timeframe, setTimeframe] = useState('all_time'); 
   const [department, setDepartment] = useState('all'); 
   
   const { subscribeToLeaderboard, subscribeToActivityLogs } = useRealtimeContext();
   const refetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

   const fetchLeaderboard = useCallback(async () => {
      setLoading(true);
      try {
         const courseFilter = department === 'mine' ? userProfile?.course : (department !== 'all' ? department : undefined);
         const data = await LeaderboardService.getLeaderboard({
            timeframe: timeframe as any,
            course: courseFilter,
            limit: 100, // Fetch top 100 for proper representation
         });
         setLeaderboard(data || []);
      } catch (err) {
         console.error('Error fetching leaderboard:', err);
      } finally {
         setLoading(false);
      }
   }, [user, userProfile, timeframe, department]);

   const debouncedRefetch = useCallback(() => {
      if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
      refetchTimerRef.current = setTimeout(() => fetchLeaderboard(), 800);
   }, [fetchLeaderboard]);

   useEffect(() => {
      fetchLeaderboard();
      const unsubLeaderboard = subscribeToLeaderboard(debouncedRefetch);
      const unsubActivity = subscribeToActivityLogs(debouncedRefetch);
      return () => {
         unsubLeaderboard();
         unsubActivity();
         if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
      };
   }, [fetchLeaderboard, debouncedRefetch, subscribeToLeaderboard, subscribeToActivityLogs]);

   // Process Data
   const top3 = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);
   const remainingLeaderboard = useMemo(() => leaderboard.slice(3, 10), [leaderboard]); // Limit to top 10 for view
   const totalStudents = leaderboard.length > 0 ? (leaderboard.length > 128 ? leaderboard.length : 128) : 128; // Mocking total for design fidelity

   const currentUserRank = useMemo(() => {
      if (!user) return null;
      const index = leaderboard.findIndex(s => s.id === user.id);
      if (index !== -1) {
         return { ...leaderboard[index], rank: index + 1 };
      }
      return { 
         rank: leaderboard.length > 21 ? 21 : leaderboard.length + 1, 
         score: (userProfile as any)?.total_score || 0,
         fullName: userProfile?.full_name || 'You'
      };
   }, [leaderboard, user, userProfile]);

   const currentUserLevelInfo = calculateLevel(currentUserRank?.score || 0);

   const getPodiumStyle = (index: number): any => {
      switch(index) {
         case 0: return {
            bg: "bg-orange-50/50 dark:bg-orange-900/10",
            badgeBase: "text-amber-500",
            badgeGlow: "rgba(245,158,11,0.4)",
            levelBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
            scoreText: "text-orange-500",
            border: "border-orange-100 dark:border-orange-900/20"
         };
         case 1: return {
            bg: "bg-indigo-50/50 dark:bg-indigo-900/10",
            badgeBase: "text-slate-400",
            badgeGlow: "rgba(148,163,184,0.4)",
            levelBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
            scoreText: "text-blue-500",
            border: "border-indigo-100 dark:border-indigo-900/20"
         };
         case 2: return {
            bg: "bg-red-50/50 dark:bg-red-900/10",
            badgeBase: "text-amber-700/60",
            badgeGlow: "rgba(180,83,9,0.4)",
            levelBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
            scoreText: "text-red-500",
            border: "border-red-100 dark:border-red-900/20"
         };
         default: return {};
      }
   };

   return (
      <div className="max-w-[1400px] mx-auto pb-12 w-full text-gray-900 dark:text-white font-sans">
         {/* Header */}
         <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Leaderboard</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">Top performers on campus</p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
            
            {/* Left Column - Main Board */}
            <div className="space-y-6">
               
               {/* Filters */}
               <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-64">
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Timeframe</label>
                     <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select 
                           value={timeframe} 
                           onChange={(e) => setTimeframe(e.target.value)}
                           className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#0e0e12] border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                        >
                           <option value="all_time">All Time</option>
                           <option value="weekly">This Week</option>
                           <option value="monthly">This Month</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                     </div>
                  </div>

                  <div className="w-full md:w-64">
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Department</label>
                     <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select 
                           value={department} 
                           onChange={(e) => setDepartment(e.target.value)}
                           className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#0e0e12] border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                        >
                           <option value="all">All Depts</option>
                           <option value="mine">My Dept</option>
                           <option value="Computer Science">Computer Science</option>
                           <option value="Information Technology">Information Technology</option>
                           <option value="Business Administration">Business Admin</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                     </div>
                  </div>
               </div>

               {/* Top 3 Podiums */}
               {top3.length >= 3 && !loading && (
                  <div className="flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-6 pt-6 pb-2 h-auto sm:h-[300px]">
                     
                     {/* Rank 2 */}
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full sm:w-1/3 max-w-[240px] sm:h-[85%] flex flex-col justify-end mx-auto sm:mx-0 order-2 sm:order-1">
                        <div className={`p-6 rounded-2xl relative flex flex-col items-center text-center ${getPodiumStyle(1).bg} border ${getPodiumStyle(1).border} h-full`}>
                           <div className="absolute -top-5 z-20">
                              <HexagonBadge rank="2" baseColor={getPodiumStyle(1).badgeBase} glowColor={getPodiumStyle(1).badgeGlow} />
                           </div>
                           <div className="w-16 h-16 rounded-full overflow-hidden mb-3 ring-4 ring-white dark:ring-[#0e0e12] mt-4 relative z-10 bg-white">
                              {top3[1].avatarUrl ? <img src={top3[1].avatarUrl} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center w-full h-full font-bold text-xl text-slate-500">{top3[1].fullName.charAt(0)}</span>}
                           </div>
                           <h3 className="font-bold text-base mb-2 truncate w-full">{top3[1].fullName}</h3>
                           <div className={`px-3 py-0.5 rounded-full text-xs font-semibold mb-3 ${getPodiumStyle(1).levelBg}`}>
                              Level {calculateLevel(top3[1].score).level}
                           </div>
                           <div className={`mt-auto font-bold text-base ${getPodiumStyle(1).scoreText}`}>
                              {top3[1].score.toLocaleString()} XP
                           </div>
                        </div>
                     </motion.div>

                     {/* Rank 1 */}
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="w-full sm:w-1/3 max-w-[260px] sm:h-full flex flex-col justify-end z-10 mx-auto sm:mx-0 order-1 sm:order-2">
                        <div className={`p-8 rounded-2xl relative flex flex-col items-center text-center ${getPodiumStyle(0).bg} border ${getPodiumStyle(0).border} h-full`}>
                           <div className="absolute -top-6 z-20">
                              <HexagonBadge rank="1" baseColor={getPodiumStyle(0).badgeBase} glowColor={getPodiumStyle(0).badgeGlow} size="w-12 h-12" />
                           </div>
                           <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-4 ring-white dark:ring-[#0e0e12] mt-5 relative z-10 bg-white">
                              {top3[0].avatarUrl ? <img src={top3[0].avatarUrl} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center w-full h-full font-bold text-2xl text-amber-500">{top3[0].fullName.charAt(0)}</span>}
                           </div>
                           <h3 className="font-bold text-lg mb-2 truncate w-full">{top3[0].fullName}</h3>
                           <div className={`px-3 py-0.5 rounded-full text-xs font-semibold mb-4 ${getPodiumStyle(0).levelBg}`}>
                              Level {calculateLevel(top3[0].score).level}
                           </div>
                           <div className={`mt-auto font-bold text-lg ${getPodiumStyle(0).scoreText}`}>
                              {top3[0].score.toLocaleString()} XP
                           </div>
                        </div>
                     </motion.div>

                     {/* Rank 3 */}
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full sm:w-1/3 max-w-[240px] sm:h-[80%] flex flex-col justify-end mx-auto sm:mx-0 order-3">
                        <div className={`p-6 rounded-2xl relative flex flex-col items-center text-center ${getPodiumStyle(2).bg} border ${getPodiumStyle(2).border} h-full`}>
                           <div className="absolute -top-5 z-20">
                              <HexagonBadge rank="3" baseColor={getPodiumStyle(2).badgeBase} glowColor={getPodiumStyle(2).badgeGlow} />
                           </div>
                           <div className="w-16 h-16 rounded-full overflow-hidden mb-3 ring-4 ring-white dark:ring-[#0e0e12] mt-4 relative z-10 bg-white">
                              {top3[2].avatarUrl ? <img src={top3[2].avatarUrl} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center w-full h-full font-bold text-xl text-red-500">{top3[2].fullName.charAt(0)}</span>}
                           </div>
                           <h3 className="font-bold text-base mb-2 truncate w-full">{top3[2].fullName}</h3>
                           <div className={`px-3 py-0.5 rounded-full text-xs font-semibold mb-3 ${getPodiumStyle(2).levelBg}`}>
                              Level {calculateLevel(top3[2].score).level}
                           </div>
                           <div className={`mt-auto font-bold text-base ${getPodiumStyle(2).scoreText}`}>
                              {top3[2].score.toLocaleString()} XP
                           </div>
                        </div>
                     </motion.div>
                  </div>
               )}

               {/* Table List */}
               <div className="bg-white dark:bg-[#0e0e12] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                           <tr className="border-b border-gray-100 dark:border-white/5 text-[11px] text-gray-500 font-medium">
                              <th className="px-6 py-4 w-20">Rank</th>
                              <th className="px-6 py-4">Student</th>
                              <th className="px-6 py-4">Level</th>
                              <th className="px-6 py-4 text-right">XP</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/[0.02]">
                           {loading ? (
                              [...Array(5)].map((_, i) => (
                                 <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-8"></div></td>
                                    <td className="px-6 py-4 flex items-center gap-3"><div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full"></div><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16"></div></td>
                                    <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16 ml-auto"></div></td>
                                 </tr>
                              ))
                           ) : remainingLeaderboard.length > 0 ? (
                              remainingLeaderboard.map((student) => {
                                 const lvl = calculateLevel(student.score);
                                 return (
                                     <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                       <td className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                                          {student.rank}
                                       </td>
                                       <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 overflow-hidden flex-shrink-0">
                                                {student.avatarUrl ? (
                                                   <img src={student.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                   (student.fullName || 'S').charAt(0).toUpperCase()
                                                )}
                                             </div>
                                             <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                                {student.fullName}
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                          Level {lvl.level}
                                       </td>
                                       <td className="px-6 py-4 whitespace-nowrap text-right">
                                          <span className="font-medium text-sm text-indigo-600 dark:text-indigo-400">
                                             {student.score.toLocaleString()} XP
                                          </span>
                                       </td>
                                    </tr>
                                 )
                              })
                           ) : (
                              <tr>
                                 <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                                    No rankings available for this filter.
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
                  
                  {/* Footer */}
                  {!loading && leaderboard.length > 0 && (
                     <div className="px-6 py-4 text-center text-sm text-gray-500 font-medium bg-gray-50/50 dark:bg-white/[0.01] border-t border-gray-100 dark:border-white/5">
                        Showing top {remainingLeaderboard.length + 3} of {totalStudents} students
                     </div>
                  )}
               </div>

            </div>

            {/* Right Column - Your Rank */}
            <div className="w-full h-full pt-0">
               <div className="bg-white dark:bg-[#0e0e12] rounded-3xl border border-gray-100 dark:border-white/5 p-6 md:p-8 shadow-sm top-8 sticky">
                  <h3 className="font-bold text-lg mb-8">Your Rank</h3>
                  
                  <div className="flex items-center gap-4 mb-8">
                     <div className="relative">
                        {/* Purple Hexagon with Star */}
                        <div className="relative w-16 h-16 flex items-center justify-center">
                           <svg viewBox="0 0 24 24" className="absolute inset-0 w-full h-full text-indigo-600" fill="currentColor">
                              <path d="M12 2.5L21.5 8V16L12 21.5L2.5 16V8L12 2.5Z" />
                           </svg>
                           <Star className="relative z-10 text-white fill-white w-6 h-6" />
                        </div>
                     </div>
                     <div className="flex items-baseline gap-1">
                        <span className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
                           {currentUserRank?.rank || '--'}
                        </span>
                        <span className="text-gray-400 text-lg md:text-xl font-medium">/{totalStudents}</span>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Level {currentUserLevelInfo.level} <span className="mx-1 text-gray-400">•</span> {currentUserLevelInfo.title}
                     </div>
                     
                     <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                           {currentUserRank?.score?.toLocaleString() || '0'}
                        </span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">XP</span>
                     </div>

                     <div className="pt-2">
                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${currentUserLevelInfo.progress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-indigo-600 rounded-full"
                           />
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                           {currentUserLevelInfo.xpToNext.toLocaleString()} XP to Level {currentUserLevelInfo.level + 1}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

         </div>
      </div>
   );
};

export default StudentLeaderboard;
