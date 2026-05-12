// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Clock, Users, CheckCircle, ChevronRight, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const StudentEvents = () => {
   const { user } = useAuth();
   const [events, setEvents] = useState([]);
   const [loading, setLoading] = useState(true);
   const [registering, setRegistering] = useState(null); // Track event id being registered
   const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'registered'

   useEffect(() => {
      fetchEvents();
   }, [user]);

   const fetchEvents = async () => {
      setLoading(true);

      try {
         const { data: eventsData, error: eventsError } = await supabase
            .from('events')
            .select(`id, title, description, event_date, location, clubs (name)`)
            .gte('event_date', new Date().toISOString())
            .order('event_date', { ascending: true });
         if (eventsError) throw eventsError;
         let registrations = [];
         try {
             const { data: regData } = await supabase
               .from('event_registrations')
               .select('event_id')
               .eq('user_id', user.id);
             registrations = regData || [];
         } catch(e) { /* table might not exist yet */ }
         const formattedEvents = eventsData.map(ev => ({
            ...ev,
            registered: registrations.some(r => r.event_id === ev.id)
         }));
         setEvents(formattedEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        toast.error('Failed to load events.');
      } finally {
        setLoading(false);
      }
   };

   useEffect(() => {
     // Realtime Listener for new/updated events
     const eventsChannel = supabase
       .channel('public:events')
       .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => fetchEvents())
       .subscribe();

     return () => {
       supabase.removeChannel(eventsChannel);
     };
   }, []);

   const handleRegister = async (eventId) => {
      setRegistering(eventId);
      
      try {
         const { error } = await supabase
            .from('event_registrations')
            .insert({ user_id: user.id, event_id: eventId });
         if (error) throw error;
         await supabase.from('activity_logs').insert({
             user_id: user.id,
             action_type: 'event_registered',
             description: 'Registered for an event',
             points_awarded: 5
         });
         setEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, registered: true } : ev));
         toast.success('Successfully registered! (+5 points)');
      } catch (err) {
         console.error('Registration failed:', err);
         toast.error('Failed to register. Please try again.');
      } finally {
         setRegistering(null);
      }
   };

   // Apply filters
   const filteredEvents = events.filter(ev => {
      if (filter === 'registered') return ev.registered;
      return true; // 'all' or 'upcoming'
   });

   return (
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
         {/* Hero Header */}
         <div className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-emerald-800 to-green-900 p-8 md:p-10 rounded-3xl shadow-xl border border-white/10 text-white mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <motion.div 
                   initial={{ opacity: 0, y: -20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-semibold mb-4 text-emerald-100"
                >
                   <Calendar size={16} className="text-emerald-300" /> Campus Activities
                </motion.div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">Event Registration</h1>
                <p className="text-emerald-50 max-w-xl leading-relaxed text-lg opacity-90">Discover and register for upcoming club events. Participate to boost your skills, meet peers, and earn activeness points.</p>
              </div>
            </div>
         </div>

         {/* Filters & Controls */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
               <Filter size={18} className="text-gray-400" />
               <span className="font-semibold text-gray-700">Filter:</span>
            </div>
            <div className="flex bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-xl">
               <button 
                  onClick={() => setFilter('all')}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-700 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
               >
                  All Upcoming
               </button>
               <button 
                  onClick={() => setFilter('registered')}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'registered' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-700 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
               >
                  My Registrations
               </button>
            </div>
         </div>

         {/* Events Grid */}
         {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-64 bg-gray-50 dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-700"></div>
               ))}
            </div>
         ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <AnimatePresence>
                  {filteredEvents.map((event, index) => (
                     <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        key={event.id}
                        className={`bg-white dark:bg-gray-900 rounded-2xl border transition-all duration-300 hover:shadow-xl dark:hover:shadow-emerald-900/10 flex flex-col h-full ${event.registered ? 'border-emerald-200 dark:border-emerald-800 shadow-sm' : 'border-gray-100 dark:border-gray-800 shadow-sm hover:border-emerald-100 dark:hover:border-emerald-800/50'}`}
                     >
                        <div className="p-6 flex-1">
                           <div className="flex justify-between items-start mb-4">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                                 {event.clubs?.name || 'Campus Event'}
                              </span>
                              {event.registered && (
                                 <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded w-max">
                                    <CheckCircle size={14} /> Registered
                                 </span>
                              )}
                           </div>
                           
                           <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2 leading-tight">{event.title}</h3>
                           <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-6 leading-relaxed">
                              {event.description}
                           </p>

                           <div className="space-y-3 mt-auto">
                              <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400 rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                                 <Clock className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0" />
                                 <div>
                                    <p className="font-semibold text-gray-900 dark:text-gray-200">{format(new Date(event.event_date), 'MMMM d, yyyy')}</p>
                                    <p>{format(new Date(event.event_date), 'h:mm a')}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                                 <MapPin className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                                 <span className="font-medium truncate">{event.location}</span>
                              </div>
                           </div>
                        </div>

                        <div className="p-6 pt-0 mt-auto">
                           <div className="w-full h-[1px] bg-gray-100 dark:bg-gray-800 mb-6"></div>
                           {event.registered ? (
                              <button disabled className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-100 dark:border-emerald-800 cursor-default">
                                 <CheckCircle size={18} />
                                 Ready to attend
                              </button>
                           ) : (
                              <button 
                                 onClick={() => handleRegister(event.id)}
                                 disabled={registering === event.id}
                                 className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md shadow-emerald-200 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed group"
                              >
                                 {registering === event.id ? (
                                    <>
                                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                       Registering...
                                    </>
                                 ) : (
                                    <>
                                       Register Now
                                       <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                 )}
                              </button>
                           )}
                        </div>
                     </motion.div>
                  ))}
               </AnimatePresence>
            </div>
         ) : (
            <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 border-dashed">
               <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-800">
                  <Calendar size={32} className="text-emerald-400 dark:text-emerald-500" />
               </div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No events found</h3>
               <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  {filter === 'registered' 
                     ? "You haven't registered for any events yet. Check out the upcoming events!" 
                     : "There are no upcoming events at the moment. Check back later."}
               </p>
               {filter === 'registered' && (
                  <button onClick={() => setFilter('all')} className="mt-6 text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-700 dark:hover:text-emerald-300 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                     View all events
                  </button>
               )}
            </div>
         )}
      </div>
   );
};

export default StudentEvents;
