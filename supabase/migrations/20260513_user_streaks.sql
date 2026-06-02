-- Migration for Gamification Streaks

CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE
);

-- Index for quick dashboard lookups
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);

CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_today DATE := (NEW.created_at AT TIME ZONE 'utc')::date;
BEGIN
  -- We only update streak for specific action types to prevent abuse from trivial actions
  IF NEW.action_type NOT IN ('event_attended', 'challenge_completed', 'daily_login', 'achievement_earned') THEN
    RETURN NEW;
  END IF;

  -- Get current streak info
  SELECT last_activity_date, current_streak, longest_streak
  INTO v_last_date, v_current_streak, v_longest_streak
  FROM user_streaks
  WHERE user_id = NEW.user_id;

  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (NEW.user_id, 1, 1, v_today);
    RETURN NEW;
  END IF;

  -- Anti-abuse: If activity is today, do nothing (streak already counted for today)
  IF v_last_date = v_today THEN
    RETURN NEW;
  END IF;

  -- If activity was yesterday, increment streak
  IF v_last_date = v_today - 1 THEN
    v_current_streak := v_current_streak + 1;
  ELSE
    -- If gap > 1 day, reset streak
    v_current_streak := 1;
  END IF;

  -- Update longest streak
  IF v_current_streak > COALESCE(v_longest_streak, 0) THEN
    v_longest_streak := v_current_streak;
  END IF;

  -- Save back to table
  UPDATE user_streaks
  SET current_streak = v_current_streak,
      longest_streak = v_longest_streak,
      last_activity_date = v_today
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to activity_logs
DROP TRIGGER IF EXISTS trigger_update_user_streak ON activity_logs;
CREATE TRIGGER trigger_update_user_streak
AFTER INSERT ON activity_logs
FOR EACH ROW EXECUTE FUNCTION update_user_streak();
