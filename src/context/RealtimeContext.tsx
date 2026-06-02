'use client';

/**
 * Centralized Realtime Provider
 *
 * Strategy: ONE channel per logical event type, shared app-wide.
 * Components subscribe via callbacks instead of each creating their own channel.
 * This prevents duplicate Postgres listeners, reduces Supabase connection overhead,
 * and centralizes cleanup.
 *
 * Usage:
 *   const { subscribeToActivityLogs, subscribeToLeaderboard } = useRealtimeContext();
 *   useEffect(() => {
 *     const unsub = subscribeToActivityLogs((payload) => ...);
 *     return unsub;
 *   }, []);
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

type Listener<T = any> = (payload: T) => void;

interface RealtimeContextValue {
  subscribeToActivityLogs: (cb: Listener) => () => void;
  subscribeToLeaderboard: (cb: Listener) => () => void;
  subscribeToEventRegistrations: (cb: Listener) => () => void;
  subscribeToFeedPosts: (cb: Listener) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  subscribeToActivityLogs: () => () => {},
  subscribeToLeaderboard: () => () => {},
  subscribeToEventRegistrations: () => () => {},
  subscribeToFeedPosts: () => () => {},
});

export const useRealtimeContext = () => useContext(RealtimeContext);

// Lightweight multi-listener registry
function createListenerSet<T>() {
  const listeners = new Set<Listener<T>>();
  const subscribe = (cb: Listener<T>) => {
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  };
  const emit = (payload: T) => { listeners.forEach(cb => cb(payload)); };
  return { subscribe, emit, size: () => listeners.size };
}

export const RealtimeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  // Listener registries
  const activityListeners = useRef(createListenerSet());
  const leaderboardListeners = useRef(createListenerSet());
  const eventRegListeners = useRef(createListenerSet());
  const feedPostListeners = useRef(createListenerSet());

  useEffect(() => {
    if (!user) return;

    // Single shared channel for all global realtime events
    const channel = supabase
      .channel('cluvion_global_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' },
        (payload) => activityListeners.current.emit(payload))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' },
        (payload) => leaderboardListeners.current.emit(payload))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_registrations' },
        (payload) => eventRegListeners.current.emit(payload))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed_posts' },
        (payload) => feedPostListeners.current.emit(payload))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const value: RealtimeContextValue = {
    subscribeToActivityLogs: (cb) => activityListeners.current.subscribe(cb),
    subscribeToLeaderboard: (cb) => leaderboardListeners.current.subscribe(cb),
    subscribeToEventRegistrations: (cb) => eventRegListeners.current.subscribe(cb),
    subscribeToFeedPosts: (cb) => feedPostListeners.current.subscribe(cb),
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};
