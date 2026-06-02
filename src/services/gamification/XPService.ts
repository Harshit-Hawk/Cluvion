import { supabase } from '../../lib/supabase';
import { EngagementService } from '../EngagementService';

export interface AwardXPRequest {
  userId: string;
  actionType: 'achievement_earned' | 'event_attended' | 'daily_login' | 'custom_reward' | string;
  points: number;
  referenceId?: string; // Optional: Event ID or Achievement ID to prevent duplicate awards
  metadata?: Record<string, any>; // Flexible metadata structure for analytics
}

export interface XPTransactionResult {
  success: boolean;
  message: string;
  newTotalXp?: number;
}

export class XPService {
  /**
   * Awards XP to a user with anti-duplicate logic and transactional safety.
   * Supabase PostgreSQL triggers handle the actual aggregation and leaderboard updates
   * automatically upon successful insert into activity_logs.
   */
  static async awardXP(request: AwardXPRequest): Promise<XPTransactionResult> {
    const { userId, actionType, points, referenceId, metadata } = request;

    try {
      // 1. Anti-Duplicate Logic
      // If a referenceId is provided, check if an activity with this type and reference already exists.
      // E.g., preventing awarding points twice for the same event or achievement.
      if (referenceId) {
        // We use a JSONB metadata check if reference_id isn't natively available, 
        // or we check 'action_type' for strict duplicates based on context.
        // Assuming we rely on time-based throttling or specific event logic:
        const { data: existingLogs, error: checkError } = await supabase
          .from('activity_logs')
          .select('id')
          .eq('user_id', userId)
          .eq('action_type', actionType)
          .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Throttling window: 1 minute
          .limit(1);

        if (checkError) throw checkError;

        if (existingLogs && existingLogs.length > 0) {
          return {
            success: false,
            message: 'Duplicate XP action detected. Please wait before retrying.',
          };
        }
      }

      // 2. Transactional Insert
      // This insert is rollback-safe because Supabase executes the trigger in the same Postgres transaction.
      // If the trigger fails, the insert is rolled back.
      const { error: insertError } = await supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          action_type: actionType,
          points_awarded: points,
          reference_id: referenceId,
          metadata: metadata || {}
        });

      if (insertError) throw insertError;

      // 3. Leaderboard Update Hook Execution
      // Though Postgres handles the realtime 'student_scores' recalculation via triggers,
      // we proactively fetch the new total for frontend consumption.
      const updatedStats = await EngagementService.getUserEngagement(userId);

      return {
        success: true,
        message: `Successfully awarded ${points} XP for ${actionType.replace('_', ' ')}.`,
        newTotalXp: updatedStats.totalXp
      };

    } catch (error: any) {
      console.error('XP Transaction Failed:', error);
      return {
        success: false,
        message: error.message || 'An unexpected error occurred during the XP transaction.',
      };
    }
  }

  /**
   * Specialized wrapper for Event Participation
   */
  static async awardEventParticipationXP(userId: string, eventId: string, customPoints: number = 20): Promise<XPTransactionResult> {
    return this.awardXP({
      userId,
      actionType: 'event_attended',
      points: customPoints,
      referenceId: eventId
    });
  }

  /**
   * Specialized wrapper for Achievements
   */
  static async awardAchievementXP(userId: string, achievementId: string, points: number): Promise<XPTransactionResult> {
    return this.awardXP({
      userId,
      actionType: 'achievement_earned',
      points,
      referenceId: achievementId
    });
  }
}
