# Student Activity Portal & Tracker

A secure, scalable web platform for colleges to track clubs, student participation, achievements, and real-time announcements. Built with React (Vite), Tailwind CSS, Framer Motion, and Supabase.

## Features

- **Role-Based Dashboards**: Securely separate interfaces for Admins, Club Heads, and Students.
- **Dynamic Activeness Score**: Students' activity is calculated automatically based on event attendance, achievements, and feed interactions.
- **Real-Time Campus Feed**: Instant announcement broadcast utilizing Supabase Realtime subscriptions and Framer Motion animated lists.
- **Analytics View**: Visual platform growth statistics rendered via Chart.js on the Admin Dashboard.
- **Strict Row Level Security (RLS)**: Enforced via PostgreSQL at the database layer to ensure data encapsulation and prevent unauthorized modifications.

## Technology Stack

- **Frontend**: React (Vite) + Tailwind CSS + Framer Motion + Chart.js
- **Backend**: Supabase (PostgreSQL, Auth, RLS, Realtime)
- **Icons**: Lucide React
- **Hosting**: Designed for Netlify (Frontend) & Supabase Cloud (Backend)

---

## Local Setup Instructions

1. **Clone the repository** (if applicable) and navigate to the project root.
2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Supabase Database Setup**:
   - Create a new project on [Supabase.com](https://supabase.com/).
   - Go to your Supabase SQL Editor and execute the exact SQL found in `supabase/schema.sql` first.
   - Run the RLS policies found in `supabase/rls.sql`.
   - (Optional) Insert dummy data using `supabase/queries.sql`.

4. **Environment Variables**:
   Create a `.env` file in the root of the project:

   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. **Run the Development Server**:
   ```bash
   npm run dev
   ```

---

## Deployment to Netlify

This project uses Vite, making it extremely easy to deploy to Netlify.

1. Create a `_redirects` file in the `public/` directory (already configured automatically if using standard continuous deployment, but if refreshing fails, put this in `public/_redirects`):

   ```
   /* /index.html 200
   ```

2. Connect your GitHub repository to Netlify via their web dashboard.
3. Configure the Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Add your **Environment Variables** (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) in the Netlify dashboard under Site Settings > Environment variables.
5. Deploy the site.
