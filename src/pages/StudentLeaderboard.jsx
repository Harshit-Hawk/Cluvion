import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Award, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentLeaderboard = () => {
   const { user, userProfile } = useAuth();
   const [leaderboard, setLeaderboard] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchLeaderboard = async () => {
         setLoading(true);

         try {
            const { data, error } = await supabase
               .from('student_scores')
               .select(`
                  user_id,
                  activeness_score,
                  users (id, full_name, avatar_url)
               `)
               .order('activeness_score', { ascending: false })
               .limit(50);

            if (error) throw error;
            const formattedData = data.map(item => ({
               id: item.user_id,
               activeness_score: item.activeness_score,
               users: item.users
            }));
            setLeaderboard(formattedData || []);
         } catch (err) {
            console.error('Error fetching leaderboard:', err);
         } finally {
            setLoading(false);
         }
      };

      fetchLeaderboard();
   }, [user, userProfile]);

   const getRankStyle = (index) => {
      switch(index) {
         case 0: return "bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-white shadow-md shadow-yellow-200 dark:shadow-none border-none mb-3 z-10";
         case 1: return "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 text-gray-800 shadow-sm shadow-gray-200 dark:shadow-none border-none mb-3 z-10";
         case 2: return "bg-gradient-to-r from-orange-300 via-orange-400 to-amber-600 text-white shadow-sm shadow-orange-200 dark:shadow-none border-none mb-3 z-10";
         default: return "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:shadow-sm";
      }
   };

   const getRankIcon = (index) => {
      switch(index) {
         case 0: return <Trophy className="text-white drop-shadow-md" size={28} />;
         case 1: return <Medal className="text-gray-700 drop-shadow-sm" size={24} />;
         case 2: return <Medal className="text-white drop-shadow-sm" size={24} />;
         default: return <span className="text-base font-bold text-gray-400 w-6 text-center">{index + 1}</span>;
      }
   };

   return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
         {/* Hero Header */}
         <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 p-8 md:p-10 rounded-3xl shadow-xl border border-white/10 text-white mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <motion.div 
                   initial={{ opacity: 0, y: -20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-semibold mb-4 text-blue-100"
                >
                   <Award size={16} className="text-yellow-400" /> Campus Rankings
                </motion.div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">Global Leaderboard</h1>
                <p className="text-indigo-100 max-w-xl leading-relaxed text-lg">See how you stack up against your peers. Earn points by joining clubs and attending events!</p>
              </div>
              
              <motion.div 
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 0.2 }}
                 className="hidden md:flex w-32 h-32 bg-white/10 backdrop-blur-xl rounded-full border-[8px] border-white/5 items-center justify-center relative shadow-2xl"
              >
                  <Trophy size={56} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
              </motion.div>
            </div>
         </div>

         {/* Leaderboard List */}
         <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-2 md:p-6">
            {loading ? (
               <div className="space-y-4">
                  {[1,2,3,4,5].map(i => (
                     <div key={i} className="h-20 bg-gray-50 dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-700"></div>
                  ))}
               </div>
            ) : leaderboard.length > 0 ? (
               <div className="space-y-3">
                  {/* Container for top 3 visual styling */}
                  <div className="flex flex-col mb-4">
                     {leaderboard.slice(0, 3).map((student, index) => {
                        const isCurrentUser = student.id === user?.id;
                        
                        return (
                           <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: index * 0.1 }}
                              key={student.id}
                              className={`relative flex items-center justify-between p-4 md:p-5 rounded-2xl border transition-all duration-300 ${getRankStyle(index)} ${isCurrentUser ? 'ring-4 ring-offset-2 ring-blue-500' : ''}`}
                           >
                              <div className="flex items-center gap-4 md:gap-6">
                                 <div className="w-12 flex justify-center items-center font-bold">
                                    {getRankIcon(index)}
                                 </div>
                                 <div className="relative">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-lg font-bold shadow-inner border border-white/50">
                                       {student.users?.full_name?.charAt(0).toUpperCase() || 'S'}
                                    </div>
                                    {isCurrentUser && (
                                       <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white"></span>
                                       </span>
                                    )}
                                 </div>
                                 <div>
                                    <h3 className="font-bold text-lg md:text-xl">{student.users?.full_name || 'Anonymous Student'}</h3>
                                    {isCurrentUser && <p className="text-xs font-semibold opacity-80 mt-0.5">That's you!</p>}
                                 </div>
                              </div>
                              <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-black/5">
                                 <Activity size={18} className="opacity-80" />
                                 <span className="font-bold text-xl">{student.activeness_score}</span>
                              </div>
                           </motion.div>
                        );
                     })}
                  </div>

                  {/* Rest of the leaderboard */}
                  <div className="space-y-4 mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                     {leaderboard.slice(3).map((student, index) => {
                        const actualRank = index + 3;
                        const isCurrentUser = student.id === user?.id;

                        return (
                           <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.3 + (index * 0.05) }}
                              key={student.id}
                              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                                 isCurrentUser 
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm relative overflow-hidden' 
                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                              }`}
                           >
                              {isCurrentUser && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                              
                              <div className="flex items-center gap-4">
                                 <div className="w-10 flex justify-center">
                                    <span className={`font-bold ${isCurrentUser ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>{actualRank + 1}</span>
                                 </div>
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                    isCurrentUser ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                 }`}>
                                    {student.users?.full_name?.charAt(0).toUpperCase() || 'S'}
                                 </div>
                                 <div>
                                    <h4 className={`font-semibold ${isCurrentUser ? 'text-blue-900 dark:text-blue-100' : 'text-gray-800 dark:text-gray-200'}`}>
                                       {student.users?.full_name || 'Anonymous Student'} {isCurrentUser && '(You)'}
                                    </h4>
                                 </div>
                              </div>
                              <div className={`font-bold px-3 py-1 rounded-lg ${isCurrentUser ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                 {student.activeness_score} pts
                              </div>
                           </motion.div>
                        );
                     })}
                  </div>
               </div>
            ) : (
               <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-800">
                     <Trophy size={32} className="text-gray-300 dark:text-gray-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No Rankings Yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">The leaderboard is currently empty. Be the first to earn points by joining a club or attending an event!</p>
               </div>
            )}
         </div>
      </div>
   );
};

export default StudentLeaderboard;
