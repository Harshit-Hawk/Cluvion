'use client';

import { ArrowRight, ChevronDown, Trophy, Medal, Ticket, QrCode, Bookmark, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export function UpcomingEventsWidget() {
  const events = [
    { date: '24', month: 'MAY', title: 'Hackathon 2026', time: '24 May · 9:00 AM', daysLeft: '2D' },
    { date: '26', month: 'MAY', title: 'AI & ML Workshop', time: '26 May · 11:00 AM', daysLeft: '4D' },
    { date: '28', month: 'MAY', title: 'Battle of Bands', time: '28 May · 3:00 PM', daysLeft: '6D' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white">Upcoming Events</h3>
        <button className="text-purple-600 dark:text-purple-400 text-xs font-bold hover:underline">View all</button>
      </div>
      <div className="space-y-4">
        {events.map((e, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex-shrink-0">
              <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest leading-none mb-0.5">{e.month}</span>
              <span className="text-lg font-black text-gray-900 dark:text-white leading-none">{e.date}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{e.title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{e.time}</p>
            </div>
            <div className="flex items-center justify-center h-6 px-2 rounded bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold tracking-wider">
              {e.daysLeft}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeaderboardWidget() {
  const leaders = [
    { rank: 1, name: 'Aryan Verma', level: 6, xp: 580, img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan' },
    { rank: 2, name: 'Priya Singh', level: 5, xp: 470, img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
    { rank: 3, name: 'Rohit Mehta', level: 5, xp: 450, img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohit' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white">Leaderboard</h3>
        <button className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
          This Week <ChevronDown size={14} />
        </button>
      </div>
      <div className="space-y-4">
        {leaders.map((l) => (
          <div key={l.rank} className="flex items-center gap-3">
            <div className="w-5 text-center flex justify-center">
              {l.rank === 1 && <Trophy size={16} className="text-yellow-500" fill="currentColor" />}
              {l.rank === 2 && <Medal size={16} className="text-gray-400" fill="currentColor" />}
              {l.rank === 3 && <Medal size={16} className="text-orange-400" fill="currentColor" />}
            </div>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
              <img src={l.img} alt={l.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{l.name}</h4>
            </div>
            <div className="text-right flex items-center gap-4">
               <span className="text-xs text-gray-500">Level {l.level}</span>
               <span className="text-xs font-bold text-gray-900 w-12 text-right">{l.xp} XP</span>
            </div>
          </div>
        ))}
        {/* Current User */}
        <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/10 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/30 -mx-2">
            <div className="w-5 text-center text-sm font-bold text-purple-600">21</div>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-purple-200">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Harshit" alt="Me" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">Harshit Kumar</h4>
            </div>
            <div className="text-right flex items-center gap-4">
               <span className="text-xs text-gray-500">Level 4</span>
               <span className="text-xs font-black text-gray-900 w-12 text-right">340 XP</span>
            </div>
        </div>
      </div>
    </div>
  );
}

export function ProgressWidget() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-5 shadow-sm">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Your Progress</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-14 h-14 flex items-center justify-center">
           {/* Hexagon shape bg */}
           <div className="absolute inset-0 bg-purple-500 opacity-20 transform rotate-45 rounded-lg"></div>
           <div className="absolute inset-0 bg-purple-600 transform rotate-12 rounded-lg"></div>
           <StarIcon className="text-white relative z-10 w-8 h-8" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white">Level 4</h4>
          <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            Rising Star <span className="text-yellow-500">✨</span>
          </p>
          <p className="text-xl font-black text-purple-600 mt-0.5">340 <span className="text-xs uppercase tracking-widest text-purple-400">XP</span></p>
        </div>
      </div>
      
      <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '60%' }}
          transition={{ duration: 1 }}
          className="h-full bg-purple-600 rounded-full" 
        />
      </div>
      <p className="text-right text-[10px] font-semibold text-gray-400 mt-2">60 XP to Level 5</p>
    </div>
  );
}

export function QuickLinksWidget() {
  const links = [
    { icon: Ticket, label: 'My Tickets' },
    { icon: QrCode, label: 'My ID Card' },
    { icon: Bookmark, label: 'Saved Events' },
    { icon: Award, label: 'Achievements' },
  ];
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Links</h3>
      <div className="grid grid-cols-4 gap-2">
        {links.map((l, i) => (
          <button key={i} className="flex flex-col items-center justify-center gap-2 group">
            <div className="w-12 h-12 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-600 group-hover:border-purple-100 transition-all">
              <l.icon size={20} />
            </div>
            <span className="text-[9px] font-semibold text-gray-500 text-center leading-tight px-1 group-hover:text-gray-900">{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Simple star SVG for the badge
function StarIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}
