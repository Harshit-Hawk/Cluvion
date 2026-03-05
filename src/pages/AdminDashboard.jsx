import { useState, useEffect } from 'react';
import { Users, Activity, Flag, PlusCircle, CalendarPlus, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line as LineChart } from 'react-chartjs-2';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatCard = ({ title, value, icon: Icon, color, loading, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-1"
  >
    <div className={`p-4 rounded-xl ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
      {loading ? (
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 animate-pulse mt-1 rounded"></div>
      ) : (
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</h3>
      )}
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, clubs: 0, events: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Execute count queries in parallel
        const [
          { count: usersCount },
          { count: clubsCount },
          { count: eventsCount },
          { data: logs }
        ] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('clubs').select('*', { count: 'exact', head: true }),
          supabase.from('events').select('*', { count: 'exact', head: true }),
          supabase.from('activity_logs')
            .select(`
              id, action_type, created_at, points_awarded,
              users (full_name)
            `)
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        setStats({
          users: usersCount || 0,
          clubs: clubsCount || 0,
          events: eventsCount || 0
        });
        
        setRecentLogs(logs || []);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Global realtime listeners for counting entities
    const adminChannel = supabase
      .channel('admin_stats_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clubs' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => fetchDashboardData())
      .subscribe();

    return () => {
      supabase.removeChannel(adminChannel);
    };
  }, [user]);

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        fill: true,
        label: 'Platform Activity (Events + Logins)',
        data: [0, 5, 12, 28, 45, 80, stats.events + stats.users], // Dynamic mock curve based on real total
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  const formatActionType = (actionType) => {
    return actionType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Admin Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Platform-wide statistics and management.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={stats.users} icon={Users} color="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" loading={loading} delay={0.1} />
        <StatCard title="Active Clubs" value={stats.clubs} icon={Flag} color="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" loading={loading} delay={0.2} />
        <StatCard title="Total Events" value={stats.events} icon={Activity} color="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" loading={loading} delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none"></div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 relative z-10">Activity Analytics</h2>
          <div className="h-[300px] w-full relative z-10">
            <LineChart data={chartData} options={chartOptions} />
          </div>
        </motion.div>
        
        <div className="flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex-1"
          >
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Recent Platform Activity</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                   {[1,2,3].map(i => (
                      <div key={i} className="flex gap-3 items-start animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700 mt-1.5"></div>
                        <div className="w-full">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        </div>
                      </div>
                   ))}
                </div>
              ) : recentLogs.length > 0 ? (
                recentLogs.map(log => (
                  <div key={log.id} className="flex gap-3 items-start border-b border-gray-50 dark:border-gray-800 pb-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {log.users?.full_name} <span className="text-gray-500 dark:text-gray-400 font-normal">[{formatActionType(log.action_type)}]</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                         {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })} • +{log.points_awarded} pts
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activity found in the database.</p>
              )}
            </div>
          </motion.div>

          {/* Quick Actions Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-lg border border-indigo-500/30 p-6 text-white relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
            
            <h2 className="text-lg font-semibold mb-4 relative z-10">Quick Actions</h2>
            <div className="space-y-3 relative z-10">
              <Link to="/admin/clubs" className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/5 transition-colors group/btn">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg"><PlusCircle size={18} /></div>
                  <span className="font-medium text-sm">Manage Clubs</span>
                </div>
                <ArrowRight size={16} className="opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
              </Link>
              
              <Link to="/admin/users" className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/5 transition-colors group/btn">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg"><ShieldCheck size={18} /></div>
                  <span className="font-medium text-sm">User Roles</span>
                </div>
                <ArrowRight size={16} className="opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
