/*
  # Create Suggestions Table

  1. New Tables
    - `suggestions`
      - `id` (uuid, primary key) - Unique identifier for each suggestion
      - `user_id` (uuid) - Reference to the user who made the suggestion
      - `suggestion_text` (text) - The personality suggestion text
      - `created_at` (timestamptz) - Timestamp when suggestion was created

  2. Security
    - Enable RLS on `suggestions` table
    - Add policy for authenticated users to insert their own suggestions
    - Add policy for authenticated users to read their own suggestions
    - Add policy for admins to read all suggestions
*/

CREATE TABLE IF NOT EXISTS suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  suggestion_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own suggestions"
  ON suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own suggestions"
  ON suggestions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all suggestions"
  ON suggestions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS suggestions_user_id_idx ON suggestions(user_id);
CREATE INDEX IF NOT EXISTS suggestions_created_at_idx ON suggestions(created_at DESC);