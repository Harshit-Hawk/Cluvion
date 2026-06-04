import type { User } from '@supabase/supabase-js';

// ─── User & Auth ────────────────────────────────────────────
export type UserRole = 'super_admin' | 'college_admin' | 'admin' | 'faculty' | 'club_coordinator' | 'club_head' | 'placement_officer' | 'student';

export interface UserProfile {
  role: UserRole;
  full_name: string;
  email: string;
  designation?: string;
  roll_no?: string;
  college?: string;
  avatar_url?: string;
  course?: string;
  dob?: string;
  department?: string;
  semester?: number;
  batch?: string;
  section?: string;
  phone?: string;
}

export interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  userProfile: UserProfile | null;
  updateProfile: (newData: Partial<UserProfile>) => void;
  loading: boolean;
  sessionReady: boolean;
  login: (email: string, password: string) => Promise<unknown>;
  signup: (params: SignupParams) => Promise<unknown>;
  logout: () => Promise<void>;
}

export interface SignupParams {
  email: string;
  password: string;
  fullName: string;
  rollNo: string;
  college: string;
}

// ─── Auth Cache ─────────────────────────────────────────────
export interface AuthCache {
  user: User;
  role: UserRole;
  userProfile: UserProfile;
}

// ─── Notifications ──────────────────────────────────────────
export type NotificationType = 'event' | 'achievement' | 'points' | 'announcement' | 'challenge' | 'leaderboard';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message?: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

// ─── Feed ───────────────────────────────────────────────────
export interface FeedPost {
  id: string;
  content: string;
  created_at: string;
  clubs: { name: string } | null;
  media_url?: string;
  media_type?: 'image' | 'video';
}

export interface Comment {
  id: number;
  user: string;
  text: string;
}

// ─── Dashboard Stats ────────────────────────────────────────
export interface AdminStats {
  users: number;
  clubs: number;
  events: number;
}

export interface ActivityLog {
  id: string;
  action_type: string;
  created_at: string;
  points_awarded: number;
  users: { full_name: string } | null;
}

// ─── Component Props ────────────────────────────────────────
export interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export interface LayoutProps {
  children: React.ReactNode;
}

export interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  loading: boolean;
  delay: number;
}
