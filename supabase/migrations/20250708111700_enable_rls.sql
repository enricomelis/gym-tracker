-- Enable RLS for core tables

-- Coaches
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated coaches can select their profile"
ON "public"."coaches"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  supabase_id = auth.uid()
);

CREATE POLICY "authenticated coaches can update their profile"
ON "public"."coaches"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  supabase_id = auth.uid()
)
WITH CHECK (
  supabase_id = auth.uid()
);

CREATE POLICY "authenticated coaches can select coaches"
ON "public"."coaches"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  true
);