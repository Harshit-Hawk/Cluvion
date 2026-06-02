// @ts-nocheck
'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Users, Plus, ArrowRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentExploreClubs = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [myClubIds, setMyClubIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchClubs = async () => {
      setLoading(true);

      try {
        const { data: allClubs, error: clubsError } = await supabase
          .from('clubs')
          .select('*')
          .order('name');
          
        if (clubsError) throw clubsError;

        // Fetch user memberships to know which ones they are already in
        const { data: userMemberships, error: memError } = await supabase
          .from('memberships')
          .select('club_id')
          .eq('user_id', user.id);

        if (memError) throw memError;

        const joinedIds = new Set(userMemberships.map(m => m.club_id));
        setMyClubIds(joinedIds);
        setClubs(allClubs || []);
      } catch (err) {
        console.error('Error fetching explore clubs', err);
        toast.error('Failed to load clubs.');
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, [user]);

  const handleJoinClub = async (club) => {
    try {
      const { error } = await supabase
        .from('memberships')
        .insert({ user_id: user.id, club_id: club.id, role: 'member' });
        
      if (error) {
        if (error.code === '23505') toast.error('You are already a member!');
        else throw error;
        return;
      }
      
      // Award points for joining
      await supabase.from('activity_logs').insert({
         user_id: user.id,
         action_type: 'joined_club',
         points_awarded: 10
      });

      setMyClubIds(prev => new Set(prev).add(club.id));
      toast.success(`Successfully joined ${club.name}!`);
    } catch (err) {
      console.error(err);
      toast.error('Could not join the club. Try again later.');
    }
  };

  const filteredClubs = useMemo(() => {
    return clubs.filter(club => 
      club.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      club.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clubs, searchQuery]);

  const getCategoryTag = (name) => {
    const n = name?.toLowerCase() || '';
    if (n.includes('tech') || n.includes('code') || n.includes('hack') || n.includes('compute')) return 'Tech & Dev';
    if (n.includes('sport') || n.includes('game') || n.includes('athletic')) return 'Sports';
    if (n.includes('art') || n.includes('design') || n.includes('music') || n.includes('creat')) return 'Arts';
    if (n.includes('business') || n.includes('finance') || n.includes('market')) return 'Business';
    if (n.includes('science') || n.includes('math') || n.includes('engineer')) return 'STEM';
    return 'Community';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2"></div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-2">Explore Clubs</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed">Discover and join campus organizations to level up your experience and gain achievement points.</p>
        </div>
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search clubs by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
             <div key={i} className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 h-[280px] animate-pulse shadow-sm">
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-6"></div>
                <div className="w-3/4 h-6 bg-gray-100 dark:bg-gray-800 rounded mb-4"></div>
                <div className="w-full h-4 bg-gray-50 dark:bg-gray-800/50 rounded mb-2"></div>
                <div className="w-5/6 h-4 bg-gray-50 dark:bg-gray-800/50 rounded"></div>
             </div>
          ))}
        </div>
      ) : filteredClubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club, index) => {
            const isMember = myClubIds.has(club.id);
            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                key={club.id} 
                className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full hover:shadow-2xl dark:hover:shadow-indigo-900/20 hover:-translate-y-2 hover:border-indigo-100 dark:hover:border-indigo-800 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-bl-full -z-10 opacity-70 group-hover:scale-125 transition-transform duration-500"></div>
                
                {/* Decorative Category Tag */}
                <div className="absolute top-5 right-5">
                  <span className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800 shadow-sm">
                    {getCategoryTag(club.name)}
                  </span>
                </div>
                
                <div className="flex-1 z-10 mt-2">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 shadow-sm border border-white dark:border-gray-700 group-hover:rotate-6 transition-transform duration-300 group-hover:from-indigo-100 group-hover:to-purple-100 dark:group-hover:from-indigo-800/50 dark:group-hover:to-purple-800/50">
                     <Users size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{club.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                    {club.description || 'Join this exciting community club. We are looking for passionate new members to participate in our upcoming events!'}
                  </p>
                </div>
                
                <button 
                  onClick={() => !isMember && handleJoinClub(club)}
                  disabled={isMember}
                  className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all z-10 ${
                    isMember 
                      ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 active:scale-95'
                  }`}
                >
                  {isMember ? 'Membership Active' : (
                    <>
                      Join Community <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="p-10 text-center bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden mt-8">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
             <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10">
               <Users size={32} />
             </div>
             <h3 className="text-xl font-extrabold text-gray-900 dark:text-white relative z-10">No Clubs Found</h3>
             <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto mb-6 relative z-10">
               {searchQuery ? "We couldn't find any clubs matching your search. Try a different term!" : "There are currently no active clubs to join."}
             </p>
             {searchQuery && (
               <button onClick={() => setSearchQuery('')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 relative z-10">
                 Clear Search
               </button>
             )}
        </div>
      )}
    </div>
  );
};

export default StudentExploreClubs;
