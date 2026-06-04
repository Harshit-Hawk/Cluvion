# Cluvion: The Campus Operating System

Cluvion is NOT a traditional ERP. It is a modern Campus Operating System that unifies Student Management, Attendance, Events, Clubs, Certificates, Placements, Campus Social Networking, and Gamification into one intelligent platform. The goal is to replace multiple disconnected college systems with one seamless, beautifully designed SaaS platform.

---

## 🎯 PRODUCT VISION

**For Students:** Join events/clubs, track attendance, earn badges, build campus profiles, access certificates, and apply for placements.
**For Faculty:** Manage attendance, create events, publish announcements, manage academic activities, and generate reports.
**For Club Coordinators:** Manage members, track participation, organize events, and generate certificates.
**For Administration:** Manage departments, monitor attendance, track student engagement, generate ERP reports, and manage placements.

**User Roles (RBAC):**
1. Super Admin
2. College Admin
3. Faculty
4. Club Coordinator
5. Placement Officer
6. Student

---

## 📦 SYSTEM MODULES

### Module 1: Student Management ERP
- Registration, Profiles, Roll Numbers, Course/Dept/Semester/Section Management.
- **Profile Data:** Name, Roll No, Dept, Semester, Batch, Email, Phone, Picture, Attendance %, Events/Clubs Joined, Certificates, Achievements.

### Module 2: Attendance ERP
- **Support:** QR Attendance, Manual, Excel Import, Bulk Upload.
- **Features:** Daily, Event, Club Attendance, Reports, Analytics.

### Module 3: Events ERP
- **Features:** Create/Register, Categories, Analytics, QR Check-in, Certificate Distribution.
- **Lifecycle:** Draft → Published → Registration Open → Live → Completed.

### Module 4: Club Management ERP
- **Features:** Club Profiles, Membership Requests, Club Attendance, Events, Budget Tracking, Announcements.

### Module 5: Campus Feed
- **Features:** Posts, Images, Videos, Announcements, Club/Event Updates.
- **Categories:** All, Clubs, Events, Announcements.

### Module 6: Gamification Engine
- **XP System:** Points for Events, Clubs, Attendance, Volunteering, Achievements.
- **Features:** Levels, Badges, Streaks, Leaderboards, Weekly Missions.

### Module 7: Certificate Management
- **Workflow:** Event Completed → Attendance Verified → Eligibility Checked → Certificate Generated → PDF Issued.
- **Features:** PDF Generation, QR Verification, Download/Share.

### Module 8: Digital ID Card
- **Features:** Dynamic QR Code, Verification, Event Check-In, Attendance Tracking.

### Module 9: Placement ERP
- **Features:** Company Management, Job Drives, Applications, Resume Uploads, Interview Scheduling, Offer Management.

### Module 10: Faculty Portal
- **Features:** Attendance Management, Event Creation, Student Reports, Announcements, Academic Analytics.

### Module 11: Admin ERP
- **Dashboard:** Active Students, Attendance %, Active Clubs, Events, Certificates Issued, Placement Rate.
- **Reports:** Attendance, Events, Clubs, Placements.

---

## 🛠️ TECH STACK
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, Framer Motion, ShadCN UI
- **Backend:** Supabase (PostgreSQL, Row Level Security, Auth, Storage, Realtime)
- **Deployment:** Vercel

---

## 🎨 UI/UX RULES
- **Do NOT** create a generic ERP (avoid outdated admin panels, Bootstrap looks, excessive tables).
- **Use:** Modern startup aesthetics, Mobile-first design, Discord-like community feel, Linear-inspired simplicity, Duolingo-inspired gamification.
- **Homepage Goal:** Answer "What is happening?", "What should I do next?", and "What reward can I earn?"
