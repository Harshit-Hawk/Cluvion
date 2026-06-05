'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import type { ProtectedRouteProps } from '../../types';

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { user, role, loading, sessionReady } = useAuth();
  const router = useRouter();

  // Show spinner while: (a) cold-start loading OR (b) session not yet confirmed by Supabase
  if (loading || !sessionReady) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium animate-pulse">Loading Cluvion…</p>
        </div>
      </div>
    );
  }

  // Session confirmed — no user means redirect to login
  if (!user) {
    if (typeof window !== 'undefined') {
      router.replace('/welcome');
    }
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(role!)) {
    if (typeof window !== 'undefined') {
      router.replace('/unauthorized');
    }
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
