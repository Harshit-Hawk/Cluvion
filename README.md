# Cluvion: Student Activity Portal & Tracker

A secure, scalable web platform for colleges to track clubs, student participation, achievements, and real-time announcements. Built with **Next.js 15 (App Router)**, Tailwind CSS, Framer Motion, and Supabase.

## 🚀 Key Features

- **Role-Based Dashboards**: Securely separate interfaces for Admins, Club Heads, and Students.
- **Dynamic Activeness Score**: Students' activity is calculated automatically based on event attendance, achievements, and feed interactions.
- **Real-Time Campus Feed**: Instant announcement broadcast utilizing Supabase Realtime subscriptions and Framer Motion animated lists.
- **Analytics View**: Visual platform growth statistics rendered via Chart.js on the Admin Dashboard.
- **Strict Row Level Security (RLS)**: Enforced via PostgreSQL at the database layer to ensure data encapsulation and prevent unauthorized modifications.
- **SSR & Optimized Performance**: Leveraging Next.js for faster loads and better SEO.

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router) + Tailwind CSS + Framer Motion + Chart.js
- **Backend**: Supabase (PostgreSQL, Auth, RLS, Realtime)
- **Icons**: Lucide React
- **Hosting**: Designed for Vercel or Netlify (Next.js Runtime)

---

## 💻 Local Setup Instructions

1. **Clone the repository** and navigate to the project root.
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
   Create a `.env.local` file in the root of the project:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

---

## 🌐 Deployment

### Recommended: Vercel (Optimized for Next.js)
1. Connect your GitHub repository to [Vercel](https://vercel.com/).
2. Vercel will automatically detect Next.js settings.
3. Add your **Environment Variables** in the Vercel dashboard.
4. Deploy.

### Alternative: Netlify
1. Connect your GitHub repository to [Netlify](https://netlify.com/).
2. Netlify will use the `@netlify/plugin-nextjs` automatically.
3. **Build command**: `npm run build`
4. **Publish directory**: `.next` (handled automatically)
5. Add your **Environment Variables** in the Netlify dashboard.
