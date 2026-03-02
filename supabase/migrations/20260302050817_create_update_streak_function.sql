/*
  # Create Streak Update Function

  1. New Functions
    - `update_user_streak()` - Calculates and updates streak based on last task date
  
  2. Logic
    - If last task was yesterday: increment streak by 1
    - If last task was today: keep streak the same
    - If user missed a day (or first task): reset to 1
    - Updates last_task_date to today
  
  3. Returns
    - The new streak count
*/

CREATE OR REPLACE FUNCTION update_user_streak(user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_streak integer;
  last_date date;
  today date;
  new_streak integer;
BEGIN
  -- Get current values
  SELECT streak_count, last_task_date INTO current_streak, last_date
  FROM profiles
  WHERE id = user_id;
  
  today := CURRENT_DATE;
  
  -- Calculate new streak
  IF last_date IS NULL THEN
    -- First task ever
    new_streak := 1;
  ELSIF last_date = today THEN
    -- Already created a task today, keep current streak
    new_streak := current_streak;
  ELSIF last_date = today - INTERVAL '1 day' THEN
    -- Last task was yesterday, increment streak
    new_streak := current_streak + 1;
  ELSE
    -- Missed a day, reset to 1
    new_streak := 1;
  END IF;
  
  -- Update the profile
  UPDATE profiles
  SET 
    streak_count = new_streak,
    last_task_date = today
  WHERE id = user_id;
  
  RETURN new_streak;
END;
$$;