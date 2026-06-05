'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Activity, Flag, CheckSquare, Settings, Bell,
  ArrowUpRight, TrendingUp, Calendar, Trophy, Zap,
  Plus, ChevronRight, AlertCircle, BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler, BarElement, ArcElement
} from 'chart.js';
import { Line as LineChart, Doughnut } from 'react-chartjs-2';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { DashboardContainer, SectionHeader } from '../../components/ui/DashboardLayout';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

/* ── Compact stat card ── */
const AdminStatCard = ({ title, value, change, icon: Icon, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon size={18} />
      </div>
      {change !== undefined && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          change > 0
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
        }`}>
          {change > 0 ? '+' : ''}{change}%
        </span>
      )}
    </div>
    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{title}</p>
    <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none">{value}</h3>
  </motion.div>
);

/* ── Quick action card ── */
const QuickActionCard = ({ href, icon: Icon, iconColor, title, subtitle, cta, gradient = false }: any) => {
  const base = gradient
    ? 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/20'
    : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:border-blue-200 dark:hover:border-blue-900/50';

  return (
    <Link href={href} className={`group block p-5 rounded-2xl transition-all relative overflow-hidden ${base}`}>
      {gradient && <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />}
      <Icon className={`mb-3 ${gradient ? 'text-white/80' : iconColor} group-hover:scale-110 transition-transform duration-300`} size={24} />
      <h4 className={`font-bold mb-0.5 ${gradient ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{title}</h4>
      <p className={`text-xs ${gradient ? 'text-white/70' : 'text-gray-500'} mb-3`}>{subtitle}</p>
      <div className={`flex items-center text-xs font-bold gap-1 ${gradient ? 'text-white/80' : 'text-blue-600 dark:text-blue-400'}`}>
        {cta} <ChevronRight size={13} />
      </div>
    </Link>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, clubs: 0, events: 0, xpToday: 0, pendingEvents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [
          { count: usersCount },
          { count: clubsCount },
          { count: eventsCount },
          { count: pendingCount }
        ]: any[] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('clubs').select('*', { count: 'exact', head: true }),
          supabase.from('events').select('*', { count: 'exact', head: true }),
          supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'pending')
        ]);
        setStats({
          users: usersCount || 0,
          clubs: clubsCount || 0,
          events: eventsCount || 0,
          pendingEvents: pendingCount || 0,
          xpToday: 1240
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const engagementData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Activity',
      data: [65, 78, 45, 92, 110, 85, 140],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#3b82f6',
    }]
  };

  const categoryDistribution = {
    labels: ['Academic', 'Social', 'Sport', 'Art'],
    datasets: [{
      data: [40, 25, 20, 15],
      backgroundColor: ['#3b82f6', '#ec4899', '#10b981', '#f59e0b'],
      borderWidth: 0,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { font: { size: 11 } } }
    }
  };

  return (
    <DashboardContainer className="space-y-6 pb-8">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Admin Control</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Campus engagement & platform management</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/announcements"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-200"
          >
            <Plus size={16} /> Announce
          </Link>
        </div>
      </div>

      {/* ── Stat Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminStatCard title="Students" value={loading ? '—' : stats.users}    change={12}  icon={Users}       color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"   delay={0.05} />
        <AdminStatCard title="Clubs"    value={loading ? '—' : stats.clubs}    change={5}   icon={Flag}        color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"              delay={0.1}  />
        <AdminStatCard title="Pending"  value={loading ? '—' : stats.pendingEvents} change={-8} icon={AlertCircle} color="bg-amber-50 dark:bg-amber-900/20 text-amber-600"                  delay={0.15} />
        <AdminStatCard title="XP Today" value={loading ? '—' : stats.xpToday} change={24}  icon={Zap}         color="bg-purple-50 dark:bg-purple-900/20 text-purple-600"                 delay={0.2}  />
      </div>

      {/* ── Main 2-col grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT: Chart + Quick Actions */}
        <div className="lg:col-span-2 space-y-5">

          {/* Engagement chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <SectionHeader title="Engagement Trends" subtitle="Daily platform activity" />
              <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg">
                <button className="px-2.5 py-1 rounded-md text-xs font-bold bg-white dark:bg-gray-700 shadow-sm">Week</button>
                <button className="px-2.5 py-1 rounded-md text-xs font-bold text-gray-400">Month</button>
              </div>
            </div>
            <div className="h-52">
              <LineChart data={engagementData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Quick action cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickActionCard
              href="/admin/config"
              icon={Settings}
              iconColor="text-indigo-500"
              title="XP Configuration"
              subtitle="Tune point values & thresholds"
              cta="Open Engine"
              gradient
            />
            <QuickActionCard
              href="/admin/moderation"
              icon={CheckSquare}
              iconColor="text-emerald-500"
              title="Event Moderation"
              subtitle="Approve or reject club events"
              cta={`${stats.pendingEvents} Pending`}
            />
          </div>
        </div>

        {/* RIGHT: Doughnut + Live Feed */}
        <div className="space-y-5">

          {/* Category doughnut */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <SectionHeader title="Category Impact" />
            <div className="h-44">
              <Doughnut
                data={categoryDistribution}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '72%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { boxWidth: 8, usePointStyle: true, padding: 14, font: { size: 11 } }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Live feed */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <SectionHeader title="Live Feed" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            </div>
            <div className="space-y-3">
              {[
                { label: 'Badge Unlocked', sub: 'Student #1293 earned "Event Veteran"', time: '2m' },
                { label: 'New Membership', sub: 'Rohan Shah joined Photography Club', time: '8m' },
                { label: 'Event Created', sub: 'Tech Minds: Hackathon 2026', time: '23m' },
                { label: 'XP Awarded', sub: '+50 XP issued for attendance', time: '1h' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start pb-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                    <Activity size={14} className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.label}</p>
                    <p className="text-[10px] text-gray-400 truncate">{item.sub}</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-300 flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
            <Link
              href="/admin/analytics"
              className="w-full mt-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-1.5"
            >
              View All Activity <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </div>

    </DashboardContainer>
  );
};

export default AdminDashboard;
