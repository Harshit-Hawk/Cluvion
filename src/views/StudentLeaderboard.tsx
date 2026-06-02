// @ts-nocheck
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealtimeContext } from '../context/RealtimeContext';
import { LeaderboardService } from '../services/gamification/LeaderboardService';
import { Trophy, Medal, Award, Activity, Filter, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentLeaderboard = () => {
   const { user, userProfile } = useAuth();
   const [leaderboard, setLeaderboard] = useState([]);
   const [loading, setLoading] = useState(true);
   
   // Filters
   const [timeframe, setTimeframe] = useState('all_time'); // 'all_time', 'weekly', 'monthly'
   const [department, setDepartment] = useState('all'); // 'all', 'mine', or specific string
   const [clubId, setClubId] = useState('all'); // 'all' or specific club ID
   
   // Sorting
   const [sortField, setSortField] = useState('score');
   const [sortDirection, setSortDirection] = useState('desc');
   
   // Search
   const [searchQuery, setSearchQuery] = useState('');

   const { subscribeToLeaderboard, subscribeToActivityLogs } = useRealtimeContext();
   const refetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

   const fetchLeaderboard = useCallback(async () => {
      setLoading(true);
      try {
         const courseFilter = department === 'mine' ? userProfile?.course : (department !== 'all' ? department : undefined);
         const clubFilter = clubId !== 'all' ? clubId : undefined;
         const data = await LeaderboardService.getLeaderboard({
            timeframe: timeframe as any,
            course: courseFilter,
            clubId: clubFilter,
            limit: 50,
         });
         setLeaderboard(data || []);
      } catch (err) {
         console.error('Error fetching leaderboard:', err);
      } finally {
         setLoading(false);
      }
   }, [user, userProfile, timeframe, department, clubId]);

   // Debounced refetch — prevents multiple rapid Supabase calls from realtime bursts
   const debouncedRefetch = useCallback(() => {
      if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
      refetchTimerRef.current = setTimeout(() => fetchLeaderboard(), 800);
   }, [fetchLeaderboard]);

   useEffect(() => {
      fetchLeaderboard();

      // Use centralized realtime context — prevents duplicate channels
      const unsubLeaderboard = subscribeToLeaderboard(debouncedRefetch);
      const unsubActivity = subscribeToActivityLogs(debouncedRefetch);

      return () => {
         unsubLeaderboard();
         unsubActivity();
         if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
      };
   }, [fetchLeaderboard, debouncedRefetch, subscribeToLeaderboard, subscribeToActivityLogs]);

   // Handle Sorting
   const handleSort = (field) => {
      if (sortField === field) {
         setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
         setSortField(field);
         setSortDirection(field === 'rank' || field === 'score' ? 'desc' : 'asc');
      }
   };

   // Process Data: Search & Sort for Ranks 4+
   const top3 = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);
   const remainingLeaderboard = useMemo(() => leaderboard.slice(3), [leaderboard]);

   const processedTableData = useMemo(() => {
      let filtered = remainingLeaderboard;
      
      // Apply search
      if (searchQuery.trim()) {
         // If searching, we might want to search the entire leaderboard, but the user specifically requested 
         // "the ranks are on the list ... starts from the 4th rank rest of the three showing only in the podium"
         // so we search within remainingLeaderboard.
         filtered = filtered.filter(student => 
            student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.course.toLowerCase().includes(searchQuery.toLowerCase())
         );
      }
      
      // Apply sort
      return [...filtered].sort((a, b) => {
         let aVal = a[sortField];
         let bVal = b[sortField];
         
         if (typeof aVal === 'string') aVal = aVal.toLowerCase();
         if (typeof bVal === 'string') bVal = bVal.toLowerCase();
         
         if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
         if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
         return 0;
      });
   }, [remainingLeaderboard, searchQuery, sortField, sortDirection]);

   const getRankStyle = (index) => {
      switch(index) {
         case 0: return "bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-white shadow-lg shadow-yellow-200/50 dark:shadow-none border-none z-10 scale-[1.02]";
         case 1: return "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 text-gray-800 shadow-md shadow-gray-200/50 dark:shadow-none border-none z-10";
         case 2: return "bg-gradient-to-r from-orange-300 via-orange-400 to-amber-600 text-white shadow-md shadow-orange-200/50 dark:shadow-none border-none z-10";
         default: return "";
      }
   };

   const SortIcon = ({ field }) => {
      if (sortField !== field) return <ChevronDown size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />;
      return sortDirection === 'asc' ? <ChevronUp size={14} className="text-blue-500" /> : <ChevronDown size={14} className="text-blue-500" />;
   };

   return (
      <div className="max-w-7xl mx-auto space-y-8 pb-12 w-full">
         {/* Hero Header */}
         <div className="relative overflow-hidden bg-white dark:bg-gray-900 p-8 md:p-10 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 mb-8 flex flex-col items-center md:flex-row md:justify-start gap-6 text-center md:text-left">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl -z-10 -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center md:items-start">
              <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-100 dark:border-blue-800/50 shadow-sm"
              >
                 <Award size={14} /> Live Standings
              </motion.div>
              <motion.h1 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white drop-shadow-sm"
              >
                 Campus Rankings
              </motion.h1>
            </div>
         </div>

         {/* Filtering Dashboard */}
         <div className="bg-white dark:bg-gray-900 p-3 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-2 md:gap-4">
            
            {/* Timeframe Filter */}
            <div>
               <label className="text-[9px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block truncate">Timeframe</label>
               <select 
                  value={timeframe} 
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full px-2 py-1.5 md:px-3 md:py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] md:text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer truncate"
               >
                  <option value="all_time">All Time</option>
                  <option value="weekly">This Week</option>
                  <option value="monthly">This Month</option>
               </select>
            </div>

            {/* Department Filter */}
            <div>
               <label className="text-[9px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block truncate">Department</label>
               <select 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-2 py-1.5 md:px-3 md:py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] md:text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer truncate"
               >
                  <option value="all">All Depts</option>
                  <option value="mine">My Dept</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Business Administration">Business Admin</option>
               </select>
            </div>

            {/* Club Filter */}
            <div>
               <label className="text-[9px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block truncate">Club Rank</label>
               <select 
                  value={clubId} 
                  onChange={(e) => setClubId(e.target.value)}
                  className="w-full px-2 py-1.5 md:px-3 md:py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] md:text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer truncate"
               >
                  <option value="all">Overall</option>
                  <option value="club_1">Tech Club</option>
                  <option value="club_2">Debate Society</option>
                  <option value="club_3">Sports Committee</option>
               </select>
            </div>
         </div>

         {/* Top 3 Podiums */}
         {top3.length >= 3 && !loading && (
            <div className="flex items-end justify-center gap-2 md:gap-6 pt-12 pb-8 h-[240px] md:h-[320px]">
               {/* Rank 2 */}
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-[30%] md:w-1/3 max-w-[200px] h-[75%] md:h-[85%] flex flex-col justify-end">
                  <div className={`p-2 md:p-6 rounded-t-2xl md:rounded-[2rem] border relative flex flex-col items-center text-center ${getRankStyle(1)} h-full`}>
                     <div className="absolute -top-6 md:-top-8 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/30 backdrop-blur-md shadow-lg border-2 border-white/50 flex items-center justify-center overflow-hidden mb-2 md:mb-4">
                        {top3[1].avatarUrl ? <img src={top3[1].avatarUrl} className="w-full h-full object-cover" /> : <span className="font-bold text-sm md:text-xl">{top3[1].fullName.charAt(0)}</span>}
                     </div>
                     <Medal className="text-gray-700 mb-1 mt-6 md:mt-8 drop-shadow-sm w-5 h-5 md:w-8 md:h-8" />
                     <h3 className="font-bold text-[10px] sm:text-xs md:text-xl mb-0.5 md:mb-1 truncate w-full">{top3[1].fullName.split(' ')[0]}</h3>
                     <p className="text-[8px] md:text-sm opacity-80 mb-2 md:mb-4 truncate w-full">{top3[1].course}</p>
                     <div className="mt-auto bg-black/10 px-1 md:px-4 py-1 md:py-2 rounded-lg md:rounded-xl backdrop-blur-sm w-full font-bold text-[10px] sm:text-xs md:text-xl truncate">
                        {top3[1].score} XP
                     </div>
                  </div>
               </motion.div>

               {/* Rank 1 */}
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="w-[40%] md:w-1/3 max-w-[240px] h-full flex flex-col justify-end z-10">
                  <div className={`p-2 md:p-6 rounded-t-2xl md:rounded-[2rem] border relative flex flex-col items-center text-center ${getRankStyle(0)} h-full`}>
                     <div className="absolute -top-8 md:-top-10 w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/30 backdrop-blur-md shadow-xl border-2 md:border-4 border-white/50 flex items-center justify-center overflow-hidden mb-2 md:mb-4">
                        {top3[0].avatarUrl ? <img src={top3[0].avatarUrl} className="w-full h-full object-cover" /> : <span className="font-bold text-lg md:text-2xl text-yellow-900">{top3[0].fullName.charAt(0)}</span>}
                     </div>
                     <Trophy className="text-white mb-1 mt-8 md:mt-10 drop-shadow-md w-6 h-6 md:w-12 md:h-12" />
                     <h3 className="font-bold text-xs sm:text-sm md:text-2xl mb-0.5 md:mb-1 text-white truncate w-full">{top3[0].fullName.split(' ')[0]}</h3>
                     <p className="text-[9px] md:text-sm text-yellow-100 font-medium mb-2 md:mb-4 truncate w-full">{top3[0].course}</p>
                     <div className="mt-auto bg-black/20 px-1 md:px-6 py-1.5 md:py-3 rounded-lg md:rounded-xl backdrop-blur-sm w-full font-black text-xs sm:text-sm md:text-2xl text-white shadow-inner truncate">
                        {top3[0].score} XP
                     </div>
                  </div>
               </motion.div>

               {/* Rank 3 */}
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-[30%] md:w-1/3 max-w-[200px] h-[65%] md:h-[75%] flex flex-col justify-end">
                  <div className={`p-2 md:p-6 rounded-t-2xl md:rounded-[2rem] border relative flex flex-col items-center text-center ${getRankStyle(2)} h-full`}>
                     <div className="absolute -top-6 md:-top-8 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/30 backdrop-blur-md shadow-lg border-2 border-white/50 flex items-center justify-center overflow-hidden mb-2 md:mb-4">
                        {top3[2].avatarUrl ? <img src={top3[2].avatarUrl} className="w-full h-full object-cover" /> : <span className="font-bold text-sm md:text-xl">{top3[2].fullName.charAt(0)}</span>}
                     </div>
                     <Medal className="text-white mb-1 mt-6 md:mt-8 drop-shadow-sm w-5 h-5 md:w-8 md:h-8" />
                     <h3 className="font-bold text-[10px] sm:text-xs md:text-xl mb-0.5 md:mb-1 text-white truncate w-full">{top3[2].fullName.split(' ')[0]}</h3>
                     <p className="text-[8px] md:text-sm opacity-90 mb-2 md:mb-4 truncate w-full">{top3[2].course}</p>
                     <div className="mt-auto bg-black/10 px-1 md:px-4 py-1 md:py-2 rounded-lg md:rounded-xl backdrop-blur-sm w-full font-bold text-[10px] sm:text-xs md:text-xl text-white truncate">
                        {top3[2].score} XP
                     </div>
                  </div>
               </motion.div>
            </div>
         )}

         {/* Sortable Table Layout */}
         <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                     <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-500 font-bold select-none">
                        <th className="px-6 py-4 cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-24" onClick={() => handleSort('rank')}>
                           <div className="flex items-center gap-1">Rank <SortIcon field="rank" /></div>
                        </th>
                        <th className="px-6 py-4 cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => handleSort('fullName')}>
                           <div className="flex items-center gap-1">Student <SortIcon field="fullName" /></div>
                        </th>
                        <th className="px-6 py-4 cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => handleSort('course')}>
                           <div className="flex items-center gap-1">Department <SortIcon field="course" /></div>
                        </th>
                        <th className="px-6 py-4 text-right cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-32" onClick={() => handleSort('score')}>
                           <div className="flex items-center justify-end gap-1"><SortIcon field="score" /> Total XP</div>
                        </th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                     {loading ? (
                        [...Array(5)].map((_, i) => (
                           <tr key={i} className="animate-pulse">
                              <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div></td>
                              <td className="px-6 py-4 flex items-center gap-3"><div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div></td>
                              <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
                              <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 ml-auto"></div></td>
                           </tr>
                        ))
                     ) : processedTableData.length > 0 ? (
                        <AnimatePresence>
                           {processedTableData.map((student) => {
                              const isCurrentUser = student.id === user?.id;
                              
                              return (
                                 <motion.tr 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    layout
                                    key={student.id} 
                                    className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors ${isCurrentUser ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                 >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                       <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                                          student.rank === 1 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                          student.rank === 2 ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                                          student.rank === 3 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                          'text-gray-500 dark:text-gray-400'
                                       }`}>
                                          {student.rank}
                                       </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                       <div className="flex items-center gap-3">
                                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0 ${
                                             isCurrentUser ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                                          }`}>
                                             {student.avatarUrl ? (
                                                <img src={student.avatarUrl} alt="" className="w-full h-full object-cover" />
                                             ) : (
                                                (student.fullName || 'S').charAt(0).toUpperCase()
                                             )}
                                          </div>
                                          <div>
                                             <div className={`font-bold text-sm ${isCurrentUser ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                                {student.fullName || 'Anonymous Student'} {isCurrentUser && <span className="ml-1 opacity-70">(You)</span>}
                                             </div>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                          {student.course || 'Unknown'}
                                       </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                       <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg font-bold text-sm">
                                          <Activity size={14} className="opacity-70" />
                                          {student.score.toLocaleString()} XP
                                       </div>
                                    </td>
                                 </motion.tr>
                              )
                           })}
                        </AnimatePresence>
                     ) : (
                        <tr>
                           <td colSpan={4} className="px-6 py-16 text-center">
                              <Trophy size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">No Rankings Found</h3>
                              <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters to see more results.</p>
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};

export default StudentLeaderboard;
