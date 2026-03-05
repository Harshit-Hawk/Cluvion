import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './pages/Login';
import Welcome from './pages/Welcome';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';

// Lazy load large dashboard components
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = React.lazy(() => import('./pages/AdminUsers'));
const AdminClubs = React.lazy(() => import('./pages/AdminClubs'));
const AdminProfile = React.lazy(() => import('./pages/AdminProfile'));
const ClubHeadDashboard = React.lazy(() => import('./pages/ClubHeadDashboard'));
const ClubHeadMyClub = React.lazy(() => import('./pages/ClubHeadMyClub'));
const ClubHeadEvents = React.lazy(() => import('./pages/ClubHeadEvents'));
const ClubHeadAchievements = React.lazy(() => import('./pages/ClubHeadAchievements'));
const ClubHeadProfile = React.lazy(() => import('./pages/ClubHeadProfile'));
const ClubHeadHome = React.lazy(() => import('./pages/ClubHeadHome'));
const StudentDashboard = React.lazy(() => import('./pages/StudentDashboard'));
const StudentExploreClubs = React.lazy(() => import('./pages/StudentExploreClubs'));
const StudentActivity = React.lazy(() => import('./pages/StudentActivity'));
const StudentLeaderboard = React.lazy(() => import('./pages/StudentLeaderboard'));
const StudentProfile = React.lazy(() => import('./pages/StudentProfile'));
const StudentEvents = React.lazy(() => import('./pages/StudentEvents'));
const Settings = React.lazy(() => import('./pages/Settings'));

const RoleBasedRedirect = () => {
  const { role, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/welcome" replace />;
  
  switch (role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'club_head':
      return <Navigate to="/head" replace />;
    case 'student':
    default:
      return <Navigate to="/student" replace />;
  }
};

const SuspenseLoader = () => (
   <div className="flex justify-center items-center h-full w-full py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
   </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <NotificationProvider>
          <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Main redirect based on role */}
          <Route path="/dashboard" element={<RoleBasedRedirect />} />

          <Route element={<Layout />}>
            {/* Shared Authenticated Routes */}
            <Route path="/settings" element={
                 <Suspense fallback={<SuspenseLoader />}><Settings /></Suspense>
            } />

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={
                 <Suspense fallback={<SuspenseLoader />}><AdminDashboard /></Suspense>
              } />
              <Route path="/admin/users" element={
                 <Suspense fallback={<SuspenseLoader />}><AdminUsers /></Suspense>
              } />
              <Route path="/admin/clubs" element={
                 <Suspense fallback={<SuspenseLoader />}><AdminClubs /></Suspense>
              } />
              <Route path="/admin/profile" element={
                 <Suspense fallback={<SuspenseLoader />}><AdminProfile /></Suspense>
              } />
            </Route>

            {/* Club Head Routes */}
            <Route element={<ProtectedRoute allowedRoles={['club_head']} />}>
              <Route path="/head" element={
                 <Suspense fallback={<SuspenseLoader />}><ClubHeadDashboard /></Suspense>
              } />
               <Route path="/head/home" element={
                 <Suspense fallback={<SuspenseLoader />}><ClubHeadHome /></Suspense>
               } />
              <Route path="/head/club" element={
                 <Suspense fallback={<SuspenseLoader />}><ClubHeadMyClub /></Suspense>
              } />
              <Route path="/head/events" element={
                 <Suspense fallback={<SuspenseLoader />}><ClubHeadEvents /></Suspense>
              } />
              <Route path="/head/achievements" element={
                 <Suspense fallback={<SuspenseLoader />}><ClubHeadAchievements /></Suspense>
              } />
              <Route path="/head/profile" element={
                 <Suspense fallback={<SuspenseLoader />}><ClubHeadProfile /></Suspense>
              } />
            </Route>

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student" element={
                 <Suspense fallback={<SuspenseLoader />}><StudentDashboard /></Suspense>
              } />
              <Route path="/student/clubs" element={
                 <Suspense fallback={<SuspenseLoader />}><StudentExploreClubs /></Suspense>
              } />
              <Route path="/student/activity" element={
                 <Suspense fallback={<SuspenseLoader />}><StudentActivity /></Suspense>
              } />
              <Route path="/student/leaderboard" element={
                 <Suspense fallback={<SuspenseLoader />}><StudentLeaderboard /></Suspense>
              } />
              <Route path="/student/events" element={
                 <Suspense fallback={<SuspenseLoader />}><StudentEvents /></Suspense>
              } />
              <Route path="/student/profile" element={
                 <Suspense fallback={<SuspenseLoader />}><StudentProfile /></Suspense>
              } />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
