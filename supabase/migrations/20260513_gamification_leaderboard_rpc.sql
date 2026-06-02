-- Migration to create the get_dynamic_leaderboard RPC for scalable Gamification

CREATE OR REPLACE FUNCTION get_dynamic_leaderboard(
  p_timeframe text DEFAULT 'all_time',
  p_course text DEFAULT NULL,
  p_club_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  full_name text,
  avatar_url text,
  course text,
  score bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If timeframe is 'all_time' and no club is specified, we can use the main users table
  -- which has total_xp synced. This is an optimization.
  IF p_timeframe = 'all_time' AND p_club_id IS NULL THEN
    RETURN QUERY
      SELECT 
        u.id, 
        u.full_name, 
        u.avatar_url, 
        u.course, 
        u.total_xp::bigint AS score
      FROM users u
      WHERE (p_course IS NULL OR u.course = p_course)
      ORDER BY u.total_xp DESC NULLS LAST
      LIMIT p_limit OFFSET p_offset;
      
  -- For weekly, monthly, or club-specific leaderboards, we must aggregate activity_logs dynamically
  ELSE
    RETURN QUERY
      SELECT 
        u.id, 
        u.full_name, 
        u.avatar_url, 
        u.course, 
        COALESCE(SUM(al.points_awarded), 0)::bigint AS score
      FROM users u
      LEFT JOIN activity_logs al ON u.id = al.user_id
      WHERE 
        -- Filter by Department if specified
        (p_course IS NULL OR u.course = p_course)
        -- Filter by Timeframe
        AND (
          p_timeframe = 'all_time'
          OR (p_timeframe = 'weekly' AND al.created_at >= date_trunc('week', now()))
          OR (p_timeframe = 'monthly' AND al.created_at >= date_trunc('month', now()))
        )
        -- Filter by Club (Users must be members of the club, or activity must be tied to the club,
        -- here we assume checking if they are an active member of the club is enough)
        AND (
          p_club_id IS NULL OR EXISTS (
            SELECT 1 FROM memberships m 
            WHERE m.user_id = u.id AND m.club_id = p_club_id AND m.status = 'active'
          )
        )
      GROUP BY u.id
      HAVING COALESCE(SUM(al.points_awarded), 0) > 0
      ORDER BY score DESC
      LIMIT p_limit OFFSET p_offset;
  END IF;
END;
$$;
