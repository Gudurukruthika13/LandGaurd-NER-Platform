/*
# Fix infinite recursion in profiles RLS policy

## Problem
The `authority_read_all_profiles` SELECT policy on `profiles` contains a
subquery against `profiles` itself:
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'authority')
This causes Postgres to evaluate the `profiles` RLS policies while evaluating
the `profiles` RLS policies — infinite recursion, error 42P17, which makes
every profile fetch fail (including the one the app needs right after login),
producing a blank screen.

## Fix
1. Create a `SECURITY DEFINER` helper `is_current_user_authority()` owned by
   the postgres superuser. SECURITY DEFINER bypasses RLS, so it can read the
   caller's `profiles.role` without re-entering the `profiles` policy.
2. Replace the self-referential `authority_read_all_profiles` policy with one
   that calls the helper instead of sub-querying `profiles`.
3. Replace the same self-referential authority-check pattern on the other
   tables (hazard_reports, risk_locations, alerts, roads) with the helper
   too, for consistency and to avoid the same recursion class if RLS is ever
   toggled on those tables' policies.

## Security
- The helper is `SECURITY DEFINER`, owned by the postgres role, with
  `search_path = public`. It only exposes a boolean; no data leaks.
- RLS remains enabled on all tables. No table or column is dropped or
  renamed; no data is touched.
*/

-- Helper: is the current authenticated user an authority?
CREATE OR REPLACE FUNCTION public.is_current_user_authority()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'authority'
  );
$$;

REVOKE ALL ON FUNCTION public.is_current_user_authority() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_current_user_authority() TO authenticated;

-- ============ PROFILES ============
DROP POLICY IF EXISTS "authority_read_all_profiles" ON profiles;
CREATE POLICY "authority_read_all_profiles" ON profiles FOR SELECT
  TO authenticated USING (public.is_current_user_authority());

-- ============ HAZARD REPORTS ============
DROP POLICY IF EXISTS "authority_read_all_reports" ON hazard_reports;
CREATE POLICY "authority_read_all_reports" ON hazard_reports FOR SELECT
  TO authenticated USING (public.is_current_user_authority());

DROP POLICY IF EXISTS "authority_update_reports" ON hazard_reports;
CREATE POLICY "authority_update_reports" ON hazard_reports FOR UPDATE
  TO authenticated
  USING (public.is_current_user_authority())
  WITH CHECK (public.is_current_user_authority());

-- ============ RISK LOCATIONS ============
DROP POLICY IF EXISTS "authority_insert_risk_locations" ON risk_locations;
CREATE POLICY "authority_insert_risk_locations" ON risk_locations FOR INSERT
  TO authenticated WITH CHECK (public.is_current_user_authority());

DROP POLICY IF EXISTS "authority_update_risk_locations" ON risk_locations;
CREATE POLICY "authority_update_risk_locations" ON risk_locations FOR UPDATE
  TO authenticated
  USING (public.is_current_user_authority())
  WITH CHECK (public.is_current_user_authority());

DROP POLICY IF EXISTS "authority_delete_risk_locations" ON risk_locations;
CREATE POLICY "authority_delete_risk_locations" ON risk_locations FOR DELETE
  TO authenticated USING (public.is_current_user_authority());

-- ============ ALERTS ============
DROP POLICY IF EXISTS "authority_insert_alerts" ON alerts;
CREATE POLICY "authority_insert_alerts" ON alerts FOR INSERT
  TO authenticated WITH CHECK (public.is_current_user_authority());

DROP POLICY IF EXISTS "authority_update_alerts" ON alerts;
CREATE POLICY "authority_update_alerts" ON alerts FOR UPDATE
  TO authenticated
  USING (public.is_current_user_authority())
  WITH CHECK (public.is_current_user_authority());

DROP POLICY IF EXISTS "authority_delete_alerts" ON alerts;
CREATE POLICY "authority_delete_alerts" ON alerts FOR DELETE
  TO authenticated USING (public.is_current_user_authority());

-- ============ ROADS ============
DROP POLICY IF EXISTS "authority_insert_roads" ON roads;
CREATE POLICY "authority_insert_roads" ON roads FOR INSERT
  TO authenticated WITH CHECK (public.is_current_user_authority());

DROP POLICY IF EXISTS "authority_update_roads" ON roads;
CREATE POLICY "authority_update_roads" ON roads FOR UPDATE
  TO authenticated
  USING (public.is_current_user_authority())
  WITH CHECK (public.is_current_user_authority());

DROP POLICY IF EXISTS "authority_delete_roads" ON roads;
CREATE POLICY "authority_delete_roads" ON roads FOR DELETE
  TO authenticated USING (public.is_current_user_authority());
