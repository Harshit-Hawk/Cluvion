'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { AuthContextValue, AuthCache, UserProfile, UserRole, SignupParams } from '../types';

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  userProfile: null,
  updateProfile: () => {},
  loading: true,
  sessionReady: false,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

export const useAuth = (): AuthContextValue => useContext(AuthContext);

const CACHE_KEY = 'cluvion_auth_cache';

const readCache = (): AuthCache | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as AuthCache) : null;
  } catch { return null; }
};

const writeCache = (data: AuthCache): void => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
};

const clearCache = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem('demoUser');
    localStorage.removeItem('cluvion_user');
    localStorage.removeItem('college_domain');
  } catch {}
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Start with loading=true on BOTH server and client to avoid hydration mismatch.
  // Cache is applied in useEffect (client-only) to restore user instantly after hydration.
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    // Restore cached auth state immediately (client-only, post-hydration)
    const cache = readCache();
    if (cache?.user) {
      setUser(cache.user);
      setRole(cache.role);
      setUserProfile(cache.userProfile);
      setLoading(false);
    }

    const clearUser = () => {
      clearCache();
      if (!mounted.current) return;
      setUser(null);
      setRole(null);
      setUserProfile(null);
      setLoading(false);
      setSessionReady(true);
    };

    const fetchAndApply = async (supaUser: User) => {
      if (!supaUser || !mounted.current) return;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role, full_name, email, designation, roll_no, college, avatar_url, course, dob')
          .eq('id', supaUser.id)
          .single();
        if (!mounted.current) return;
        if (error) throw error;
        const resolvedRole = (data?.role as UserRole) || 'student';
        const resolved: AuthCache = { user: supaUser, role: resolvedRole, userProfile: data as UserProfile };
        setUser(supaUser);
        setRole(resolvedRole);
        setUserProfile(data as UserProfile);
        writeCache(resolved);
      } catch (err) {
        console.error('Error fetching user profile/role:', err);
        // On DB error, keep the cached values rather than wiping — user stays logged in
        if (!role && mounted.current) setRole('student');
      } finally {
        if (mounted.current) {
          setLoading(false);
          setSessionReady(true);
        }
      }
    };

    // Strategy: use onAuthStateChange as the SINGLE source of truth.
    // It fires synchronously in most cases — INITIAL_SESSION on page load/tab reopen,
    // SIGNED_IN on login, SIGNED_OUT on logout, TOKEN_REFRESHED on background refresh.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted.current) return;

        if (session?.user) {
          // Session is valid — restore or refresh user data
          setUser(session.user);
          if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
            // Full profile fetch needed
            await fetchAndApply(session.user);
          } else {
            // TOKEN_REFRESHED etc — session still valid, just update user token silently
            // Update cache with fresh token without re-fetching profile from DB
            if (role && userProfile) {
              writeCache({ user: session.user, role, userProfile });
            }
            if (mounted.current) {
              setLoading(false);
              setSessionReady(true);
            }
          }
        } else {
          // No session — covers INITIAL_SESSION with expired/missing token AND SIGNED_OUT
          clearUser();
        }
      }
    );

    return () => {
      mounted.current = false;
      subscription?.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signup = async ({ email, password, fullName, rollNo, college }: SignupParams) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, roll_no: rollNo, college } },
    });
    if (error) throw error;
    return data;
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      clearCache();
      setUser(null);
      setRole(null);
      setUserProfile(null);
      setSessionReady(true);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const updateProfile = (newData: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...newData } as UserProfile;
      if (user && role) {
        writeCache({ user, role, userProfile: updated });
      }
      return updated;
    });
  };

  const value: AuthContextValue = { user, role, userProfile, updateProfile, loading, sessionReady, login, signup, logout };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 font-medium animate-pulse">Loading Cluvion…</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};
