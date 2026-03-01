/*
  # Create Vote Increment Function

  1. New Functions
    - `increment_vote_count` - RPC function to atomically increment vote count
      - Parameters: suggestion_id (uuid)
      - Returns: void
      - Atomically increments the vote_count for a suggestion

  2. Security
    - Function is marked as SECURITY DEFINER to bypass RLS
    - This allows vote counts to be updated even though users don't have UPDATE permission
    - The actual voting is still restricted by RLS on voted_suggestions table
*/

CREATE OR REPLACE FUNCTION increment_vote_count(suggestion_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE suggestions
  SET vote_count = vote_count + 1
  WHERE id = suggestion_id;
END;
$$;