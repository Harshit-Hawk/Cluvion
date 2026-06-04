'use client';

import { Calendar, MapPin, ArrowRight } from 'lucide-react';

export default function UpcomingEventBanner() {
  return (
    <div className="relative w-full h-[280px] rounded-2xl overflow-hidden mb-6 group">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop')",
        }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F0B1E] via-[#0F0B1E]/80 to-transparent" />
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-8">
        <div>
          <span className="inline-block bg-purple-600 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-sm mb-4 shadow-sm">
            HACKATHON
          </span>
          <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Hackathon 2026</h2>
          <p className="text-gray-300 font-medium tracking-wide">Code. Innovate. Impact.</p>
        </div>

        <div className="flex items-end justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
              <Calendar size={16} />
              <span>24 May 2026</span>
              <span className="mx-1">•</span>
              <span>9:00 AM</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
              <MapPin size={16} />
              <span>Engineering Block, Main Campus</span>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-[#0F0B1E] overflow-hidden bg-gray-200">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-300">+120 going</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center">
               <span className="text-gray-400 text-[10px] font-bold tracking-widest uppercase mb-1">STARTS IN</span>
               <div className="flex items-center gap-3 text-white">
                 <div className="text-center">
                   <div className="text-2xl font-bold">02</div>
                   <div className="text-[10px] text-gray-400 uppercase tracking-wider">DAYS</div>
                 </div>
                 <div className="text-2xl font-light text-gray-600">:</div>
                 <div className="text-center">
                   <div className="text-2xl font-bold">14</div>
                   <div className="text-[10px] text-gray-400 uppercase tracking-wider">HRS</div>
                 </div>
                 <div className="text-2xl font-light text-gray-600">:</div>
                 <div className="text-center">
                   <div className="text-2xl font-bold">36</div>
                   <div className="text-[10px] text-gray-400 uppercase tracking-wider">MINS</div>
                 </div>
               </div>
            </div>
            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm px-8 py-3 rounded-xl shadow-lg shadow-purple-900/50 flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
              Register Now
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
