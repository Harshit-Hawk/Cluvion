import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

const CACHE_KEY = 'cluvion_auth_cache';

const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const writeCache = (data) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
};

const clearCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem('demoUser');
    localStorage.removeItem('cluvion_user');
    localStorage.removeItem('college_domain');
  } catch {}
};

export const AuthProvider = ({ children }) => {
  // Seed state from localStorage cache for instant render
  const cache = readCache();
  const [user, setUser] = useState(cache?.user ?? null);
  const [role, setRole] = useState(cache?.role ?? null);
  const [userProfile, setUserProfile] = useState(cache?.userProfile ?? null);
  // loading = true only on a cold start (no cache). With cache we show app immediately.
  const [loading, setLoading] = useState(!cache);
  // sessionReady: flips to true once Supabase has told us the real session state.
  // We use this to prevent ProtectedRoute from redirecting during the brief validation window.
  const [sessionReady, setSessionReady] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const clearUser = () => {
      clearCache();
      if (!mounted.current) return;
      setUser(null);
      setRole(null);
      setUserProfile(null);
      setLoading(false);
      setSessionReady(true);
    };

    const fetchAndApply = async (supaUser) => {
      if (!supaUser || !mounted.current) return;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role, full_name, email, designation, roll_no, college, avatar_url, course, dob')
          .eq('id', supaUser.id)
          .single();
        if (!mounted.current) return;
        if (error) throw error;
        const resolved = { user: supaUser, role: data?.role || 'student', userProfile: data };
        setUser(supaUser);
        setRole(resolved.role);
        setUserProfile(data);
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
            writeCache({ user: session.user, role, userProfile });
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

  const signup = async ({ email, password, fullName, rollNo, college }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, roll_no: rollNo, college } },
    });
    if (error) throw error;
    return data;
  };

  const login = async (email, password) => {
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

  const updateProfile = (newData) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...newData };
      writeCache({ user, role, userProfile: updated });
      return updated;
    });
  };

  const value = { user, role, userProfile, updateProfile, loading, sessionReady, login, signup, logout };

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
