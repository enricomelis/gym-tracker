-- Create a security definer function to determine user role
-- This bypasses RLS policies since role detection needs to work before we know the role
CREATE OR REPLACE FUNCTION public.get_user_role_rpc(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if user is a coach
  IF EXISTS (
    SELECT 1 FROM public.coaches 
    WHERE supabase_id = user_id
  ) THEN
    RETURN 'coach';
  END IF;
  
  -- Check if user is an athlete  
  IF EXISTS (
    SELECT 1 FROM public.athletes 
    WHERE supabase_id = user_id
  ) THEN
    RETURN 'athlete';
  END IF;
  
  -- No role found
  RETURN NULL;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role_rpc(uuid) TO authenticated;
