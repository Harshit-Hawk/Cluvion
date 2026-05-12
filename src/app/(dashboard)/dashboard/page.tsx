'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useEffect } from 'react';

export default function DashboardRedirect() {
  const { role, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.replace('/welcome');
      return;
    }

    switch (role) {
      case 'admin':
        router.replace('/admin');
        break;
      case 'club_head':
        router.replace('/head');
        break;
      case 'student':
      default:
        router.replace('/student');
        break;
    }
  }, [role, user, loading, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );
}
