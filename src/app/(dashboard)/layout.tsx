'use client';

import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import Layout from '../../components/Layout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ProtectedRoute>
          <Layout>{children}</Layout>
        </ProtectedRoute>
      </NotificationProvider>
    </AuthProvider>
  );
}
