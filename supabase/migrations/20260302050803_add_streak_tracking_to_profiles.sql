/*
  # Add Streak Tracking to Profiles

  1. Changes
    - Add `streak_count` column (integer, default 0) to track consecutive days
    - Add `last_task_date` column (date) to track when user last created a task
  
  2. Notes
    - Uses date type (not timestamp) to compare calendar days regardless of time
    - Default values ensure new users start with 0 streak
    - Existing users will have null last_task_date initially (no streak yet)
*/

-- Add streak tracking columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'streak_count'
  ) THEN
    ALTER TABLE profiles ADD COLUMN streak_count integer DEFAULT 0 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_task_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_task_date date;
  END IF;
END $$;