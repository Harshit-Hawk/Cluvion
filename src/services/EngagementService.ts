import { supabase } from '../lib/supabase';

export interface EngagementStats {
  totalXp: number;
  eventsAttended: number;
  achievementsEarned: number;
  reputationTier: string;
  nextTierXp: number;
  progressPercent: number;
  currentStreak: number;
}

export class EngagementService {
  /**
   * Fetches the engagement statistics for a specific user
   */
  static async getUserEngagement(userId: string): Promise<EngagementStats> {
    try {
      // 1. Fetch user total_xp
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('total_xp')
        .eq('id', userId)
        .maybeSingle();
        
      if (userError) throw userError;
      
      const totalXp = userData?.total_xp || 0;

      // 2. Fetch event participation
      const { count: eventsAttended, error: eventsError } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action_type', 'event_attended');
        
      if (eventsError) throw eventsError;

      // 3. Fetch achievements contribution
      const { count: achievementsEarned, error: achError } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action_type', 'achievement_earned');
        
      if (achError) throw achError;

      // 4. Fetch User Streak
      const { data: streakData, error: streakError } = await supabase
        .from('user_streaks')
        .select('current_streak, last_activity_date')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (streakError && streakError.code !== 'PGRST116') {
        console.warn('Error fetching streak:', streakError);
      }
      
      let currentStreak = streakData?.current_streak || 0;
      
      // Optional frontend safety: if last_activity_date is older than yesterday, streak is technically 0
      if (streakData?.last_activity_date) {
         const lastDate = new Date(streakData.last_activity_date);
         const today = new Date();
         const diffTime = Math.abs(today.getTime() - lastDate.getTime());
         const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
         if (diffDays > 1) {
            currentStreak = 0;
         }
      }

      // Calculate Reputation Tier
      const { tier, nextTierXp, progressPercent } = this.calculateReputationTier(totalXp);

      return {
        totalXp,
        eventsAttended: eventsAttended || 0,
        achievementsEarned: achievementsEarned || 0,
        reputationTier: tier,
        nextTierXp,
        progressPercent,
        currentStreak
      };

    } catch (error) {
      console.error('Error fetching engagement stats:', error);
      return {
        totalXp: 0,
        eventsAttended: 0,
        achievementsEarned: 0,
        reputationTier: 'Novice',
        nextTierXp: 100,
        progressPercent: 0,
        currentStreak: 0
      };
    }
  }

  /**
   * Abstracted logic for calculating tiers based on total XP
   */
  static calculateReputationTier(xp: number): { tier: string; nextTierXp: number; progressPercent: number } {
    const tiers = [
      { name: 'Novice', req: 0 },
      { name: 'Bronze', req: 100 },
      { name: 'Silver', req: 300 },
      { name: 'Gold', req: 600 },
      { name: 'Platinum', req: 1000 },
      { name: 'Diamond', req: 2000 },
      { name: 'Legend', req: 5000 }
    ];

    let currentTier = tiers[0];
    let nextTier = tiers[1];

    for (let i = 0; i < tiers.length; i++) {
      if (xp >= tiers[i].req) {
        currentTier = tiers[i];
        nextTier = tiers[i + 1] || { name: 'Max Level', req: tiers[i].req };
      } else {
        break;
      }
    }

    const tierRange = nextTier.req - currentTier.req;
    let progressPercent = 100;
    
    if (tierRange > 0) {
      const xpInTier = xp - currentTier.req;
      progressPercent = Math.min(100, Math.max(0, Math.round((xpInTier / tierRange) * 100)));
    }

    return { 
      tier: currentTier.name, 
      nextTierXp: nextTier.req,
      progressPercent
    };
  }

  /**
   * Fetches the global leaderboard from the Gamification View
   */
  static async getLeaderboard(limit: number = 50) {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .limit(limit);
      
    if (error) throw error;
    return data || [];
  }
}
