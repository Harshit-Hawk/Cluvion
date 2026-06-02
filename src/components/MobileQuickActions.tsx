'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Megaphone, QrCode, CheckSquare, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function MobileQuickActions() {
  const { role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Define actions based on role
  const getActions = () => {
    if (role === 'admin') {
      return [
        { label: 'Broadcast', icon: Megaphone, href: '/admin/announcements', color: 'bg-indigo-500' },
        { label: 'Event', icon: Calendar, href: '/admin/moderation', color: 'bg-emerald-500' },
        { label: 'Users', icon: CheckSquare, href: '/admin/users', color: 'bg-blue-500' }
      ];
    } else if (role === 'club_head') {
      return [
        { label: 'Scan QR', icon: QrCode, href: '/head/scan', color: 'bg-blue-500' },
        { label: 'Create Event', icon: Calendar, href: '/head/events/new', color: 'bg-emerald-500' },
        { label: 'Broadcast', icon: Megaphone, href: '/head/announcements', color: 'bg-indigo-500' },
      ];
    }
    // Default student actions
    return [
      { label: 'Scan QR', icon: QrCode, href: '/student/scan', color: 'bg-blue-500' },
      { label: 'Feed', icon: Megaphone, href: '/student/activity', color: 'bg-purple-500' }
    ];
  };

  const actions = getActions();

  return (
    <div className="md:hidden fixed bottom-20 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="flex flex-col gap-3 mb-4 items-end"
          >
            {actions.map((action, idx) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  href={action.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 group"
                >
                  <span className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-md text-sm font-bold text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700">
                    {action.label}
                  </span>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${action.color}`}>
                    <action.icon size={20} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-500/30 transition-colors ${
          isOpen ? 'bg-gray-800 dark:bg-gray-700' : 'bg-blue-600'
        }`}
      >
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }}>
          <Plus size={24} strokeWidth={2.5} />
        </motion.div>
      </motion.button>
    </div>
  );
}
