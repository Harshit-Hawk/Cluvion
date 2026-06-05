'use client';

import React from 'react';
import Feed from '../../components/feed/Feed';
import UpcomingEventBanner from '../../components/events/UpcomingEventBanner';
import { 
  UpcomingEventsWidget, 
  LeaderboardWidget, 
  ProgressWidget, 
  QuickLinksWidget 
} from '../../components/RightSidebarWidgets';
import { MobileNextEventWidget, WeeklyMissionWidget } from '../../components/MobileWidgets';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <>
      {/* ── MOBILE VIEW ── */}
      <div className="flex flex-col md:hidden space-y-4">
         <ProgressWidget />
         <MobileNextEventWidget />
         <WeeklyMissionWidget />
         <Feed />
      </div>

      {/* ── DESKTOP VIEW ── */}
      <div className="hidden md:flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <UpcomingEventBanner />
          <Feed />
        </div>

        {/* Sidebar Widgets */}
        <div className="w-full lg:w-[320px] xl:w-[350px] flex-shrink-0">
          <UpcomingEventsWidget />
          <LeaderboardWidget />
          <ProgressWidget />
          <QuickLinksWidget />
        </div>
      </div>
    </>
  );
}
