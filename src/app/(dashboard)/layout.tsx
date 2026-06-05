'use client';

import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { RealtimeProvider } from '../../context/RealtimeContext';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Layout from '../../components/layout/Layout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RealtimeProvider>
          <ProtectedRoute>
            <Layout>{children}</Layout>
          </ProtectedRoute>
        </RealtimeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
