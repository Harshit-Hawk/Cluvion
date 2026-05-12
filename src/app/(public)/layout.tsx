'use client';

import { AuthProvider } from '../../context/AuthContext';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
