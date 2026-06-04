# Cluvion - Phase 2B Specifications & Features

## 📌 Current Version Overview
**Version:** 2.0.0 (Premium UI/UX Update)
**Status:** Beta / Development

Cluvion has evolved into a fully responsive, premium student engagement platform. The current version introduces a state-of-the-art UI/UX that works seamlessly across desktop and mobile devices, bringing campus life, social networking, and gamification into a single, cohesive dashboard.

---

## ✨ Core Features

### 1. Unified Dashboard (Home)
- **Responsive Layout:** A two-column grid on desktop that gracefully stacks on mobile devices.
- **Greeting & Search:** Contextual greeting based on the time of day with a global search bar (`⌘K` accessible).
- **Gamification Progress:** Real-time XP tracking, current level display (e.g., "Level 4 • Rising Star"), and visual progress bars.
- **Weekly Missions:** Interactive checklists (e.g., "Attend 2 Events", "Join 1 Club") to drive student engagement.
- **Next Event Card:** Highlighted upcoming events (e.g., Hackathons) with countdown timers (e.g., "🔥 2 days left").

### 2. Events System
- **Categorized Discovery:** Tabs for Upcoming, My Events, and Past, supplemented by pill-filters (Tech, Cultural, Sports, Workshops).
- **Event Detail Pages:** Dedicated deep-linkable event pages featuring:
  - Hero image overlays with transparent gradients.
  - Date, time, and location tracking.
  - Attendee avatars and counts.
  - Perks carousel (Cash Prizes, Certificates, Goodies).
  - Sticky "Register Now" call-to-action on mobile.

### 3. Campus Feed
- **Social Timeline:** A continuous feed of campus activity, announcements, and gamification milestones.
- **Tabbed Navigation:** Filter the feed by All, Clubs, Events, and Announcements.
- **Rich Post Cards:** Posts support user avatars, club badges, timestamps, multimedia (images/video), and engagement metrics (Likes, Comments, Reposts, Bookmarks).

### 4. Clubs & Communities
- **Discovery Engine:** Segmented views for "Discover" and "My Clubs".
- **Smart Recommendations:** "Recommended for you" and "Popular Clubs" sections.
- **1-Click Join:** Seamless club registration with instant UI feedback updating member status.

### 5. Profile & Digital ID
- **Student Profile:** A centralized hub showing the user's avatar, course details, and overall statistics (Events Joined, Clubs Joined, Badges Earned).
- **Achievements:** Visual gallery of unlocked badges (e.g., Event Explorer, Early Bird, Streak Master).
- **Digital ID Card:** A built-in modal displaying a generated QR Code linked to the user's ID for fast event check-ins and attendance tracking.

### 6. Advanced Navigation
- **Desktop Sidebar:** Expandable/collapsible sidebar with active states, notification badges, and a quick "Invite Friends" promo.
- **Mobile Bottom Navigation:** A custom mobile app-like tab bar featuring a floating action button (FAB) for quick post/event creation.

---

## 🛠️ Technical Specifications

### 1. Technology Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (with arbitrary value support and complex gradient implementations)
- **Icons:** Lucide React
- **Animations:** Framer Motion (page transitions, micro-interactions)
- **Backend/Database:** Supabase (PostgreSQL, Realtime subscriptions, Auth)
- **Utilities:** date-fns (date formatting), react-qr-code (Digital ID generation), react-toastify (notifications)

### 2. Architecture & Design System
- **Responsive Breakpoints:** Mobile-first approach using standard Tailwind breakpoints (`md:`, `lg:`). Mobile layouts are explicitly designed to differ from desktop layouts (e.g., Bottom Nav vs. Sidebar).
- **Component Modularity:** UI is broken down into reusable widgets (`ProgressWidget`, `MobileNextEventWidget`, `UpcomingEventBanner`).
- **Dark Mode Compatibility:** All components utilize `dark:` variants to support seamless system-wide dark mode toggling.
- **Realtime Integration:** Feed and activity logs utilize Supabase's Realtime APIs to push live updates to the client without polling.

### 3. Database Schema Highlights
- **users:** `id`, `full_name`, `avatar_url`, `roll_no`, `course`, `total_points`, `level`.
- **events:** `id`, `title`, `description`, `event_date`, `location`, `club_id`.
- **event_attendees:** Junction table tracking user registration and physical attendance.
- **clubs / club_members:** Tracks organizations and student affiliations.
- **activity_logs:** Gamification ledger tracking all points-awarding actions (`event_attended`, `badge_unlocked`).
