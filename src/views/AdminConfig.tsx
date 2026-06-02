// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Trophy, Settings, Save, RefreshCw, AlertTriangle, 
  Plus, Trash2, Award, Users, Calendar, ShieldCheck,
  ChevronRight, ArrowRight, Layers, BarChart, Info
} from 'lucide-react';
import { toast } from 'react-toastify';

const AdminConfig = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [activePanel, setActivePanel] = useState('xp'); // 'xp', 'levels', 'badges'
  
  const [xpConfig, setXpConfig] = useState({
    attendance: 50,
    organization: 150,
    contribution: 30,
    challenge_win: 500,
    streak_multiplier: 1.2
  });

  const levelProgression = [
    { level: 1, xpRequired: 0, title: 'Novice' },
    { level: 2, xpRequired: 500, title: 'Explorer' },
    { level: 3, xpRequired: 1200, title: 'Active' },
    { level: 4, xpRequired: 2500, title: 'Contributor' },
    { level: 5, xpRequired: 5000, title: 'Veteran' },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Configuration updated and deployed!');
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Engine Core</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Fine-tune the platform's engagement algorithms.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
          >
            {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            Push Updates
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          {[
            { id: 'xp', label: 'Reward Values', icon: Zap, color: 'text-blue-500', desc: 'Points per action' },
            { id: 'levels', label: 'Progression', icon: Layers, color: 'text-purple-500', desc: 'Thresholds & Ranks' },
            { id: 'badges', label: 'Badge Logic', icon: Award, color: 'text-amber-500', desc: 'Unlock conditions' },
          ].map((panel) => (
            <button
              key={panel.id}
              onClick={() => setActivePanel(panel.id)}
              className={`w-full text-left p-5 rounded-3xl border transition-all ${
                activePanel === panel.id 
                  ? 'bg-white dark:bg-gray-900 border-blue-100 dark:border-blue-900 shadow-lg shadow-blue-500/5' 
                  : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${activePanel === panel.id ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'} ${panel.color}`}>
                  <panel.icon size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">{panel.label}</h4>
                  <p className="text-[10px] font-bold text-gray-400 mt-0.5">{panel.desc}</p>
                </div>
              </div>
            </button>
          ))}
          
          <div className="mt-8 p-6 bg-gray-900 rounded-[2.5rem] text-white relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            <h5 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-2">Live Monitor</h5>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-300">Engine Online</span>
            </div>
            <p className="text-[10px] text-gray-500 leading-relaxed mb-6">
              All point triggers are active. Changes take effect across the campus instantly upon save.
            </p>
            <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              Test Trigger
            </button>
          </div>
        </div>

        {/* Main Configuration Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activePanel === 'xp' && (
              <motion.div 
                key="xp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 p-10 shadow-sm"
              >
                <div className="mb-10">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">XP Reward Mapping</h3>
                  <p className="text-sm text-gray-500 font-medium">Configure base points for each engagement vector.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { key: 'attendance', label: 'Event Attendance', icon: Calendar, color: 'bg-emerald-50 text-emerald-600' },
                    { key: 'organization', label: 'Event Organization', icon: ShieldCheck, color: 'bg-blue-50 text-blue-600' },
                    { key: 'contribution', label: 'Club Contribution', icon: Users, color: 'bg-amber-50 text-amber-600' },
                    { key: 'challenge_win', label: 'Challenge Victory', icon: Trophy, color: 'bg-purple-50 text-purple-600' },
                  ].map((item) => (
                    <div key={item.key} className="group p-6 rounded-[2rem] border border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 hover:border-blue-100 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-2xl ${item.color}`}>
                          <item.icon size={20} />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base Pts</span>
                      </div>
                      <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3">{item.label}</label>
                      <div className="relative">
                        <input 
                          type="number"
                          value={xpConfig[item.key]}
                          onChange={(e) => setXpConfig({...xpConfig, [item.key]: parseInt(e.target.value)})}
                          className="w-full px-5 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-black text-gray-900 dark:text-white transition-all text-lg"
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <Zap size={14} className="text-amber-500" />
                          <span className="text-xs font-black text-gray-400">XP</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 p-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] text-white">
                  <div className="flex items-center justify-between gap-8">
                    <div>
                      <h4 className="text-lg font-black mb-1">Global Streak Multiplier</h4>
                      <p className="text-xs text-white/70">Bonus points applied to daily streaks.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white/10 p-2 rounded-2xl backdrop-blur-md">
                      <input 
                        type="number" 
                        step="0.1"
                        value={xpConfig.streak_multiplier}
                        onChange={(e) => setXpConfig({...xpConfig, streak_multiplier: parseFloat(e.target.value)})}
                        className="w-20 px-3 py-3 bg-transparent border-none text-center font-black text-xl outline-none"
                      />
                      <span className="pr-4 text-xs font-black uppercase">Multiplier</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activePanel === 'levels' && (
              <motion.div 
                key="levels"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 p-10 shadow-sm"
              >
                <div className="mb-10">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">Rank Progression</h3>
                  <p className="text-sm text-gray-500 font-medium">Define XP thresholds for student levels.</p>
                </div>

                <div className="space-y-4">
                  {levelProgression.map((lvl) => (
                    <div key={lvl.level} className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-gray-800/30 rounded-[2rem] group hover:bg-white transition-all border border-transparent hover:border-blue-100">
                      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-black text-gray-400">LVL</span>
                        <span className="text-xl font-black text-gray-900 dark:text-white">{lvl.level}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-gray-900 dark:text-white">{lvl.title}</h4>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${(lvl.xpRequired / 5000) * 100}%` }} />
                          </div>
                          <span className="text-xs font-black text-gray-400">{lvl.xpRequired} XP</span>
                        </div>
                      </div>
                      <button className="p-2 text-gray-300 hover:text-blue-500 transition-colors">
                        <Settings size={18} />
                      </button>
                    </div>
                  ))}
                  <button className="w-full py-4 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2rem] text-xs font-black text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                    <Plus size={16} /> Add Next Level
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminConfig;
