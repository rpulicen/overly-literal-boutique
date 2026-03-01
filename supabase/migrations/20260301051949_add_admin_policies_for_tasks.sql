/*
  # Add Admin Access Policy for Tasks

  1. Security Changes
    - Add policy for admins to read all tasks across all users
    - This allows admin dashboard to display system-wide analytics for tasks

  2. Notes
    - Admin status is determined by the is_admin field in the profiles table
    - Only rod.puliceno@gmail.com should have is_admin set to true
    - This policy is additive and does not replace existing user policies
*/

-- Allow admins to read all tasks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'tasks'
    AND policyname = 'Admins can read all tasks'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can read all tasks"
      ON tasks
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.is_admin = true
        )
      )';
  END IF;
END $$;