// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import { format, isPast } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import QRScanner from '../components/QRScanner';
import { AttendanceService } from '../services/AttendanceService';
import { 
  Calendar, Plus, Trash2, Clock, MapPin, 
  CheckCircle, AlertCircle, XCircle, Search, 
  Maximize2, UserCheck, RefreshCw, X
} from 'lucide-react';

const ClubHeadEvents = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [managedClubId, setManagedClubId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', event_date: '', location: '' });

  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanningEventId, setScanningEventId] = useState(null);
  const [isProcessingScan, setIsProcessingScan] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data: memberData } = await supabase
        .from('memberships')
        .select('club_id')
        .eq('user_id', user.id)
        .eq('role', 'head')
        .single();

      if (!memberData) return;
      setManagedClubId(memberData.club_id);

      const { data: eventsData, error } = await supabase
        .from('events')
        .select('*')
        .eq('club_id', memberData.club_id)
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(eventsData || []);
    } catch (err) {
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

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
          event_date: new Date(newEvent.event_date).toISOString(),
          location: newEvent.location,
          status: 'pending' // New events go to moderation
        })
        .select()
        .single();
        
      if (error) throw error;
      setEvents(prev => [data, ...prev]);
      toast.success('Event submitted for moderation!');
      setIsModalOpen(false);
      setNewEvent({ title: '', description: '', event_date: '', location: '' });
    } catch (err) {
      toast.error('Error creating event.');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return { label: 'Active', icon: CheckCircle, class: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
      case 'pending': return { label: 'In Review', icon: Clock, class: 'bg-amber-50 text-amber-600 border-amber-100' };
      case 'rejected': return { label: 'Rejected', icon: XCircle, class: 'bg-rose-50 text-rose-600 border-rose-100' };
      default: return { label: 'Unknown', icon: AlertCircle, class: 'bg-gray-50 text-gray-600 border-gray-100' };
    }
  };

  const handleScanSuccess = async (decodedText) => {
    if (isProcessingScan || !scanningEventId) return;
    setIsProcessingScan(true);
    try {
      const payload = AttendanceService.parseQRPayload(decodedText);
      if (!payload?.userId) {
        toast.error('Invalid QR Code');
        return;
      }
      const result = await AttendanceService.markAttendance(scanningEventId, payload.userId, user.id);
      if (result.success) toast.success(result.message);
      else toast.warning(result.message);
    } catch (error) {
      toast.error('Scan processing failed');
    } finally {
      setTimeout(() => setIsProcessingScan(false), 1500);
    }
  };

  const filteredEvents = events.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Event Hub</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Create and manage your club's activity timeline.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={18} /> Schedule Activity
        </button>
      </div>

      {/* Filters */}
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text"
          placeholder="Filter by event title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
        />
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredEvents.map((evt) => {
            const status = getStatusBadge(evt.status);
            const isPastEvent = isPast(new Date(evt.event_date));
            
            return (
              <motion.div
                key={evt.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden"
              >
                {/* Header Row */}
                <div className="flex justify-between items-start mb-6">
                  <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${status.class}`}>
                    <status.icon size={12} />
                    {status.label}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-400">
                    <Clock size={12} />
                    <span className="text-[10px] font-black uppercase">{format(new Date(evt.event_date), 'h:mm a')}</span>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 line-clamp-1">{evt.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 line-clamp-2 leading-relaxed">
                  {evt.description || 'No detailed description provided for this activity.'}
                </p>

                <div className="flex flex-wrap gap-6 mb-8">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <Calendar size={14} className="text-blue-500" />
                    {format(new Date(evt.event_date), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <MapPin size={14} className="text-emerald-500" />
                    {evt.location || 'Main Campus'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-800">
                  <button 
                    onClick={() => supabase.from('events').delete().eq('id', evt.id).then(() => fetchEvents())}
                    className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="flex gap-2">
                    {evt.status === 'active' && !isPastEvent && (
                      <button 
                        onClick={() => { setScanningEventId(evt.id); setScanModalOpen(true); }}
                        className="px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 flex items-center gap-2 hover:bg-blue-700 transition-all"
                      >
                        <Maximize2 size={14} /> Scan IDs
                      </button>
                    )}
                    <button className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-[10px] font-black uppercase tracking-widest rounded-2xl text-gray-500 hover:bg-gray-100 transition-all">
                      Details
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800"
            >
              <div className="px-10 py-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">New Activity</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Submit for moderation</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="p-10 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Event Title</label>
                    <input 
                      required
                      placeholder="e.g. Annual Tech Summit"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Date & Time</label>
                      <input 
                        required
                        type="datetime-local"
                        value={newEvent.event_date}
                        onChange={(e) => setNewEvent({...newEvent, event_date: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold dark:[color-scheme:dark]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Location</label>
                      <input 
                        placeholder="Room 101"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea 
                      rows="3"
                      placeholder="Briefly describe the activity..."
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold resize-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-xs"
                >
                  {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Plus size={18} />}
                  Propose Event
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {scanModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 w-full max-w-md shadow-2xl relative border border-gray-200 dark:border-gray-800"
            >
              <button onClick={() => setScanModalOpen(false)} className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-full"><X size={20}/></button>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">Attendance Scan</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Capture Student QR Code</p>
              </div>
              <QRScanner onScanSuccess={handleScanSuccess} />
              {isProcessingScan && <div className="mt-4 text-center font-black text-blue-600 animate-pulse text-[10px] uppercase tracking-widest">Validating Identity...</div>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClubHeadEvents;
