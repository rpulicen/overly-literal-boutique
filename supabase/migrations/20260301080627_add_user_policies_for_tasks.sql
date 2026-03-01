/*
  # Add User Policies for Tasks Table

  1. Changes
    - Add policy for authenticated users to view all tasks
    - Add policy for authenticated users to insert their own tasks
    - Add policy for authenticated users to update their own tasks
    - Add policy for authenticated users to delete their own tasks

  2. Security
    - Users can view all tasks (for shared task visibility)
    - Users can only modify tasks they created
    - Admin policies remain unchanged for administrative access
*/

-- Drop existing user policies if any
DROP POLICY IF EXISTS "Authenticated users can view all tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

-- Allow authenticated users to view all tasks
CREATE POLICY "Authenticated users can view all tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert their own tasks
CREATE POLICY "Users can insert own tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own tasks
CREATE POLICY "Users can update own tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own tasks
CREATE POLICY "Users can delete own tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);