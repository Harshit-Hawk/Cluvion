import { supabase } from '../../lib/supabase';

export type Timeframe = 'all_time' | 'weekly' | 'monthly';

export interface LeaderboardFilter {
  timeframe?: Timeframe;
  course?: string; // Department
  clubId?: string; // Club-specific
  page?: number;
  limit?: number;
}

export interface LeaderboardEntry {
  userId: string;
  fullName: string;
  avatarUrl: string;
  course: string;
  score: number;
  rank: number;
}

// Simple in-memory cache for the frontend to prevent spamming the database
const cache: Record<string, { data: LeaderboardEntry[]; expiry: number }> = {};
const CACHE_TTL_MS = 60000; // 1 minute cache

export class LeaderboardService {
  /**
   * Generates a cache key based on the applied filters.
   */
  private static generateCacheKey(filters: LeaderboardFilter): string {
    return JSON.stringify({
      t: filters.timeframe || 'all_time',
      c: filters.course || 'all',
      club: filters.clubId || 'all',
      p: filters.page || 1,
      l: filters.limit || 50
    });
  }

  /**
   * Retrieves the leaderboard data based on dynamic filters (Timeframe, Department, Club).
   * Note: For massive scale, complex aggregations (like weekly sums) should be handled 
   * via Supabase RPCs (Stored Procedures) to avoid returning thousands of rows to the client.
   */
  static async getLeaderboard(filters: LeaderboardFilter = {}): Promise<LeaderboardEntry[]> {
    const cacheKey = this.generateCacheKey(filters);
    const now = Date.now();

    // 1. Check Cache
    if (cache[cacheKey] && cache[cacheKey].expiry > now) {
      return cache[cacheKey].data;
    }

    const { timeframe = 'all_time', course, clubId, page = 1, limit = 50 } = filters;
    const offset = (page - 1) * limit;

    try {
      let data: any[] | null = [];

      // For All-Time Global or Department Rankings, we can use the 'users' table directly
      // since total_xp is maintained by triggers.
      if (timeframe === 'all_time' && !clubId) {
        let query = supabase
          .from('users')
          .select('id, full_name, avatar_url, course, total_xp')
          .order('total_xp', { ascending: false })
          .range(offset, offset + limit - 1);

        if (course) {
          query = query.eq('course', course);
        }

        const { data: usersData, error } = await query;
        if (error) throw error;
        data = usersData;
      } 
      else {
        // SCALABILITY NOTE: 
        // For 'weekly', 'monthly', or 'club-specific' leaderboards, we call an RPC.
        // Doing group-by sums over the 'activity_logs' table directly via REST is not scalable.
        // We assume an RPC 'get_dynamic_leaderboard' exists in PostgreSQL.
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_dynamic_leaderboard', {
          p_timeframe: timeframe,
          p_course: course || null,
          p_club_id: clubId || null,
          p_limit: limit,
          p_offset: offset
        });

        if (rpcError) throw rpcError;
        data = rpcData;
      }

      // 2. Format & Map Results
      const formattedData: LeaderboardEntry[] = (data || []).map((row, index) => ({
        userId: row.id,
        fullName: row.full_name || 'Anonymous Student',
        avatarUrl: row.avatar_url,
        course: row.course || 'Unknown',
        score: row.total_xp || row.score || 0, // Fallback to 'score' if returned from RPC
        rank: offset + index + 1
      }));

      // 3. Store in Cache
      cache[cacheKey] = {
        data: formattedData,
        expiry: now + CACHE_TTL_MS
      };

      return formattedData;

    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      return [];
    }
  }

  /**
   * Helper: Get Top 10 Weekly Department Leaders
   */
  static async getWeeklyDepartmentLeaders(course: string) {
    return this.getLeaderboard({
      timeframe: 'weekly',
      course,
      limit: 10
    });
  }

  /**
   * Helper: Get Top 10 Club Members (All Time)
   */
  static async getClubLeaders(clubId: string) {
    return this.getLeaderboard({
      timeframe: 'all_time',
      clubId,
      limit: 10
    });
  }

  /**
   * Invalidates the leaderboard cache to force a fresh fetch
   * Useful when new XP is awarded
   */
  static invalidateCache() {
    for (const key in cache) {
      delete cache[key];
    }
  }
}
