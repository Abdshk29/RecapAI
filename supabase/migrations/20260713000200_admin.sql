-- Migration: Add is_admin column to profiles table and setup admin policies

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false NOT NULL;

-- Create index for quick admin lookup
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- Allow admins to view all profiles for user management
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Allow admins to update user profiles (e.g. toggle role/subscription)
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Allow admins to view all meetings for analytics & audit logs
CREATE POLICY "Admins can view all meetings"
ON public.meetings FOR SELECT TO authenticated
USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Allow admins to view all action items for analytics
CREATE POLICY "Admins can view all action items"
ON public.action_items FOR SELECT TO authenticated
USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);
