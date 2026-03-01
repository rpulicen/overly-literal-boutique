/*
  # Fix Circular RLS Policy Dependencies

  1. Changes
    - Remove duplicate "Users can read own profile" policy
    - Remove "Admins can read all profiles" policy that causes circular dependency
    - Remove "Admins can read all tasks" policy that causes circular dependency
    - Keep simple, working policies only

  2. Security
    - Users can still access their own profile
    - Users can still view all tasks (as intended)
    - Admins have full access through service role, not RLS
*/

-- Drop problematic policies on profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Drop problematic policy on tasks
DROP POLICY IF EXISTS "Admins can read all tasks" ON tasks;
DROP POLICY IF EXISTS "Users can read own tasks" ON tasks;
