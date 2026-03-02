/*
  # Auto-grant admin role to specific email
  
  1. Changes
    - Creates a trigger function that automatically sets is_admin=true for rod.puliceno@gmail.com
    - Trigger fires after insert on auth.users table
    - Updates the corresponding profile record to grant admin access
  
  2. Security
    - Only affects the specific email address
    - Ensures immediate admin access upon signup
*/

-- Function to auto-grant admin role
CREATE OR REPLACE FUNCTION auto_grant_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the new user is rod.puliceno@gmail.com
  IF NEW.email = 'rod.puliceno@gmail.com' THEN
    -- Update their profile to be admin
    UPDATE profiles 
    SET is_admin = true 
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_grant_admin ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created_grant_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_grant_admin();
