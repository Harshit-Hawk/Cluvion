'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import type { Notification, NotificationContextValue, NotificationType } from '../types';

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  markAsRead: async () => {},
  markAllRead: async () => {},
  deleteNotification: async () => {},
  clearAll: async () => {},
});

export const useNotifications = (): NotificationContextValue => useContext(NotificationContext);

const TYPE_ICONS: Record<NotificationType, string> = {
  event:        '📅',
  achievement:  '🏆',
  points:       '⭐',
  announcement: '📢',
  challenge:    '🎯',
  leaderboard:  '📈',
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch existing notifications for the logged-in user
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setNotifications((data as Notification[]) || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Subscribe to realtime inserts for this user
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    fetchNotifications();

    const channel = supabase
      .channel(`notifications_user_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notif = payload.new as Notification;
          setNotifications((prev) => [notif, ...prev]);
          // Show a toast for the incoming notification
          const icon = TYPE_ICONS[notif.type] || '🔔';
          toast.info(`${icon} ${notif.title}`, {
            autoClose: 4000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Sync read status from DB
          setNotifications((prev) =>
            prev.map((n) => (n.id === (payload.new as Notification).id ? { ...n, ...(payload.new as Notification) } : n))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user!.id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, [user]);

  const markAllRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (!unreadIds.length) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds)
        .eq('user_id', user!.id);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      // Revert on failure
      fetchNotifications();
    }
  }, [notifications, user, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const deleteNotification = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await supabase.from('notifications').delete().eq('id', id).eq('user_id', user!.id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, [user]);

  const clearAll = useCallback(async () => {
    if (!notifications.length) return;
    setNotifications([]);
    try {
      await supabase.from('notifications').delete().eq('user_id', user!.id);
    } catch (err) {
      console.error('Failed to clear all notifications:', err);
      fetchNotifications();
    }
  }, [notifications, user, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{ 
        notifications, 
        unreadCount, 
        loading, 
        markAsRead, 
        markAllRead,
        deleteNotification,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
