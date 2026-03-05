import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import { Users, Calendar, Award, Megaphone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, loading, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -5 }}
    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-gray-100/50 dark:border-gray-800/50 flex flex-col items-center text-center gap-3 relative overflow-hidden group"
  >
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-500 ${color.bg}`} />
    
    <div className="flex justify-between items-center w-full relative z-10">
      <div className={`p-3 rounded-xl ${color.badge} shrink-0`}>
        <Icon size={22} className={color.icon} />
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
      ) : (
        <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</h3>
      )}
    </div>
    <div className="relative z-10 w-full">
      <p className="text-gray-500 dark:text-gray-400 font-medium text-xs tracking-widest uppercase text-left">{title}</p>
    </div>
  </motion.div>
);

const ClubHeadDashboard = () => {
  const { user } = useAuth();
  const [managedClub, setManagedClub] = useState(null);
  const [stats, setStats] = useState({ members: 0, events: 0, achievements: 0 });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [announcementText, setAnnouncementText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchClubData = async () => {
      setLoading(true);

      try {
        // Find which club this user manages
        const { data: memberData } = await supabase
          .from('memberships')
          .select('club_id, clubs(name)')
          .eq('user_id', user.id)
          .eq('role', 'head')
          .single();

        if (!memberData) {
          toast.warning("You aren't assigned as a head to any club yet.");
          setLoading(false);
          return;
        }

        const clubId = memberData.club_id;
        setManagedClub({ id: clubId, name: memberData.clubs?.name });

        // Fetch stats associated with this club
        const [
          { count: membersCount },
          { count: achievementsCount },
          { data: eventsData }
        ] = await Promise.all([
           supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('club_id', clubId),
           supabase.from('achievements').select('*', { count: 'exact', head: true }).eq('club_id', clubId),
           supabase.from('events').select('*').eq('club_id', clubId).order('event_date', { ascending: true })
        ]);

        const upcomingEvents = (eventsData || []).filter(e => new Date(e.event_date) > new Date());
        
        setStats({
          members: membersCount || 0,
          events: upcomingEvents.length,
          achievements: achievementsCount || 0
        });

         setRecentEvents(upcomingEvents.slice(0, 5));
      } catch (err) {
        console.error('Error fetching club data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClubData();

    // Realtime Listener for new members or events
    const dashboardChannel = supabase
      .channel('club_dashboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memberships' }, () => fetchClubData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => fetchClubData())
      .subscribe();

    return () => {
      supabase.removeChannel(dashboardChannel);
    };
  }, [user]);

  const handlePostAnnouncement = async () => {
    if (!announcementText.trim()) return toast.warning('Please enter an announcement.');
    if (!managedClub) return toast.error('No club managed found.');

    setIsPosting(true);

    try {
      const { error } = await supabase
        .from('feed_posts')
        .insert({ club_id: managedClub.id, content: announcementText });

      if (error) throw error;
      
      toast.success('Announcement posted to the feed!');
      setAnnouncementText('');
    } catch (err) {
      toast.error('Failed to post announcement.');
      console.error(err);
    } finally {
       setIsPosting(false);
    }
  };



  if (!managedClub && !loading) {
     return <div className="p-8 text-center text-gray-500 dark:text-gray-400">You are not designated as a Head for any ongoing club. Please contact an Admin.</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Premium Hero Header */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-emerald-500 p-8 md:p-10 shadow-lg"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
              {managedClub?.name || 'Club Setup'}
            </h1>
            <p className="text-indigo-100 font-medium text-lg max-w-2xl opacity-90">
              Welcome to your command center. Oversee membership, schedule upcoming events, and publish fresh announcements to your club's followers.
            </p>
          </div>
          
          <div className="shrink-0 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white font-bold text-3xl shadow-lg shadow-black/10">
            {managedClub?.name ? managedClub.name.charAt(0) : 'C'}
          </div>
        </div>
      </motion.div>

      {/* Dynamic Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <StatCard 
          title="Total Members" 
          value={stats.members} 
          icon={Users} 
          color={{ bg: 'bg-indigo-500', badge: 'bg-indigo-100 dark:bg-indigo-900/40', icon: 'text-indigo-600 dark:text-indigo-400' }} 
          loading={loading}
          delay={0.1}
        />
        <StatCard 
          title="Upcoming Events" 
          value={stats.events} 
          icon={Calendar} 
          color={{ bg: 'bg-emerald-500', badge: 'bg-emerald-100 dark:bg-emerald-900/40', icon: 'text-emerald-600 dark:text-emerald-400' }} 
          loading={loading}
          delay={0.2}
        />
        <StatCard 
          title="Achievements Granted" 
          value={stats.achievements} 
          icon={Award} 
          color={{ bg: 'bg-amber-500', badge: 'bg-amber-100 dark:bg-amber-900/40', icon: 'text-amber-600 dark:text-amber-400' }} 
          loading={loading}
          delay={0.3}
        />
      </div>
    </div>
  );
};

export default ClubHeadDashboard;
