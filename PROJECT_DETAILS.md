# Cluvion: The Campus Operating System

Cluvion is a premium, all-in-one engagement and management platform designed to revitalize campus life. It transforms student participation into a gamified journey, integrating club management, event tracking, and reputation building into a single, high-performance ecosystem.

---

## 🚀 Technical Stack

*   **Frontend**: Next.js (16.2+), React 18, TypeScript 6.
*   **Styling**: Tailwind CSS 4 with custom glassmorphic design system.
*   **Animations**: Framer Motion 12 (Premium transitions & micro-interactions).
*   **Backend/DB**: Supabase (PostgreSQL, Auth, Real-time Engine, Edge Functions).
*   **Icons**: Lucide React.
*   **Utilities**: Date-fns (time-handling), React-Toastify (notifications).
*   **QR System**: `html5-qrcode` (Scanning), `react-qr-code` (Generation).

---

## 🏗️ Project Architecture

The project follows a modular, service-oriented architecture to ensure scalability and maintainability.

### 1. File Structure
*   `src/app`: Next.js App Router entry points and layout.
*   `src/views`: Core page components (StudentDashboard, Leaderboard, Admin modules).
*   `src/components`: Reusable UI elements (Feed, Layout, Widgets).
*   `src/services`: Business logic layer (XPService, EngagementService, LeaderboardService).
*   `src/context`: Global state management (AuthContext, NotificationContext).
*   `src/lib`: Third-party configurations (Supabase client).
*   `supabase/migrations`: Database schema, triggers, and RPC definitions.

---

## 🎮 Gamification Engine (Core)

The "Prestige Engine" is the heartbeat of Cluvion, driving student engagement through data.

### 1. XP & Transaction System (`XPService`)
*   **Atomic Updates**: Every action (event attendance, badge unlock) is logged in `activity_logs`.
*   **Anti-Duplicate**: Prevents double-awarding of XP for the same event or achievement using reference IDs.
*   **Supabase Triggers**: Database-level triggers automatically update the user's `total_xp` and refresh leaderboard snapshots on every transaction.

### 2. Reputation Tiers (`EngagementService`)
*   **Tier Progression**: Automatically calculates user rank based on XP thresholds:
    *   `Novice` (0+) -> `Bronze` (100+) -> `Silver` (300+) -> `Gold` (600+) -> `Platinum` (1000+) -> `Diamond` (2000+) -> `Legend` (5000+).
*   **Dynamic UI**: Progression bars on the dashboard show exact XP needed for the next tier.

### 3. Participation Streaks
*   **Logic**: Monitors consecutive daily activity.
*   **Anti-Abuse**: Restricts streak increments to once per 24-hour window per user.
*   **Streak Resets**: Automated triggers reset streaks to 0 if a gap of >24h is detected between activities.

### 4. Dynamic Leaderboards (`LeaderboardService`)
*   **Multi-Dimensional**: Supports filtering by:
    *   **Timeframe**: All-time, Weekly, Monthly.
    *   **Scope**: Global, Department-specific, Club-specific.
*   **Performance**: Uses optimized Postgres RPCs (`get_dynamic_leaderboard`) to aggregate rankings without performance lag.

---

## 🛠️ Key Modules

### 1. Attendance & Identity
*   **QR Identity**: Every student has a unique, secure QR code.
*   **QR Scanner**: Club Heads use an integrated scanner to verify attendance at events instantly.
*   **Auto-Reward**: Successful QR scans trigger the `XPService` to award participation points immediately.

### 2. Unified Activity Feed
*   **Social + System**: Blends standard club posts with gamification events (XP gains, badge unlocks).
*   **Real-time Subscriptions**: Uses Supabase Real-time to inject new events into the feed without page refreshes.
*   **Premium Visuals**: Custom `GamificationPost` cards with context-aware icons (Trophies, Awards, Zaps).

### 3. Role-Based Access Control (RBAC)
*   **Student**: Personal dashboard, event discovery, leaderboard, and profile.
*   **Club Head**: Management tools for club events, member sync, and attendance scanning.
*   **Admin**: Institution-wide analytics, user moderation, and configuration.

### 4. Notification Center
*   **Instant Feedback**: Real-time alerts when a user:
    *   Gains XP.
    *   Unlocks a new Badge.
    *   Rises on the Leaderboard.
    *   Receives a club announcement.

---

## 🗄️ Database Schema Summary

*   `users`: Core profile, role, and `total_xp`.
*   `clubs`: Club metadata and head associations.
*   `events`: Schedule, location, and RSVP data.
*   `activity_logs`: Every engagement transaction (The source of truth).
*   `user_badges`: Junction table for unlocked achievements.
*   `user_streaks`: Persistent storage for current/longest participation streaks.
*   `feed_posts`: Social content and system-generated engagement posts.

---

## 🎨 UI/UX Philosophy

*   **Glassmorphism**: High-blur backdrops, subtle borders, and depth-based layering.
*   **Tactile Feedback**: Every button and card uses Framer Motion for hover scales and tap responses.
*   **Visual Hierarchy**: Information is grouped into "Bento Cards" for readability on high-density dashboards.
