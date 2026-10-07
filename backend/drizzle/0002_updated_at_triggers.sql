-- 0002: keep updated_at correct for every writer, not just this app.
--
-- Drizzle's $onUpdate() only fires for queries issued through Drizzle. Raw SQL, scripts and manual
-- fixes left updated_at stale. This trigger sets it to now() on UPDATE *only when the statement did
-- not change it itself*, so app-side values are respected and nothing else changes behaviour.

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.updated_at IS NOT DISTINCT FROM OLD.updated_at THEN
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT c.table_schema, c.table_name
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_schema = c.table_schema AND t.table_name = c.table_name
    WHERE c.column_name = 'updated_at'
      AND t.table_type = 'BASE TABLE'
      AND c.table_schema IN (
        'public', 'admins_schema', 'user_schema', 'farms_schema', 'location_schema',
        'company_schema', 'vendor_schema', 'website_schema'
      )
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at ON %I.%I', r.table_schema, r.table_name);
    EXECUTE format(
      'CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %I.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      r.table_schema, r.table_name
    );
  END LOOP;
END
$$;
