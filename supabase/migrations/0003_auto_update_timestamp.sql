-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for coaches table
CREATE TRIGGER set_coaches_timestamp
BEFORE UPDATE ON public.coaches
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp();

-- Trigger for athletes table
CREATE TRIGGER set_athletes_timestamp
BEFORE UPDATE ON public.athletes
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp(); 