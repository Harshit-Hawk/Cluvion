'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Trophy, Calendar, 
  ArrowUpRight, ArrowDownRight, Activity, Filter, 
  Download, RefreshCw, Layers, Zap, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, Title, Tooltip, Legend, Filler, BarElement, 
  ArcElement, RadialLinearScale 
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { supabase } from '../lib/supabase';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, RadialLinearScale, Title, Tooltip, 
  Legend, Filler
);

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');

  // ─── Mock Data for Complex Visuals ────────────────────────
  const engagementData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Current Period',
        data: [450, 590, 800, 810, 560, 550, 700],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Previous Period',
        data: [300, 480, 400, 610, 400, 450, 500],
        borderColor: 'rgba(156, 163, 175, 0.5)',
        borderDash: [5, 5],
        tension: 0.4,
        fill: false,
      }
    ]
  };

  const heatmapData = {
    labels: ['9AM', '12PM', '3PM', '6PM', '9PM', '12AM'],
    datasets: [{
      label: 'Activity Intensity',
      data: [12, 19, 30, 25, 40, 15],
      backgroundColor: 'rgba(16, 185, 129, 0.7)',
      borderRadius: 12,
    }]
  };

  const clubEngagement = {
    labels: ['Robotics', 'Debate', 'Coding', 'Art', 'Music'],
    datasets: [{
      label: 'Engagement Score',
      data: [85, 72, 90, 65, 58],
      backgroundColor: [
        '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'
      ],
      borderWidth: 0,
    }]
  };

  const challengeMetrics = {
    labels: ['Completion Rate', 'Social Sharing', 'Repeat Participation', 'New User Growth', 'Average XP'],
    datasets: [{
      label: 'Performance',
      data: [90, 75, 60, 85, 95],
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderColor: '#8b5cf6',
      pointBackgroundColor: '#8b5cf6',
    }]
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Intelligence Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Deep insights into campus engagement and retention.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeframe}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimeframe(e.target.value)}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last quarter</option>
          </select>
          <button className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={20} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* High-Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Students', value: '1,284', change: '+12.5%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Retention Rate', value: '84.2%', change: '+2.1%', icon: RefreshCw, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Avg. Daily XP', value: '450', change: '+8.4%', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'Club Growth', value: '24', change: '-3.2%', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${kpi.bg} dark:bg-opacity-10 ${kpi.color}`}>
                <kpi.icon size={22} />
              </div>
              <span className={`text-xs font-black px-2 py-1 rounded-full ${
                kpi.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {kpi.change}
              </span>
            </div>
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest">{kpi.label}</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{kpi.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Engagement Trends & Participation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Engagement Intensity</h3>
              <p className="text-sm text-gray-500">Cross-platform activity over time</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                <div className="w-2 h-2 rounded-full bg-blue-500" /> Current
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                <div className="w-2 h-2 rounded-full bg-gray-300" /> Previous
              </div>
            </div>
          </div>
          <div className="h-[350px]">
            <Line 
              data={engagementData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.03)' }, border: { display: false } },
                  x: { grid: { display: false }, border: { display: false } }
                }
              }} 
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Club Performance</h3>
          <p className="text-sm text-gray-500 mb-8">Engagement distribution by club</p>
          <div className="h-[300px]">
            <Bar 
              data={clubEngagement}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, border: { display: false } },
                  y: { grid: { display: false }, border: { display: false } }
                }
              }}
            />
          </div>
          <div className="mt-8 space-y-3">
            {['Robotics', 'Debate', 'Coding'].map((club, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">#{i+1} {club}</span>
                <div className="flex items-center gap-1 text-emerald-600 font-bold text-[10px]">
                  <ArrowUpRight size={12} /> 12%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap and Challenge Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Peak Activity Hour</h3>
              <p className="text-sm text-gray-500">Participation heatmap distribution</p>
            </div>
            <Clock size={24} className="text-emerald-500" />
          </div>
          <div className="h-[280px]">
            <Bar 
              data={heatmapData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { display: false },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Challenge Efficacy</h3>
              <p className="text-sm text-gray-500">Success metrics for active challenges</p>
            </div>
            <Layers size={24} className="text-purple-500" />
          </div>
          <div className="h-[280px]">
            <Radar 
              data={challengeMetrics}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    angleLines: { display: false },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: { display: false }
                  }
                },
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
