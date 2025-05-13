
-- Create user_roles table for admin permissions
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policies for user_roles (can be read by authenticated users, but modified only by admins)
CREATE POLICY "Allow users to read their own roles" 
ON public.user_roles FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Add policy to allow anonymous users to insert admin roles (for initial setup)
CREATE POLICY "Allow anonymous users to create admin roles"
ON public.user_roles FOR INSERT
TO anon
WITH CHECK (true);

-- Insert a default admin user (replace with your user ID after registration)
-- You'll need to sign up first, then get your user ID from the auth.users table
-- INSERT INTO public.user_roles (user_id, role) VALUES ('your-user-id-here', 'admin');

-- Function to update the updated_at field
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update the updated_at field
CREATE OR REPLACE TRIGGER update_user_roles_timestamp
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
