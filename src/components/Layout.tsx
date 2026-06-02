'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  LayoutDashboard, Users, Calendar, Award, BarChart2, 
  Settings, LogOut, Bell, Search, Menu, X, Home,
  CheckSquare, UserCheck, TrendingUp, Lock, Trash2, Trophy, Activity, CheckCheck, Flag, Sun, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import MobileQuickActions from './MobileQuickActions';
import 'react-toastify/dist/ReactToastify.css';

const TYPE_COLORS = {
  event:        { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', icon: Calendar },
  achievement:  { bg: 'bg-amber-50 dark:bg-amber-900/30',     text: 'text-amber-600 dark:text-amber-400',     icon: Award },
  points:       { bg: 'bg-blue-50 dark:bg-blue-900/30',       text: 'text-blue-600 dark:text-blue-400',       icon: Activity },
  announcement: { bg: 'bg-indigo-50 dark:bg-indigo-900/30',   text: 'text-indigo-600 dark:text-indigo-400',   icon: Bell },
  challenge:    { bg: 'bg-purple-50 dark:bg-purple-900/30',   text: 'text-purple-600 dark:text-purple-400',   icon: Trophy },
  leaderboard:  { bg: 'bg-rose-50 dark:bg-rose-900/30',       text: 'text-rose-600 dark:text-rose-400',       icon: TrendingUp },
};

// Helper: check if a path is active (equivalent to NavLink's isActive)
function useIsActive(path: string) {
  const pathname = usePathname() || '';
  const segments = path.split('/').length;
  if (segments <= 2) {
    return pathname === path;
  }
  return pathname === path;
}

// NavLink replacement for Next.js
interface AppNavLinkProps {
  href: string;
  end?: boolean;
  className?: string | ((props: { isActive: boolean }) => string);
  children: React.ReactNode | ((props: { isActive: boolean }) => React.ReactNode);
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  title?: string;
}

function AppNavLink({ href, end, className, children, onClick, title }: AppNavLinkProps) {
  const pathname = usePathname() || '';
  const isActive = end
    ? pathname === href
    : pathname === href || pathname.startsWith(href + '/');
  // For exact end matching on short paths
  const finalActive = (href.split('/').length <= 2) ? pathname === href : isActive;
  const computedClassName = typeof className === 'function' ? className({ isActive: finalActive }) : className;

  return (
    <Link href={href} className={computedClassName} onClick={onClick} title={title}>
      {typeof children === 'function' ? children({ isActive: finalActive }) : children}
    </Link>
  );
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { role, user, userProfile, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const pathname = usePathname() || '';
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(false);

  // Hydration-safe: read theme preference after mount (client-only)
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
    admin: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
      { name: 'Users', path: '/admin/users', icon: Users },
      { name: 'Events', path: '/admin/moderation', icon: CheckSquare },
      { name: 'Config', path: '/admin/config', icon: Settings },
      { name: 'Broadcast', path: '/admin/announcements', icon: Bell },
      { name: 'Settings', path: '/admin/settings', icon: Lock },
    ],
    club_head: [
      { name: 'Dashboard',    path: '/head',             icon: LayoutDashboard, section: 'Dashboard'   },
      { name: 'Home',         path: '/head/home',         icon: Home,            section: 'Main'        },
      { name: 'Club Members', path: '/head/club',         icon: Users,           section: 'Management'  },
      { name: 'Leaderboard',  path: '/student/leaderboard', icon: Trophy,          section: 'Engagement'  },
      { name: 'Analytics',    path: '/head/analytics',    icon: BarChart2,       section: 'Performance' },
      { name: 'Achievements', path: '/head/achievements', icon: Award,           section: 'Recognition' },
    ],
    student: [
      { name: 'Home',       shortName: 'Home',   path: '/student',                icon: Home },
      { name: 'Events',     shortName: 'Events', path: '/student/events',          icon: Calendar },
      { name: 'Ranks',      shortName: 'Ranks',  path: '/student/leaderboard',     icon: Trophy },
      { name: 'Clubs',      shortName: 'Clubs',  path: '/student/clubs',           icon: Users },
      { name: 'Activity',   shortName: 'Me',     path: '/student/activity',        icon: Activity },
    ],
  };

  const links = (role ? navLinks[role as keyof typeof navLinks] : navLinks.student) || navLinks.student;
  const profilePath = role === 'admin' ? '/admin/profile' : role === 'club_head' ? '/head/profile' : '/student/profile';
  const homePath = role === 'admin' ? '/admin' : role === 'club_head' ? '/head' : '/student';
  const avatarLinkTarget = pathname === profilePath ? homePath : profilePath;



  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden text-gray-900 dark:text-gray-100">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={true} />

      {/* Mobile Sticky Header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 h-16">
        {/* Left: Profile Avatar */}
        <Link
          href={avatarLinkTarget}
          className="w-[36px] h-[36px] flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 font-bold border border-emerald-200/60 shadow-sm active:scale-95 transition-transform overflow-hidden"
        >
          {userProfile?.avatar_url ? (
            <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            userProfile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'
          )}
        </Link>

        {/* Center: Text Logo */}
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500">
          Cluvion
        </h2>

        {/* Right: Bell + Settings */}
        <div className="flex items-center gap-1">
          {/* Bell Link to Alerts */}
          <Link
            href="/student/notifications"
            className={`p-2 rounded-lg transition-colors relative flex items-center justify-center ${pathname === '/student/notifications' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 border border-white dark:border-gray-950">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            className={`p-2 rounded-lg transition-colors flex items-center justify-center ${pathname === '/settings' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
          >
            <Settings size={20} />
          </Link>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full">
        <div
          className={`relative z-40 bg-white dark:bg-gray-900 h-full border-r border-gray-200 dark:border-gray-800 flex flex-col pt-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}
        >
          {/* Sidebar Header */}
          <Link
            href={role === 'admin' ? '/admin/profile' : role === 'club_head' ? '/head/profile' : '/student/profile'}
            onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
            className={`border-b border-gray-100 dark:border-gray-800 block hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer ${isCollapsed ? 'p-3' : 'px-3 py-3'}`}
          >
            <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2 py-1' : 'flex-row gap-2'}`}>
              {/* Hamburger toggle */}
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsCollapsed(!isCollapsed); }}
                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex-shrink-0"
              >
                <Menu size={18} />
              </button>

              {/* Avatar */}
              <div className={`${isCollapsed ? 'w-9 h-9' : 'w-9 h-9'} rounded-full bg-white dark:bg-gray-900 shadow-md group-hover:scale-105 transition-transform duration-300 flex-shrink-0`}>
                <div className="w-full h-full rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold border border-emerald-100 overflow-hidden">
                  {userProfile?.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    userProfile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
              </div>

              {/* Name + Role */}
              {!isCollapsed && (
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                    {userProfile?.full_name || user?.email?.split('@')[0] || 'User'}
                  </h3>
                  <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mt-0.5">
                    {userProfile?.roll_no || role?.replace('_', ' ')}
                  </p>
                </div>
              )}
            </div>
          </Link>

          <nav className={`flex-1 overflow-y-auto py-4 ${isCollapsed ? 'px-3 space-y-1' : 'px-4'}`}>
            {(() => {
              const sections: any[] = [];
              let currentSection: string | null = null;
              let sectionIndex = 0;
              links.forEach((link: any) => {
                const sec = link.section || 'Main';
                if (sec !== currentSection) {
                  sections.push({ type: 'label', name: sec, key: `sec-${sec}-${sectionIndex++}` });
                  currentSection = sec;
                }
                sections.push({ type: 'link', link, key: link.path });
              });
              return sections.map((item) => {
                if (item.type === 'label') {
                  if (isCollapsed) return <div key={item.key} className="my-2 border-t border-gray-100 dark:border-gray-800" />;
                  return (
                    <p key={item.key} className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                      {item.name}
                    </p>
                  );
                }
                const { link } = item;
                const IconComp = link.icon;
                const isActive = link.path.split('/').length <= 2 ? pathname === link.path : pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                    className={`flex items-center rounded-lg transition-colors font-medium text-sm ${
                      isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
                    } ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`}
                    title={isCollapsed ? link.name : ''}
                  >
                    <IconComp size={isCollapsed ? 22 : 18} className={isCollapsed ? 'mx-auto' : ''} />
                    {!isCollapsed && <span>{link.name}</span>}
                  </Link>
                );
              });
            })()}
          </nav>

          {/* Sidebar Footer: bell + settings */}
          <div className={`border-t border-gray-100 dark:border-gray-800 flex flex-col gap-1 ${isCollapsed ? 'p-3' : 'p-4'}`}>
            {/* Bell Link for desktop */}
            <Link
              href="/student/notifications"
              className={`w-full flex items-center text-sm font-medium transition-colors rounded-lg relative ${pathname === '/student/notifications' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'} ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'}`}
              title={isCollapsed ? 'Alerts' : ''}
            >
              <Bell size={isCollapsed ? 22 : 18} className={isCollapsed ? 'mx-auto' : ''} />
              {!isCollapsed && <span>Alerts</span>}
              {unreadCount > 0 && (
                <span className={`${isCollapsed ? 'absolute top-1.5 right-1.5 w-2 h-2' : 'ml-auto text-[10px] min-w-[18px] h-[18px] px-1'} bg-red-500 text-white font-bold rounded-full flex items-center justify-center border border-white dark:border-gray-900`}>
                  {isCollapsed ? '' : (unreadCount > 9 ? '9+' : unreadCount)}
                </span>
              )}
            </Link>

            <Link
              href="/settings"
              className={`w-full flex items-center text-sm font-medium transition-colors rounded-lg ${
                pathname === '/settings' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              } ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'}`}
              title={isCollapsed ? 'Settings' : ''}
            >
              <Settings size={isCollapsed ? 22 : 18} className={isCollapsed ? 'mx-auto' : ''} />
              {!isCollapsed && <span>Settings</span>}
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 h-full overflow-y-auto w-full pb-20 md:pb-0">
        <div className="px-4 py-4 md:px-8 md:py-8 pt-[72px] md:pt-8 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      <MobileQuickActions />

      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <nav className="flex items-center justify-around h-16 px-1">
          {links.map((link) => {
            const IconComp = link.icon;
            const isActive = link.path.split('/').length <= 2 ? pathname === link.path : pathname === link.path;
            const label = (link as any).shortName || link.name;
            return (
              <Link
                key={link.name}
                href={link.path}
                className={`relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute top-0 inset-x-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-b-full"
                  />
                )}
                <IconComp size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] leading-none font-semibold ${isActive ? 'font-bold' : ''}`}>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
