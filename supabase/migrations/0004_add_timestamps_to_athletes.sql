-- Add created_at and updated_at columns to athletes table
ALTER TABLE public.athletes
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT now(),
ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT now();

-- Re-apply the trigger for the athletes table to ensure it exists
-- The function trigger_set_timestamp() is assumed to be created by 0003_auto_update_timestamp.sql
CREATE OR REPLACE TRIGGER set_athletes_timestamp
BEFORE UPDATE ON public.athletes
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp(); 