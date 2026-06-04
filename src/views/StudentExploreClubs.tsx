'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Search, Code, Cpu, Camera, Bot, Lightbulb, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentExploreClubs() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<any[]>([]);
  const [myClubIds, setMyClubIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Discover');
  
  // Application Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyingToClub, setApplyingToClub] = useState<any>(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingClubIds, setPendingClubIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: clubsData, error: clubsError } = await supabase.from('clubs').select('*');
        if (clubsError) throw clubsError;
        setClubs(clubsData);

        if (user) {
          const { data: myData } = await supabase.from('club_members').select('club_id').eq('user_id', user.id);
          if (myData) setMyClubIds(new Set(myData.map(row => row.club_id)));
          
          const { data: pendingData } = await supabase.from('club_recruitment').select('club_id').eq('student_id', user.id).eq('status', 'pending');
          if (pendingData) setPendingClubIds(new Set(pendingData.map(row => row.club_id)));
        }
      } catch (err) {
        console.error('Error fetching clubs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const channel = supabase
      .channel('public:clubs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clubs' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setClubs((prev: any) => [payload.new, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setClubs((prev: any) => prev.filter((c: any) => c.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setClubs((prev: any) => prev.map((c: any) => c.id === payload.new.id ? payload.new : c));
          }
        }
      )
      .subscribe();

    const membersChannel = supabase
      .channel('public:club_members')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'club_members' },
        () => fetchData()
      )
      .subscribe();

    const recruitmentChannel = supabase
      .channel('public:club_recruitment')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'club_recruitment', filter: `student_id=eq.${user?.id}` },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(membersChannel);
      supabase.removeChannel(recruitmentChannel);
    };
  }, [user]);

  const handleOpenApplyModal = (club: any) => {
    if (!user) return toast.error('Please log in first.');
    setApplyingToClub(club);
    setApplicationMessage('');
    setIsApplyModalOpen(true);
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !applyingToClub) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('club_recruitment').insert({ 
        club_id: applyingToClub.id, 
        student_id: user.id,
        message: applicationMessage
      });
      
      if (error) throw error;
      
      setPendingClubIds(prev => new Set([...prev, applyingToClub.id]));
      toast.success(`Application sent to ${applyingToClub.name}!`);
      setIsApplyModalOpen(false);
    } catch (error) {
      toast.error('Could not submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock data for UI showcase if DB is empty
  const displayClubs = clubs.length > 0 ? clubs : [
    { id: '1', name: 'Coding Club', description: 'Build. Code. Innovate.', members: '1.2K', icon: Code, color: 'text-purple-600', bg: 'bg-purple-100' },
    { id: '2', name: 'AI Society', description: 'Explore. Learn. Build.', members: '980', icon: Cpu, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { id: '3', name: 'Photography Club', description: 'Capture. Create. Inspire.', members: '760', icon: Camera, color: 'text-orange-500', bg: 'bg-orange-100' },
    { id: '4', name: 'Robotics Club', description: '', members: '890', icon: Bot, color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: '5', name: 'Entrepreneurship Cell', description: '', members: '1.1K', icon: Lightbulb, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  ];

  const filteredClubs = useMemo(() => {
    return displayClubs.filter(club => 
      club.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [displayClubs, searchQuery]);

  const recommended = filteredClubs.slice(0, 3);
  const popular = filteredClubs.slice(3);

  const ClubRow = ({ club, isLarge = false }: { club: any, isLarge?: boolean }) => {
    const isMember = myClubIds.has(club.id);
    const isPending = pendingClubIds.has(club.id);
    const IconComponent = club.icon || Users;

    return (
      <div className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-4 ${isLarge ? 'mb-4' : 'mb-3'}`}>
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${club.bg || 'bg-purple-50'} ${club.color || 'text-purple-600'}`}>
            <IconComponent size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">{club.name}</h3>
            <p className="text-xs text-gray-500 mb-0.5">{club.members || '0'} Members</p>
            {isLarge && club.description && (
              <p className="text-xs text-gray-400 truncate">{club.description}</p>
            )}
          </div>
        </div>
        <button 
          onClick={() => (!isMember && !isPending) && handleOpenApplyModal(club)}
          disabled={isMember || isPending}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isMember 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isPending
              ? 'bg-amber-100 text-amber-700 cursor-not-allowed border border-amber-200'
              : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/30'
          }`}
        >
          {isMember ? 'Joined' : isPending ? 'Pending' : 'Apply'}
        </button>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Mobile Header elements */}
      <div className="flex items-center justify-between md:hidden mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clubs</h1>
        <Search size={22} className="text-gray-900 dark:text-white" />
      </div>

      <div className="hidden md:flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Clubs</h2>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm outline-none focus:border-purple-300"
          />
        </div>
      </div>

      {/* Segmented Control / Tabs */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
        <button 
          onClick={() => setActiveTab('Discover')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'Discover' ? 'bg-white dark:bg-gray-700 shadow text-purple-600 dark:text-purple-400' : 'text-gray-500'}`}
        >
          Discover
        </button>
        <button 
          onClick={() => setActiveTab('My Clubs')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'My Clubs' ? 'bg-white dark:bg-gray-700 shadow text-purple-600 dark:text-purple-400' : 'text-gray-500'}`}
        >
          My Clubs
        </button>
      </div>

      {activeTab === 'Discover' ? (
        <>
          {recommended.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Recommended for you</h3>
                <button className="text-purple-600 dark:text-purple-400 text-xs font-bold">See all</button>
              </div>
              <div className="space-y-0">
                {recommended.map(club => <ClubRow key={club.id} club={club} isLarge={true} />)}
              </div>
            </div>
          )}

          {popular.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Popular Clubs</h3>
                <button className="text-purple-600 dark:text-purple-400 text-xs font-bold">See all</button>
              </div>
              <div className="space-y-0">
                {popular.map(club => <ClubRow key={club.id} club={club} isLarge={false} />)}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center text-gray-500">
          You haven't joined any clubs yet. Check out the Discover tab!
        </div>
      )}

      {/* Application Modal */}
      <AnimatePresence>
        {isApplyModalOpen && applyingToClub && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800 p-8"
            >
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Apply to {applyingToClub.name}</h2>
              <p className="text-sm text-gray-500 mb-6">Write a short message to the Club Head explaining why you want to join and what you can contribute.</p>
              
              <form onSubmit={submitApplication}>
                <textarea
                  required
                  rows={4}
                  placeholder="I am interested in joining because..."
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 mb-6 resize-none"
                />
                
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsApplyModalOpen(false)}
                    className="flex-1 py-3 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Submit'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
