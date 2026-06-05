'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, Calendar, Activity, 
  ArrowUpRight, Download, RefreshCw, Zap, Clock, Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, Title, Tooltip, Legend, Filler, BarElement, 
  ArcElement, RadialLinearScale 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, RadialLinearScale, Title, Tooltip, 
  Legend, Filler
);

const ClubHeadAnalytics = () => {
  const { user, sessionReady } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');
  const [clubName, setClubName] = useState('');

  // We are using mock data mixed with realistic metrics for the demonstration of the UI
  // In a full production implementation, these datasets would be populated via Supabase aggregations.

  const engagementData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Member Activity (Interactions)',
        data: [120, 190, 250, 310],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Previous Period',
        data: [100, 150, 200, 180],
        borderColor: 'rgba(156, 163, 175, 0.5)',
        borderDash: [5, 5],
        tension: 0.4,
        fill: false,
      }
    ]
  };

  const attendanceData = {
    labels: ['Intro Meet', 'Workshop 1', 'Guest Speaker', 'Hackathon'],
    datasets: [{
      label: 'Event Attendance',
      data: [45, 60, 55, 85],
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderRadius: 8,
    }]
  };

  const roleDistribution = {
    labels: ['Active Participants', 'Occasional', 'Inactive'],
    datasets: [{
      data: [40, 35, 25],
      backgroundColor: ['#3b82f6', '#10b981', '#f43f5e'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  useEffect(() => {
    if (!sessionReady) return;
    if (!user) { setLoading(false); return; }

    const fetchClubInfo = async () => {
      setLoading(true);
      try {
        const { data: memberData }: any = await supabase
          .from('memberships')
          .select('club_id, clubs(name)')
          .eq('user_id', user.id)
          .eq('role', 'head')
          .maybeSingle();
        
        if (memberData?.clubs?.name) {
          setClubName(memberData.clubs.name);
        }
      } catch (err) {
        console.error('Error fetching analytics base info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClubInfo();
  }, [user, sessionReady]);

  if (!sessionReady || loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-12 w-1/3 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
        </div>
        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {clubName ? `${clubName} Analytics` : 'Club Analytics'}
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            Track engagement, event attendance, and member growth.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 dark:text-gray-200"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last Quarter</option>
            <option value="all">All Time</option>
          </select>
          <button className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm">
            <Download size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: '142', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Avg Attendance', value: '68%', change: '+5.4%', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Events Hosted', value: '12', change: '+2', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Total XP Earned', value: '14.5k', change: '+2.1k', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={20} strokeWidth={2.5} />
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                kpi.change.startsWith('+') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
              }`}>
                {kpi.change}
              </span>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">{kpi.label}</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">{kpi.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Line Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Member Engagement</h3>
              <p className="text-xs font-medium text-gray-500">Activity points over {timeframe}</p>
            </div>
          </div>
          <div className="h-[300px]">
            <Line 
              data={engagementData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { color: 'rgba(156,163,175,0.1)' }, border: { display: false } },
                  x: { grid: { display: false }, border: { display: false } }
                }
              }} 
            />
          </div>
        </div>

        {/* Member Role Distribution */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Member Activity</h3>
            <p className="text-xs font-medium text-gray-500">Participation breakdown</p>
          </div>
          <div className="flex-1 min-h-[200px] flex items-center justify-center relative">
            <Doughnut 
              data={roleDistribution}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: { 
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return ' ' + context.label + ': ' + context.raw + '%';
                      }
                    }
                  }
                }
              }}
            />
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-gray-900 dark:text-white">75%</span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase">Active</span>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            {roleDistribution.labels.map((label, index) => (
              <div key={index} className="flex justify-between items-center text-xs font-semibold px-2">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: roleDistribution.datasets[0]!.backgroundColor[index] }} />
                  {label}
                </div>
                <span className="text-gray-900 dark:text-white font-bold">{roleDistribution.datasets[0]!.data[index]}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Bar Chart */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Event Attendance</h3>
            <p className="text-xs font-medium text-gray-500">Turnout for recent events</p>
          </div>
          <Calendar size={20} className="text-emerald-500" />
        </div>
        <div className="h-[250px]">
          <Bar 
            data={attendanceData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(156,163,175,0.1)' }, border: { display: false } },
                x: { grid: { display: false }, border: { display: false } }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ClubHeadAnalytics;
