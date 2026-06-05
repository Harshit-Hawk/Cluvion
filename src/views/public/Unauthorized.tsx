'use client';

import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

const Unauthorized = () => {
  const { logout } = useAuth();

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-4 text-center">
      <div className="max-w-md">
        <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">You don't have permission to view this page.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/welcome" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go Home</Link>
          <button onClick={async () => { await logout(); window.location.href = '/welcome'; }} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Sign Out</button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
