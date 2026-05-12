// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Calendar, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { format, isPast, isFuture } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const ClubHeadEvents = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [managedClubId, setManagedClubId] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', event_date: '' });

  useEffect(() => {
    if (!user) return;

    const fetchEvents = async () => {
      setLoading(true);

      try {
        const { data: memberData } = await supabase
          .from('memberships')
          .select('club_id')
          .eq('user_id', user.id)
          .eq('role', 'head')
          .single();

        if (!memberData) {
          toast.warning("You aren't assigned as a head to any club yet.");
          setLoading(false);
          return;
        }

        setManagedClubId(memberData.club_id);

        const { data: eventsData, error } = await supabase
          .from('events')
          .select('*')
          .eq('club_id', memberData.club_id)
          .order('event_date', { ascending: false });

        if (error) throw error;
        setEvents(eventsData || []);

      } catch (err) {
        console.error('Error fetching events:', err);
        toast.error('Failed to load events.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!managedClubId) return;

    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          club_id: managedClubId,
          title: newEvent.title,
          description: newEvent.description,
          event_date: new Date(newEvent.event_date).toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      setEvents(prev => [data, ...prev].sort((a,b) => new Date(b.event_date) - new Date(a.event_date)));
      toast.success('Event scheduled successfully!');
      setIsModalOpen(false);
      setNewEvent({ title: '', description: '', event_date: '' });
    } catch (err) {
      toast.error('Error creating event.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to cancel and delete "${eventTitle}"?`)) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      if (error) throw error;
      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast.success(`Event "${eventTitle}" has been deleted.`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete event.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent dark:border-blue-400 dark:border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Premium Hero Header */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-8 md:p-10 shadow-lg"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 flex items-center justify-center md:justify-start gap-3">
              <Calendar size={40} className="hidden md:block opacity-90" />
              Event Management
            </h1>
            <p className="text-emerald-50 font-medium text-lg max-w-2xl opacity-90">
              Schedule, organize, and oversee your club's activities and timeline.
            </p>
          </div>
          
          {managedClubId && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="shrink-0 bg-white text-emerald-600 px-6 py-3.5 rounded-full font-bold hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2 group"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Schedule Event
            </button>
          )}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-100/50 dark:border-gray-800/50 overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-gray-100/50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-gray-800/30 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">All Events</h3>
          <span className="text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full shadow-sm">{events.length} Total</span>
        </div>
        
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {events.length > 0 ? (
            events.map((evt) => {
              const dateObj = new Date(evt.event_date);
              const past = isPast(dateObj);
              
              return (
                <div key={evt.id} className="p-6 hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                  <div className="flex-1 flex gap-4">
                    <div className={`w-3 rounded-full shrink-0 transition-colors ${past ? 'bg-gray-200 dark:bg-gray-700' : 'bg-emerald-400 group-hover:bg-emerald-500 shadow-inner'}`} />
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className={`text-xl font-bold ${past ? 'text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>{evt.title}</h4>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase shadow-sm border ${
                          past ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200/50 dark:border-gray-700/50' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50'
                        }`}>
                          {past ? 'Past' : 'Upcoming'}
                        </span>
                      </div>
                       <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{evt.description || 'No description provided.'}</p>
                       <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
                         <div className="flex items-center gap-1.5"><Calendar size={14} className="text-emerald-500" /> {format(dateObj, "EEEE, MMMM do yyyy 'at' h:mm a")}</div>
                       </div>
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-3">
                    <button
                      onClick={() => handleDeleteEvent(evt.id, evt.title)}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2.5 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all flex items-center gap-2 text-sm font-bold shadow-sm"
                    >
                      <Trash2 size={18} /> <span className="hidden lg:inline">Delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              No events found. Click "Schedule New" to create one.
            </div>
          )}
        </div>
      </motion.div>


      {/* Basic Modal for New Event */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20 dark:border-gray-800/50"
            >
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-cyan-600 mb-1">Schedule Event</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Create a new activity for your club members.</p>
              
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
                  <input required type="text" className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                    placeholder="e.g. Annual Hackathon"
                    value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date & Time</label>
                  <input required type="datetime-local" className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm w-full dark:[color-scheme:dark]" 
                    value={newEvent.event_date} onChange={e => setNewEvent({...newEvent, event_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description (Optional)</label>
                  <textarea className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none" rows="3"
                    placeholder="Provide some details about the event..."
                    value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-gray-50 dark:border-gray-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSaving} className="flex-1 py-2.5 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors text-sm">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex-1 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-medium disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-2">
                    {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
                    Save Event
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClubHeadEvents;
