import { ArrowRight, ChevronDown, Trophy, Medal, Ticket, QrCode, Bookmark, Award, Calendar, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function MobileNextEventWidget() {
  return (
    <div className="md:hidden mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Next Event</h3>
        <button className="text-purple-600 dark:text-purple-400 text-xs font-bold">View all</button>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-3 shadow-sm flex gap-3">
        <div className="w-24 h-32 rounded-xl overflow-hidden flex-shrink-0 relative">
          <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop" alt="Hackathon" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-orange-500 text-xs">🔥</span>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">Hackathon 2026</h4>
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">2 days left</span>
            
            <div className="flex items-center gap-1 text-gray-500 text-[10px] mt-2">
              <Calendar size={12} />
              <span>24 May 2026 • 9:00 AM</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-[10px] mt-1 line-clamp-1">
              <QrCode size={12} />
              <span>Engineering Block</span>
            </div>
          </div>
          <button className="w-full bg-purple-600 text-white font-bold text-xs py-2 rounded-lg mt-2">
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
}

export function WeeklyMissionWidget() {
  return (
    <div className="md:hidden mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Weekly Mission</h3>
        <span className="text-gray-400 text-xs font-medium">67% complete</span>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm space-y-4">
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-900">Attend 2 Events</span>
            <span className="text-xs font-semibold text-gray-500">1/2</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 w-1/2 rounded-full"></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">Join 1 Club</span>
            <CheckCircle2 size={18} className="text-purple-600 fill-purple-100" />
          </div>
        </div>

      </div>
    </div>
  );
}
