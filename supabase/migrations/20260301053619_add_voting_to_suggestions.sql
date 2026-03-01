/*
  # Add Voting System to Suggestions

  1. Changes
    - Add `vote_count` column to `suggestions` table (integer, default 0)
    - Add index on vote_count for efficient sorting by popularity
    - Add `voted_suggestions` table to track which users voted for which suggestions
  
  2. New Tables
    - `voted_suggestions`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to user who voted
      - `suggestion_id` (uuid) - Reference to suggestion voted on
      - `created_at` (timestamptz) - Timestamp when vote was cast
      - Unique constraint on (user_id, suggestion_id) to prevent duplicate votes

  3. Security
    - Enable RLS on `voted_suggestions` table
    - Add policy for Ultra users to insert votes
    - Add policy for users to read their own votes
    - Add policy for admins to read all votes
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'suggestions' AND column_name = 'vote_count'
  ) THEN
    ALTER TABLE suggestions ADD COLUMN vote_count integer DEFAULT 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS suggestions_vote_count_idx ON suggestions(vote_count DESC);

CREATE TABLE IF NOT EXISTS voted_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  suggestion_id uuid REFERENCES suggestions(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, suggestion_id)
);

ALTER TABLE voted_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ultra users can vote"
  ON voted_suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.has_upgraded = true
    )
  );

CREATE POLICY "Users can read own votes"
  ON voted_suggestions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all votes"
  ON voted_suggestions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS voted_suggestions_user_id_idx ON voted_suggestions(user_id);
CREATE INDEX IF NOT EXISTS voted_suggestions_suggestion_id_idx ON voted_suggestions(suggestion_id);