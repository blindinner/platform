-- Create a trigger to automatically create user_profile when a new user signs up
-- This ensures every user gets a client_id automatically

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, client_id)
  VALUES (
    NEW.id,
    CONCAT('client_', encode(gen_random_bytes(20), 'hex'))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for existing users who don't have one
INSERT INTO user_profiles (user_id, client_id)
SELECT
  id,
  CONCAT('client_', encode(gen_random_bytes(20), 'hex'))
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles);
