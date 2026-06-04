'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Share, Bookmark, Calendar, MapPin, Users, Gift, FileBadge, Banknote, Network } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();

  // In a real app, fetch event details by params.id. Using dummy data based on mockup.
  const event = {
    title: 'Hackathon 2026',
    subtitle: 'Code. Innovate. Impact.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop',
    daysLeft: '2 days left',
    date: '24 May 2026 • 9:00 AM',
    location: 'Engineering Block, Main Campus',
    registered: 120,
    about: 'Build solutions, solve real-world problems and showcase your skills. This is a 48-hour hackathon bringing together the best minds on campus.',
    perks: [
      { id: 1, label: 'Cash Prizes', icon: Banknote },
      { id: 2, label: 'Certificates', icon: FileBadge },
      { id: 3, label: 'Goodies', icon: Gift },
      { id: 4, label: 'Networking', icon: Network },
    ]
  };

  return (
    <div className="w-full relative pb-24 md:pb-8 bg-white dark:bg-gray-950 min-h-screen -mt-[72px] md:mt-0 pt-4 md:pt-0">
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 md:hidden mb-2">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-900 dark:text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="flex gap-2">
          <button className="p-2 text-gray-900 dark:text-white"><Share size={20} /></button>
          <button className="p-2 text-gray-900 dark:text-white"><Bookmark size={20} /></button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-0">
        {/* Hero Image */}
        <div className="relative w-full h-[250px] sm:h-[350px] rounded-[32px] overflow-hidden mb-6 shadow-lg shadow-purple-900/10">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center p-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 uppercase tracking-tight w-1/2">{event.title}</h1>
            <p className="text-gray-200 font-medium text-sm sm:text-base">{event.subtitle}</p>
          </div>
          <div className="absolute -bottom-4 left-6 bg-white dark:bg-gray-900 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-800 shadow-md flex items-center gap-1.5 z-10">
            <span className="text-orange-500">🔥</span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">{event.daysLeft}</span>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 px-2 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{event.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{event.subtitle}</p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 text-sm">
              <Calendar size={18} className="text-gray-400 shrink-0" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 text-sm">
              <MapPin size={18} className="text-gray-400 shrink-0" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 text-sm">
              <Users size={18} className="text-gray-400 shrink-0" />
              <span>{event.registered}+ registered</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 pb-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 overflow-hidden bg-gray-200">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Attendee${i}`} alt="user" />
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-white">+{event.registered}</span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">About</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {event.about}
            </p>
            <button className="text-purple-600 text-xs font-bold mt-2 hover:underline">Read more v</button>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Perks</h3>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
              {event.perks.map((perk) => (
                <div key={perk.id} className="flex flex-col items-center gap-2 min-w-[72px]">
                  <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <perk.icon size={24} strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 text-center leading-tight">
                    {perk.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action (Mobile) */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 md:relative md:border-t-0 md:bg-transparent md:p-0 md:mt-8 z-40 max-w-3xl mx-auto">
        <button 
          onClick={() => toast.success('Registered successfully!')}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-base py-4 rounded-2xl shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98]"
        >
          Register Now
        </button>
      </div>
    </div>
  );
}
