import { supabase } from '../../lib/supabase';

export interface ActivityLogEntry {
  id: string;
  userId: string;
  actionType: string;
  pointsAwarded: number;
  referenceId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  user?: {
    fullName: string;
    avatarUrl: string;
    course?: string;
  };
}

export interface AnalyticsSummary {
  actionType: string;
  totalPoints: number;
  activityCount: number;
}

export class ActivityLogService {
  /**
   * Fetches paginated activity history for a specific user.
   * Useful for user profile or dashboard history tracking.
   */
  static async getUserActivityHistory(userId: string, page: number = 1, limit: number = 20): Promise<ActivityLogEntry[]> {
    const offset = (page - 1) * limit;

    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          id,
          user_id,
          action_type,
          points_awarded,
          reference_id,
          reference_type,
          created_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        actionType: item.action_type,
        pointsAwarded: item.points_awarded,
        referenceId: item.reference_id,
        metadata: { type: item.reference_type },
        createdAt: item.created_at
      }));
    } catch (error) {
      console.error('Failed to fetch user activity history:', error);
      return [];
    }
  }

  /**
   * Fetches a global feed of recent activities.
   * Supabase Realtime can be configured on the 'activity_logs' table on the frontend to listen to this.
   */
  static async getGlobalFeed(limit: number = 20, departmentFilter?: string): Promise<ActivityLogEntry[]> {
    try {
      let query = supabase
        .from('activity_logs')
        .select(`
          id,
          user_id,
          action_type,
          points_awarded,
          reference_id,
          reference_type,
          created_at,
          users!inner (
            full_name,
            avatar_url,
            course
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (departmentFilter) {
        // Filter by the joined user's course
        query = query.eq('users.course', departmentFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        actionType: item.action_type,
        pointsAwarded: item.points_awarded,
        referenceId: item.reference_id,
        metadata: { type: item.reference_type },
        createdAt: item.created_at,
        user: {
          fullName: item.users?.full_name || 'Anonymous Student',
          avatarUrl: item.users?.avatar_url,
          course: item.users?.course
        }
      }));
    } catch (error) {
      console.error('Failed to fetch global activity feed:', error);
      return [];
    }
  }

  /**
   * Fetches analytics aggregations over a specified timeframe.
   * Supports analytics dashboard integration.
   */
  static async getActivityAnalytics(days: number = 30): Promise<AnalyticsSummary[]> {
    try {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - days);

      // Using an RPC is recommended for aggregations to avoid transferring thousands of rows
      const { data, error } = await supabase.rpc('get_activity_analytics', {
        p_days: days
      });

      if (error) {
        console.warn('RPC get_activity_analytics not found. Provide a Supabase migration to enable backend analytics.', error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch activity analytics:', error);
      return [];
    }
  }

  /**
   * Initialize realtime subscription for activities
   * Note: It is often better to implement this directly in a React hook to manage state,
   * but this provides the channel reference for the frontend to subscribe to.
   */
  static getRealtimeChannel(callback: (payload: any) => void) {
    return supabase
      .channel('public:activity_logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, callback);
  }
}
