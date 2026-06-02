import { supabase } from '../../lib/supabase';

// ─── Rarity System ──────────────────────────────────────────
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type BadgeCategory = 'academic' | 'social' | 'leadership' | 'event' | 'streak' | 'special';

export const RARITY_CONFIG: Record<BadgeRarity, {
  label: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  glowColor: string;
  textColor: string;
  darkBg: string;
  darkBorder: string;
  xpMultiplier: number;
}> = {
  common: {
    label: 'Common',
    color: '#94a3b8',
    bgGradient: 'from-slate-100 to-slate-200',
    borderColor: 'border-slate-300',
    glowColor: 'shadow-slate-200/50',
    textColor: 'text-slate-600',
    darkBg: 'dark:from-slate-800 dark:to-slate-900',
    darkBorder: 'dark:border-slate-700',
    xpMultiplier: 1.0,
  },
  uncommon: {
    label: 'Uncommon',
    color: '#22c55e',
    bgGradient: 'from-emerald-50 to-green-100',
    borderColor: 'border-emerald-300',
    glowColor: 'shadow-emerald-200/50',
    textColor: 'text-emerald-600',
    darkBg: 'dark:from-emerald-900/30 dark:to-green-900/30',
    darkBorder: 'dark:border-emerald-800',
    xpMultiplier: 1.25,
  },
  rare: {
    label: 'Rare',
    color: '#3b82f6',
    bgGradient: 'from-blue-50 to-indigo-100',
    borderColor: 'border-blue-300',
    glowColor: 'shadow-blue-200/60',
    textColor: 'text-blue-600',
    darkBg: 'dark:from-blue-900/30 dark:to-indigo-900/30',
    darkBorder: 'dark:border-blue-800',
    xpMultiplier: 1.5,
  },
  epic: {
    label: 'Epic',
    color: '#a855f7',
    bgGradient: 'from-purple-50 to-violet-100',
    borderColor: 'border-purple-300',
    glowColor: 'shadow-purple-300/60',
    textColor: 'text-purple-600',
    darkBg: 'dark:from-purple-900/30 dark:to-violet-900/30',
    darkBorder: 'dark:border-purple-800',
    xpMultiplier: 2.0,
  },
  legendary: {
    label: 'Legendary',
    color: '#f59e0b',
    bgGradient: 'from-amber-50 via-yellow-50 to-orange-100',
    borderColor: 'border-amber-400',
    glowColor: 'shadow-amber-300/70',
    textColor: 'text-amber-600',
    darkBg: 'dark:from-amber-900/30 dark:via-yellow-900/20 dark:to-orange-900/30',
    darkBorder: 'dark:border-amber-700',
    xpMultiplier: 3.0,
  },
};

export const CATEGORY_CONFIG: Record<BadgeCategory, {
  label: string;
  icon: string;
  color: string;
}> = {
  academic:   { label: 'Academic',   icon: '📚', color: 'text-blue-500' },
  social:     { label: 'Social',     icon: '🤝', color: 'text-pink-500' },
  leadership: { label: 'Leadership', icon: '👑', color: 'text-amber-500' },
  event:      { label: 'Events',     icon: '🎪', color: 'text-emerald-500' },
  streak:     { label: 'Streaks',    icon: '🔥', color: 'text-orange-500' },
  special:    { label: 'Special',    icon: '⭐', color: 'text-violet-500' },
};

// ─── Interfaces ─────────────────────────────────────────────
export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  requirementType: string;
  requirementValue: number;
  rarity: BadgeRarity;
  category: BadgeCategory;
  xpReward: number;
}

export interface UserBadge {
  id: string;
  badgeId: string;
  userId: string;
  earnedAt: string;
  badge: Badge;
}

export interface BadgeProgress {
  badge: Badge;
  currentValue: number;
  isUnlocked: boolean;
  progressPercent: number;
}

// ─── Default Badge Definitions ──────────────────────────────
// These serve as client-side fallback definitions for the full badge catalog.
// In production, the canonical list lives in the `badges` Supabase table.
export const BADGE_DEFINITIONS: Badge[] = [
  // ── Common ──
  { id: 'b-first-steps',   name: 'First Steps',      description: 'Attend your first campus event.',              iconUrl: '', requirementType: 'events_attended',  requirementValue: 1,    rarity: 'common',    category: 'event',      xpReward: 10  },
  { id: 'b-social-spark',  name: 'Social Spark',      description: 'Join your first club.',                        iconUrl: '', requirementType: 'clubs_joined',     requirementValue: 1,    rarity: 'common',    category: 'social',     xpReward: 10  },
  { id: 'b-day-one',       name: 'Day One',           description: 'Log in for the first time.',                   iconUrl: '', requirementType: 'daily_logins',     requirementValue: 1,    rarity: 'common',    category: 'streak',     xpReward: 5   },

  // ── Uncommon ──
  { id: 'b-rising-star',   name: 'Rising Star',       description: 'Earn 100 total XP.',                           iconUrl: '', requirementType: 'total_xp',         requirementValue: 100,  rarity: 'uncommon',  category: 'academic',   xpReward: 25  },
  { id: 'b-weekly-warrior', name: 'Weekly Warrior',    description: 'Maintain a 7-day activity streak.',            iconUrl: '', requirementType: 'streak_days',      requirementValue: 7,    rarity: 'uncommon',  category: 'streak',     xpReward: 30  },
  { id: 'b-event-explorer', name: 'Event Explorer',   description: 'Attend 5 different events.',                   iconUrl: '', requirementType: 'events_attended',  requirementValue: 5,    rarity: 'uncommon',  category: 'event',      xpReward: 25  },

  // ── Rare ──
  { id: 'b-trailblazer',   name: 'Trailblazer',       description: 'Earn 500 total XP.',                           iconUrl: '', requirementType: 'total_xp',         requirementValue: 500,  rarity: 'rare',      category: 'academic',   xpReward: 50  },
  { id: 'b-club-hopper',   name: 'Club Hopper',       description: 'Join 3 different clubs.',                      iconUrl: '', requirementType: 'clubs_joined',     requirementValue: 3,    rarity: 'rare',      category: 'social',     xpReward: 40  },
  { id: 'b-iron-streak',   name: 'Iron Streak',       description: 'Maintain a 30-day activity streak.',           iconUrl: '', requirementType: 'streak_days',      requirementValue: 30,   rarity: 'rare',      category: 'streak',     xpReward: 75  },

  // ── Epic ──
  { id: 'b-gold-scholar',  name: 'Gold Scholar',      description: 'Earn 1000 total XP.',                          iconUrl: '', requirementType: 'total_xp',         requirementValue: 1000, rarity: 'epic',      category: 'academic',   xpReward: 100 },
  { id: 'b-event-veteran',  name: 'Event Veteran',    description: 'Attend 25 events.',                            iconUrl: '', requirementType: 'events_attended',  requirementValue: 25,   rarity: 'epic',      category: 'event',      xpReward: 100 },
  { id: 'b-organizer',     name: 'The Organizer',     description: 'Organize 5 events as a club head.',            iconUrl: '', requirementType: 'events_organized', requirementValue: 5,    rarity: 'epic',      category: 'leadership', xpReward: 120 },

  // ── Legendary ──
  { id: 'b-legend',        name: 'Campus Legend',     description: 'Earn 5000 total XP. You are a living legend.',  iconUrl: '', requirementType: 'total_xp',         requirementValue: 5000, rarity: 'legendary', category: 'special',    xpReward: 250 },
  { id: 'b-eternal-flame', name: 'Eternal Flame',     description: 'Maintain a 100-day activity streak.',          iconUrl: '', requirementType: 'streak_days',      requirementValue: 100,  rarity: 'legendary', category: 'streak',     xpReward: 300 },
];

// ─── Service ────────────────────────────────────────────────
export class BadgeService {
  /**
   * Evaluates if a user has met conditions for new badges and awards them.
   */
  static async evaluateBadges(userId: string, stats: Record<string, any>): Promise<Badge[]> {
    try {
      const { data: newBadges, error } = await supabase.rpc('evaluate_user_badges', {
        p_user_id: userId
      });

      if (error) {
        console.warn('RPC evaluate_user_badges may not exist yet:', error.message);
        // Fallback: client-side evaluation against BADGE_DEFINITIONS
        return this.evaluateBadgesClientSide(userId, stats);
      }
      return newBadges || [];
    } catch (error) {
      console.error('Failed to evaluate badges:', error);
      return [];
    }
  }

  /**
   * Client-side badge evaluation fallback.
   * Checks each badge definition against the provided stats and awards new ones.
   */
  private static async evaluateBadgesClientSide(userId: string, stats: Record<string, any>): Promise<Badge[]> {
    try {
      // Get already-earned badge IDs
      const { data: existingBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', userId);

      const earnedIds = new Set((existingBadges || []).map(b => b.badge_id));
      const newlyEarned: Badge[] = [];

      for (const badge of BADGE_DEFINITIONS) {
        if (earnedIds.has(badge.id)) continue;

        const currentValue = stats[badge.requirementType] || 0;
        if (currentValue >= badge.requirementValue) {
          // Award the badge
          const { error } = await supabase
            .from('user_badges')
            .insert({
              user_id: userId,
              badge_id: badge.id,
              earned_at: new Date().toISOString(),
            });

          if (!error) {
            newlyEarned.push(badge);
          }
        }
      }

      return newlyEarned;
    } catch (error) {
      console.error('Client-side badge evaluation failed:', error);
      return [];
    }
  }

  /**
   * Gets all badges earned by a user.
   */
  static async getUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          id,
          user_id,
          badge_id,
          earned_at,
          badges (
            id,
            name,
            description,
            icon_url,
            requirement_type,
            requirement_value,
            rarity,
            category,
            xp_reward
          )
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => {
        const b = item.badges as any;
        return {
          id: item.id,
          userId: item.user_id,
          badgeId: item.badge_id,
          earnedAt: item.earned_at,
          badge: {
            id: b?.id ?? item.badge_id,
            name: b?.name ?? 'Unknown Badge',
            description: b?.description ?? '',
            iconUrl: b?.icon_url ?? '',
            requirementType: b?.requirement_type ?? '',
            requirementValue: b?.requirement_value ?? 0,
            rarity: (b?.rarity as BadgeRarity) ?? 'common',
            category: (b?.category as BadgeCategory) ?? 'special',
            xpReward: b?.xp_reward ?? 0,
          }
        };
      });
    } catch (error) {
      console.error('Failed to fetch user badges:', error);
      // Fallback: reconstruct from BADGE_DEFINITIONS
      return this.getUserBadgesFallback(userId);
    }
  }

  /**
   * Fallback that uses user_badges table with client-side badge definitions.
   */
  private static async getUserBadgesFallback(userId: string): Promise<UserBadge[]> {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('id, user_id, badge_id, earned_at')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) return [];

      const badgeMap = new Map(BADGE_DEFINITIONS.map(b => [b.id, b]));

      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        badgeId: item.badge_id,
        earnedAt: item.earned_at,
        badge: badgeMap.get(item.badge_id) || {
          id: item.badge_id,
          name: 'Achievement Badge',
          description: '',
          iconUrl: '',
          requirementType: '',
          requirementValue: 0,
          rarity: 'common' as BadgeRarity,
          category: 'special' as BadgeCategory,
          xpReward: 0,
        }
      }));
    } catch {
      return [];
    }
  }

  /**
   * Gets badge progress for all defined badges.
   */
  static async getBadgeProgress(userId: string, stats: Record<string, any>): Promise<BadgeProgress[]> {
    const earnedBadges = await this.getUserBadges(userId);
    const earnedIds = new Set(earnedBadges.map(ub => ub.badgeId));

    return BADGE_DEFINITIONS.map(badge => {
      const currentValue = stats[badge.requirementType] || 0;
      const isUnlocked = earnedIds.has(badge.id);
      const progressPercent = isUnlocked
        ? 100
        : Math.min(100, Math.round((currentValue / badge.requirementValue) * 100));

      return {
        badge,
        currentValue,
        isUnlocked,
        progressPercent,
      };
    });
  }

  /**
   * Returns counts grouped by rarity for a user's earned badges.
   */
  static async getBadgeStats(userId: string): Promise<Record<BadgeRarity, number>> {
    const badges = await this.getUserBadges(userId);
    const counts: Record<BadgeRarity, number> = {
      common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0
    };

    for (const ub of badges) {
      const rarity = ub.badge.rarity || 'common';
      counts[rarity] = (counts[rarity] || 0) + 1;
    }

    return counts;
  }
}
