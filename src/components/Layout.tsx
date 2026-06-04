'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  LayoutDashboard, Users, Calendar, Award, BarChart2, 
  Settings, LogOut, Bell, Search, Menu, X, Home,
  MessageSquare, Target, Trophy, QrCode, Activity,
  Gift, ChevronDown, CheckSquare, User, BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import MobileBottomNav from './ui/MobileBottomNav';
import 'react-toastify/dist/ReactToastify.css';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { role, user, userProfile, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const pathname = usePathname() || '';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = !stored && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || prefersDark) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const navLinks = {
    super_admin: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Academics', path: '/admin/academics', icon: Award },
      { name: 'Users', path: '/admin/users', icon: Users },
      { name: 'Clubs', path: '/admin/clubs', icon: Target },
      { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
    ],
    college_admin: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Academics', path: '/admin/academics', icon: Award },
      { name: 'Users', path: '/admin/users', icon: Users },
      { name: 'Clubs', path: '/admin/clubs', icon: Target },
      { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Academics', path: '/admin/academics', icon: Award },
      { name: 'Users', path: '/admin/users', icon: Users },
      { name: 'Clubs', path: '/admin/clubs', icon: Target },
      { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
    ],
    faculty: [
      { name: 'Dashboard', path: '/faculty', icon: LayoutDashboard },
      { name: 'My Classes', path: '/faculty/classes', icon: Users },
      { name: 'Attendance', path: '/faculty/attendance', icon: Calendar },
    ],
    club_coordinator: [
      { name: 'Dashboard', path: '/head', icon: LayoutDashboard },
      { name: 'Events', path: '/head/events', icon: Calendar },
      { name: 'Members', path: '/head/club', icon: Users },
    ],
    club_head: [
      { name: 'Dashboard', path: '/head', icon: LayoutDashboard },
      { name: 'Events', path: '/head/events', icon: Calendar },
      { name: 'Members', path: '/head/club', icon: Users },
    ],
    student: [
      { name: 'Home', path: '/student', icon: Home },
      { name: 'Classroom', path: '/student/classroom', icon: BookOpen },
      { name: 'Events', path: '/student/events', icon: Calendar },
      { name: 'Clubs', path: '/student/clubs', icon: Users },
      { name: 'Leaderboard', path: '/student/leaderboard', icon: Trophy },
      { name: 'Profile', path: '/student/profile', icon: User },
    ],
  };

  const links = (role ? navLinks[role as keyof typeof navLinks] : navLinks.student) || navLinks.student;
  const profilePath = (role === 'admin' || role === 'super_admin' || role === 'college_admin') ? '/admin/profile' 
                    : (role === 'club_head' || role === 'club_coordinator') ? '/head/profile' 
                    : role === 'faculty' ? '/faculty/profile'
                    : '/student/profile';

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-gray-950 overflow-hidden text-gray-900 dark:text-gray-100 font-sans">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={true} />

      {/* Mobile Sticky Header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 text-gray-900 dark:text-white">
            <Menu size={28} />
          </button>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Cluvion
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/student/notifications" className="relative text-gray-600 hover:text-gray-900 transition-all">
            <Bell size={24} />
            {unreadCount > 0 && (
               <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-purple-600 border-2 border-white rounded-full"></span>
            )}
          </Link>
          <Link href={profilePath} className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
            {userProfile?.avatar_url ? (
              <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                {userProfile?.full_name?.charAt(0) || 'U'}
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo */}
        <div className="h-20 flex items-center px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Cluvion</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-hide">
          {links.map((link) => {
            const IconComp = link.icon;
            const isActive = link.path === '/student' ? pathname === '/student' : pathname.startsWith(link.path);
            
            return (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComp size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-sm">{link.name}</span>
                </div>
                {(link as any).badge && (
                  <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 text-xs font-bold px-2 py-0.5 rounded-full">
                    {(link as any).badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Invite Box */}
        <div className="px-4 py-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 relative overflow-hidden">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">Invite your friends<br/>and earn 50 XP!</h4>
            <div className="absolute top-4 right-4 text-purple-500"><Gift size={24} /></div>
            <button className="mt-3 bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-400 text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all inline-flex items-center gap-1">
              Invite Now <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <Link href="/student/settings" className="w-full flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 rounded-xl transition-colors group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
              <Settings size={20} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                Settings
              </p>
              <p className="text-xs truncate text-gray-400">
                Account, Theme & Logout
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto w-full relative">
        <div className="hidden md:flex absolute top-0 inset-x-0 h-20 items-center justify-between px-8 bg-[#F8FAFC]/80 dark:bg-gray-950/80 backdrop-blur-md z-30">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Good evening, {userProfile?.full_name?.split(' ')[0] || 'Harshit'}! 👋</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Let's make today on campus amazing.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search events, clubs, people..." 
                className="w-80 pl-10 pr-12 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/20 transition-all shadow-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden sm:inline-block border border-gray-200 dark:border-gray-700 rounded px-1.5 text-[10px] font-medium text-gray-400">⌘K</kbd>
              </div>
            </div>
            <Link href="/student/notifications" className="relative p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-gray-600 hover:text-gray-900 hover:shadow-sm transition-all shadow-sm">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </Link>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md bg-gray-100">
               <img src={userProfile?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Harshit"} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
        
        {/* Mobile Header Spacer */}
        <div className="h-16 md:hidden"></div>
        {/* Desktop Header Spacer */}
        <div className="hidden md:block h-24"></div>

        <div className="px-4 py-4 md:px-8 pb-20 md:pb-8 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <MobileBottomNav />
    </div>
  );
};

export default Layout;
