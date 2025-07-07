-- Migration: 20250707145301_drop_rls_policies.sql
-- Purpose: Delete all Row-Level Security (RLS) policies that were created after migration 0011.
--
-- Rationale: after reverting to the pre-RLS model we no longer need any policy objects; keeping
-- them clutters the catalog and might lead to confusion if RLS is re-enabled by mistake.
--
-- Implementation: iterate over pg_policies for the `public` schema and issue a DROP POLICY for
-- each entry.  This dynamic approach is future-proof and avoids having to hard-code every policy
-- name manually.

DO
$$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I;',
      pol.policyname,
      pol.schemaname,
      pol.tablename
    );
  END LOOP;
END;
$$; 