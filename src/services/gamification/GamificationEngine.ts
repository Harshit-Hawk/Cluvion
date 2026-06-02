import { XPService, XPTransactionResult } from './XPService';
import { LeaderboardService } from './LeaderboardService';
import { BadgeService, Badge } from './BadgeService';
import { StreakService, StreakData } from './StreakService';
import { ReputationService } from './ReputationService';
import { NotificationService } from './NotificationService';

export type ActivityEventType = 
  | 'event_participation'
  | 'club_contribution'
  | 'challenge_participation'
  | 'event_organization'
  | 'daily_login'
  | 'custom_reward'
  | 'event_attended' // legacy support
  | 'challenge_completed' // legacy support
  | 'club_participation'; // legacy support

export interface ActivityEvent {
  userId: string;
  eventType: ActivityEventType;
  referenceId?: string; // e.g., event ID, challenge ID
  metadata?: Record<string, any>;
}

export interface GamificationResult {
  success: boolean;
  xpAwarded: number;
  newTotalXp: number;
  tierInfo: {
    tier: string;
    nextTierXp: number;
    progressPercent: number;
  };
  streakUpdated?: StreakData;
  newBadgesEarned: Badge[];
  message: string;
}

export class GamificationEngine {
  /**
   * Main entry point for processing a gamified action.
   * Orchestrates XP, Streaks, Badges, and Reputation.
   */
  static async processActivityEvent(event: ActivityEvent): Promise<GamificationResult> {
    const { userId, eventType, referenceId, metadata } = event;

    // 1. Determine points (This could be mapped to a DB config, using a switch for now)
    let points = 0;
    switch (eventType) {
      case 'event_participation':
      case 'event_attended': 
        points = 50; 
        break;
      case 'challenge_participation':
      case 'challenge_completed': 
        points = 100; 
        break;
      case 'club_contribution':
      case 'club_participation': 
        points = 20; 
        break;
      case 'event_organization':
        points = 150;
        break;
      case 'daily_login': 
        points = 10; 
        break;
      case 'custom_reward': 
        points = metadata?.points || 0; 
        break;
      default: 
        points = 5;
    }

    try {
      // 2. Award XP
      const xpResult = await XPService.awardXP({
        userId,
        actionType: eventType,
        points,
        referenceId,
        metadata
      });

      if (!xpResult.success) {
        throw new Error(xpResult.message);
      }

      const totalXp = xpResult.newTotalXp || 0;

      // 3. Update Streak
      let streakUpdated;
      const streakEligibleEvents = [
        'daily_login', 
        'event_participation', 'event_attended', 
        'challenge_participation', 'challenge_completed',
        'event_organization'
      ];
      if (streakEligibleEvents.includes(eventType)) {
        const streakResult = await StreakService.updateStreak(userId);
        if (streakResult) {
            streakUpdated = streakResult;
        }
      }

      // 4. Evaluate Badges (using updated totalXp and streak info)
      const newBadgesEarned = await BadgeService.evaluateBadges(userId, {
        totalXp,
        currentStreak: streakUpdated?.currentStreak || 0
      });

      // 5. Calculate Reputation Tier
      const tierInfo = ReputationService.calculateTier(totalXp);

      // 6. Leaderboard updates
      // Invalidate the cache so the next fetch reflects the new XP globally
      LeaderboardService.invalidateCache();

      // 7. Notifications generated
      // Notify about XP earned
      await NotificationService.notify(
        userId, 
        'XP Earned!', 
        `You just earned ${points} XP for ${eventType.replace('_', ' ')}.`, 
        'xp_earned'
      );

      // Notify about newly earned Badges
      for (const badge of newBadgesEarned) {
        await NotificationService.notify(
          userId, 
          'New Badge Earned!', 
          `Congratulations! You unlocked the ${badge.name} badge.`, 
          'badge_earned'
        );
      }

      // Return comprehensive result for frontend to display animated toasts
      return {
        success: true,
        xpAwarded: points,
        newTotalXp: totalXp,
        tierInfo,
        streakUpdated: streakUpdated || undefined,
        newBadgesEarned,
        message: xpResult.message
      };

    } catch (error: any) {
      console.error('Gamification Engine Error:', error);
      return {
        success: false,
        xpAwarded: 0,
        newTotalXp: 0,
        tierInfo: { tier: 'Novice', nextTierXp: 100, progressPercent: 0 },
        newBadgesEarned: [],
        message: error.message || 'Gamification processing failed.'
      };
    }
  }
}
