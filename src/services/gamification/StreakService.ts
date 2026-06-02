import { supabase } from '../../lib/supabase';

export interface StreakData {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

export class StreakService {
  /**
   * Evaluates and updates a user's streak based on a new activity.
   */
  static async updateStreak(userId: string): Promise<StreakData | null> {
    try {
      // In a real scenario, you would have a Postgres RPC to update streaks transactionally.
      // E.g., await supabase.rpc('update_user_streak', { p_user_id: userId });
      // We simulate fetching the updated state here.
      
      const { data: streakData, error: fetchError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!streakData) {
         // Create initial streak
         return {
           userId,
           currentStreak: 1,
           longestStreak: 1,
           lastActivityDate: new Date().toISOString()
         };
      }

      return {
        userId: streakData.user_id,
        currentStreak: streakData.current_streak,
        longestStreak: streakData.longest_streak,
        lastActivityDate: streakData.last_activity_date
      };
    } catch (error) {
      console.error('Failed to update streak:', error);
      return null;
    }
  }

  /**
   * Fetches the current streak for a user.
   */
  static async getStreak(userId: string): Promise<StreakData | null> {
    try {
      const { data: streakData, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      if (!streakData) return null;

      // Check if streak is broken
      let currentStreak = streakData.current_streak;
      if (streakData.last_activity_date) {
         const lastDate = new Date(streakData.last_activity_date);
         const today = new Date();
         const diffTime = Math.abs(today.getTime() - lastDate.getTime());
         const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
         if (diffDays > 1) {
            currentStreak = 0;
         }
      }

      return {
        userId: streakData.user_id,
        currentStreak,
        longestStreak: streakData.longest_streak,
        lastActivityDate: streakData.last_activity_date
      };
    } catch (error) {
      console.error('Failed to fetch streak:', error);
      return null;
    }
  }
}
