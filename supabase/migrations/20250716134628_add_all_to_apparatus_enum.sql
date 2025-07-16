DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'apparatus_enum' AND e.enumlabel = 'All'
  ) THEN
    ALTER TYPE apparatus_enum ADD VALUE 'All';
  END IF;
END
$$;
