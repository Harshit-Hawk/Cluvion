'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Users, Search, Filter, Bookmark } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function StudentEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [activeCategory, setActiveCategory] = useState('All');

  const tabs = ['Upcoming', 'My Events', 'Past'];
  const categories = ['All', 'Tech', 'Cultural', 'Sports', 'Workshops'];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            clubs (name),
            event_attendance!left(user_id, status)
          `)
          .gte('event_date', new Date().toISOString())
          .order('event_date', { ascending: true });

        if (error) throw error;

        const formattedEvents = data.map((e: any) => ({
          ...e,
          registered: user ? e.event_attendance.some((a: any) => a.user_id === user.id) : false,
          checked_in: user ? e.event_attendance.some((a: any) => a.user_id === user.id && a.status === 'attended') : false,
          registration_count: e.event_attendance.length
        }));

        setEvents(formattedEvents);
      } catch (err) {
        console.error('Error fetching events', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchEvents();
  }, [user]);

  const handleRegister = async (eventId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    if (!user) return;
    try {
      const { error } = await supabase
        .from('event_attendance')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'registered'
        });
      
      if (error) throw error;
      toast.success('Successfully registered for event!');
      
      // Update local state
      setEvents(events.map(ev => {
        if (ev.id === eventId) {
          return {
            ...ev,
            registered: true,
            registration_count: ev.registration_count + 1
          };
        }
        return ev;
      }));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to register');
    }
  };

  // Use dummy data if none returned from DB for UI showcase
  const displayEvents = events.length > 0 ? events : [
    {
      id: 1, title: 'Hackathon 2026', event_date: new Date(Date.now() + 172800000).toISOString(),
      location: 'Engineering Block', daysLeft: '2 days left',
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop'
    },
    {
      id: 2, title: 'AI & ML Workshop', event_date: new Date(Date.now() + 432000000).toISOString(),
      location: 'Seminar Hall, Block B', daysLeft: '5 days left',
      image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=2070&auto=format&fit=crop'
    },
    {
      id: 3, title: 'Battle of Bands', event_date: new Date(Date.now() + 604800000).toISOString(),
      location: 'Open Air Theatre', daysLeft: '7 days left',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070&auto=format&fit=crop'
    }
  ];

  return (
    <div className="w-full">
      {/* Mobile Header elements */}
      <div className="flex items-center justify-between md:hidden mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Events</h1>
        <div className="flex gap-4">
          <Search size={20} className="text-gray-900 dark:text-white" />
          <Filter size={20} className="text-gray-900 dark:text-white" />
        </div>
      </div>

      <div className="hidden md:flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Events</h2>
          <p className="text-gray-500 mt-1">Discover what's happening</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 mb-4">
        <div className="flex gap-6 w-full overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-3 mb-6 overflow-x-auto scrollbar-hide pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Event List */}
      <div className="space-y-4">
        {displayEvents.map((event) => (
          <Link href={`/student/events/${event.id}`} key={event.id} className="block">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-3 shadow-sm hover:shadow-md transition-all flex gap-4">
              <div className="w-28 h-36 rounded-xl overflow-hidden flex-shrink-0 relative">
                {event.image ? (
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                    <Calendar className="text-purple-400" />
                  </div>
                )}
                {/* Overlay text in image like mockup */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-2">
                   <h4 className="text-white font-black text-[10px] leading-tight break-words uppercase tracking-widest text-center">{event.title}</h4>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-between py-1 pr-2">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight mb-1">{event.title}</h3>
                  </div>
                  <span className="text-xs font-bold text-purple-600 mb-2 block">{event.daysLeft || 'Upcoming'}</span>
                  
                  <div className="flex items-center gap-2 text-gray-500 text-[10px] sm:text-xs mb-1">
                    <Calendar size={12} className="shrink-0" />
                    <span>{format(new Date(event.event_date), 'dd MMM yyyy • h:mm a')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-[10px] sm:text-xs line-clamp-1">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1.5">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-5 h-5 rounded-full border border-white overflow-hidden bg-gray-200">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${event.title}${i}`} alt="user" />
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500">+{event.registration_count > 3 ? event.registration_count - 3 : 0} joined</span>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    {event.registered ? (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                        {event.checked_in ? 'Checked In' : 'Registered'}
                      </span>
                    ) : (
                      <button 
                        onClick={(e) => handleRegister(event.id, e)}
                        className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-1.5 rounded-lg transition-colors shadow-sm"
                      >
                        Register
                      </button>
                    )}
                    <button className="text-gray-400 hover:text-purple-600 bg-gray-50 hover:bg-purple-50 p-1.5 rounded-lg transition-colors" onClick={(e) => { e.preventDefault(); toast.success('Bookmarked!'); }}>
                      <Bookmark size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
