-- Function to create a profile for a new coach
CREATE OR REPLACE FUNCTION public.handle_new_coach()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Check if the role is 'coach' and insert into the coaches table
  IF NEW.raw_user_meta_data->>'role' = 'coach' THEN
    INSERT INTO public.coaches (supabase_id, first_name, last_name, society_id)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      (NEW.raw_user_meta_data->>'society_id')::uuid
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to call the function when a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_coach();