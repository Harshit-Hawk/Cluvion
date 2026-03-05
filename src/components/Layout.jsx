import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Home, Users, CheckSquare, Settings, Menu, Award, Activity, Trophy, Calendar, Bell, Star, Sun, Moon, LayoutDashboard, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TYPE_COLORS = {
  event:        { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', icon: Calendar },
  achievement:  { bg: 'bg-amber-50 dark:bg-amber-900/30',     text: 'text-amber-600 dark:text-amber-400',     icon: Award },
  points:       { bg: 'bg-blue-50 dark:bg-blue-900/30',       text: 'text-blue-600 dark:text-blue-400',       icon: Activity },
  announcement: { bg: 'bg-indigo-50 dark:bg-indigo-900/30',   text: 'text-indigo-600 dark:text-indigo-400',   icon: Star },
};

const Layout = () => {
  const { role, user, userProfile, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const notifRef = useRef(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navLinks = {
    admin: [
      { name: 'Overview', path: '/admin', icon: Home },
      { name: 'Manage Users', path: '/admin/users', icon: Users },
      { name: 'All Clubs', path: '/admin/clubs', icon: Activity },
    ],
    club_head: [
      { name: 'Dashboard', path: '/head', icon: LayoutDashboard, section: 'Dashboard' },
      { name: 'Home', path: '/head/home', icon: Home, section: 'Main' },
      { name: 'My Club', path: '/head/club', icon: Users, section: 'Main' },
      { name: 'Events', path: '/head/events', icon: CheckSquare, section: 'Main' },
      { name: 'Achievements', path: '/head/achievements', icon: Award, section: 'Main' },
    ],
    student: [
      { name: 'Home', path: '/student', icon: Home },
      { name: 'Events', path: '/student/events', icon: Calendar },
      { name: 'Leaderboard', path: '/student/leaderboard', icon: Trophy },
      { name: 'Discover Clubs', path: '/student/clubs', icon: Users },
      { name: 'My Activity', path: '/student/activity', icon: Activity },
    ],
  };

  const links = navLinks[role] || navLinks.student;
  const profilePath = role === 'admin' ? '/admin/profile' : role === 'club_head' ? '/head/profile' : '/student/profile';
  const homePath = role === 'admin' ? '/admin' : role === 'club_head' ? '/head' : '/student';
  const avatarLinkTarget = location.pathname === profilePath ? homePath : profilePath;

  const handleNotifClick = (notif) => {
    markAsRead(notif.id);
    if (notif.link) navigate(notif.link);
    setNotificationsOpen(false);
  };

  const NotificationDropdown = ({ className }) => (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 ${className}`}
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-gray-100">Notifications</h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-md">
              {unreadCount} New
            </span>
          )}
          {unreadCount > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); markAllRead(); }}
              className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck size={13} />
              All read
            </button>
          )}
        </div>
      </div>

      <div className="space-y-0 max-h-[60vh] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10 px-4">No notifications yet.</p>
        ) : (
          notifications.slice(0, 20).map((notif) => {
            const scheme = TYPE_COLORS[notif.type] || TYPE_COLORS.announcement;
            const Icon = scheme.icon;
            return (
              <button
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className={`w-full flex gap-3 items-start p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60 ${notif.is_read ? 'opacity-55' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${scheme.bg} ${scheme.text}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">{notif.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mt-0.5">{notif.body}</p>
                </div>
                {!notif.is_read && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2 flex-shrink-0" />
                )}
              </button>
            );
          })
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden text-gray-900 dark:text-gray-100">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={true} />

      {/* Mobile Sticky Header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 h-16">
        {/* Left: Profile Avatar */}
        <NavLink
          to={avatarLinkTarget}
          className="w-[36px] h-[36px] flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 font-bold border border-emerald-200/60 shadow-sm active:scale-95 transition-transform overflow-hidden"
        >
          {userProfile?.avatar_url ? (
            <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            userProfile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'
          )}
        </NavLink>

        {/* Center: Text Logo */}
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500">
          Cluvion
        </h2>

        {/* Right: Bell + Settings */}
        <div className="flex items-center gap-1">
          {/* Bell with dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen((v) => !v)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 border border-white dark:border-gray-950">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Mobile Notifications Dropdown */}
            <AnimatePresence>
              {notificationsOpen && (
                <NotificationDropdown className="fixed top-[4.5rem] inset-x-3" />
              )}
            </AnimatePresence>
          </div>

          {/* Settings */}
          <NavLink
            to="/settings"
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center"
          >
            <Settings size={20} />
          </NavLink>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full">
        <motion.div
          initial={{ x: -250 }}
          animate={{ x: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className={`relative z-40 bg-white dark:bg-gray-900 h-full border-r border-gray-200 dark:border-gray-800 flex flex-col pt-0 transition-all duration-500 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}
        >
          {/* Sidebar Header */}
          <NavLink
            to={role === 'admin' ? '/admin/profile' : role === 'club_head' ? '/head/profile' : '/student/profile'}
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
          </NavLink>

          <nav className={`flex-1 overflow-y-auto py-4 ${isCollapsed ? 'px-3 space-y-1' : 'px-4'}`}>
            {(() => {
              const sections = [];
              let currentSection = null;
              links.forEach((link) => {
                const sec = link.section || 'Main';
                if (sec !== currentSection) {
                  sections.push({ type: 'label', name: sec, key: 'sec-' + sec });
                  currentSection = sec;
                }
                sections.push({ type: 'link', link, key: link.name });
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
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    end={link.path.split('/').length <= 2}
                    onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center rounded-lg transition-colors font-medium text-sm ${
                        isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                      }`
                    }
                    title={isCollapsed ? link.name : ''}
                  >
                    <Icon size={isCollapsed ? 22 : 18} className={isCollapsed ? 'mx-auto' : ''} />
                    {!isCollapsed && <span>{link.name}</span>}
                  </NavLink>
                  );
                });
              })()}
          </nav>

          {/* Sidebar Footer: bell + settings */}
          <div className={`border-t border-gray-100 dark:border-gray-800 flex flex-col gap-1 ${isCollapsed ? 'p-3' : 'p-4'}`}>
            {/* Bell with dropdown for desktop */}
            <div className="relative" ref={isCollapsed ? undefined : notifRef}>
              <button
                onClick={() => setNotificationsOpen((v) => !v)}
                className={`w-full flex items-center text-sm font-medium transition-colors rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 relative ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'}`}
                title={isCollapsed ? 'Notifications' : ''}
              >
                <Bell size={isCollapsed ? 22 : 18} className={isCollapsed ? 'mx-auto' : ''} />
                {!isCollapsed && <span>Notifications</span>}
                {unreadCount > 0 && (
                  <span className={`${isCollapsed ? 'absolute top-1.5 right-1.5 w-2 h-2' : 'ml-auto text-[10px] min-w-[18px] h-[18px] px-1'} bg-red-500 text-white font-bold rounded-full flex items-center justify-center border border-white dark:border-gray-900`}>
                    {isCollapsed ? '' : (unreadCount > 9 ? '9+' : unreadCount)}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <NotificationDropdown className="absolute bottom-full mb-2 left-0 w-80" />
                )}
              </AnimatePresence>
            </div>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `w-full flex items-center text-sm font-medium transition-colors rounded-lg ${
                  isActive ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                } ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'}`
              }
              title={isCollapsed ? 'Settings' : ''}
            >
              <Settings size={isCollapsed ? 22 : 18} className={isCollapsed ? 'mx-auto' : ''} />
              {!isCollapsed && <span>Settings</span>}
            </NavLink>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto w-full pb-20 md:pb-0">
        <div className="p-6 md:p-8 pt-20 md:pt-8 w-full max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe">
        <nav className="flex items-center justify-around h-16 px-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path.split('/').length <= 2}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                  }`
                }
              >
                <Icon size={24} strokeWidth={2.5} />
                <span className="text-[10px] font-medium leading-none">{link.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
