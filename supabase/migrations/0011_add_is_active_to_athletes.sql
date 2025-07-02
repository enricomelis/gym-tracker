-- Migration: 0011_add_is_active_to_athletes
-- Add soft-delete flag to athletes
ALTER TABLE public.athletes
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT TRUE;

-- Create index to efficiently query active athletes
CREATE INDEX IF NOT EXISTS athletes_is_active_idx ON public.athletes(is_active); 