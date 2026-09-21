/*
# LandGuard NER — Core Schema

## Purpose
Creates the foundational tables for an AI-powered landslide risk monitoring
and early-warning platform for the North Eastern Region (NER) of India.

## New Tables

### profiles
Extends Supabase auth.users with application-specific data.
- `id` (uuid, PK, references auth.users) — links to the auth account
- `name` (text) — full name
- `email` (text, unique) — email address
- `phone` (text) — phone number
- `role` (text) — 'community' or 'authority'
- `created_at` (timestamptz) — account creation time

### hazard_reports
Citizen-submitted geo-tagged hazard reports.
- `id` (uuid, PK)
- `user_id` (uuid, references profiles) — reporting user
- `latitude` (numeric) — report location lat
- `longitude` (numeric) — report location lng
- `hazard_type` (text) — road_blockage | ground_crack | slope_failure | fallen_rocks | water_overflow | possible_landslide | other
- `description` (text) — user description
- `photo_url` (text) — uploaded photo URL
- `timestamp` (timestamptz) — when hazard observed
- `status` (text) — pending | under_verification | verified | rejected | resolved
- `priority` (text) — low | medium | high | critical
- `report_id` (text, unique) — human-readable ID like LG-2026-0001

### risk_locations
Mock/sample risk assessment points across NER.
- `id` (uuid, PK)
- `latitude` (numeric)
- `longitude` (numeric)
- `rainfall` (numeric) — mm
- `slope` (numeric) — degrees
- `elevation` (numeric) — meters
- `historical_landslide` (boolean)
- `susceptibility` (text) — low | moderate | high | very_high
- `vegetation` (text) — sparse | moderate | dense
- `risk_score` (numeric) — 0-100
- `risk_level` (text) — safe | moderate | critical
- `label` (text) — location name
- `timestamp` (timestamptz)

### alerts
Risk alerts linked to risk locations.
- `id` (uuid, PK)
- `location_id` (uuid, references risk_locations)
- `risk_level` (text) — safe | moderate | critical
- `message` (text)
- `estimated_risk_window` (text) — e.g. "Next 48 hours"
- `created_at` (timestamptz)
- `status` (text) — active | expired | acknowledged

### roads
Road/route information with risk levels.
- `id` (uuid, PK)
- `name` (text)
- `start_location` (text) — place name
- `end_location` (text) — place name
- `risk_level` (text) — safe | moderate | critical
- `road_status` (text) — open | restricted | blocked

## Security
- RLS enabled on every table.
- profiles: each authenticated user can read/update only their own profile.
- hazard_reports: community users can create/read/update/delete their own reports; authority users can read and update all reports.
- risk_locations, alerts, roads: readable by all authenticated users; writable only by authority users.

## Important Notes
1. profiles.id defaults to auth.uid() so it auto-links on signup.
2. hazard_reports.user_id defaults to auth.uid() so inserts omitting it still pass RLS.
3. A trigger auto-creates a profile row when a new auth user signs up.
4. report_id is auto-generated via a sequence for human-readable IDs.
*/

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text UNIQUE,
  phone text DEFAULT '',
  role text NOT NULL DEFAULT 'community' CHECK (role IN ('community', 'authority')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Authority can read all profiles (to see community members).
-- Uses a SECURITY DEFINER helper to avoid infinite RLS recursion on profiles.
CREATE OR REPLACE FUNCTION public.is_current_user_authority()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'authority'
  );
$;

REVOKE ALL ON FUNCTION public.is_current_user_authority() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_current_user_authority() TO authenticated;

DROP POLICY IF EXISTS "authority_read_all_profiles" ON profiles;
CREATE POLICY "authority_read_all_profiles" ON profiles FOR SELECT
  TO authenticated USING (public.is_current_user_authority());

-- ============ HAZARD REPORTS ============
CREATE TABLE IF NOT EXISTS hazard_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  hazard_type text NOT NULL CHECK (hazard_type IN ('road_blockage','ground_crack','slope_failure','fallen_rocks','water_overflow','possible_landslide','other')),
  description text DEFAULT '',
  photo_url text DEFAULT '',
  timestamp timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','under_verification','verified','rejected','resolved')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  report_id text UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hazard_reports ENABLE ROW LEVEL SECURITY;

-- Community: CRUD own reports
DROP POLICY IF EXISTS "select_own_reports" ON hazard_reports;
CREATE POLICY "select_own_reports" ON hazard_reports FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_reports" ON hazard_reports;
CREATE POLICY "insert_own_reports" ON hazard_reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_reports" ON hazard_reports;
CREATE POLICY "update_own_reports" ON hazard_reports FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_reports" ON hazard_reports;
CREATE POLICY "delete_own_reports" ON hazard_reports FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Authority: read all reports + update status/priority
DROP POLICY IF EXISTS "authority_read_all_reports" ON hazard_reports;
CREATE POLICY "authority_read_all_reports" ON hazard_reports FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'authority')
  );

DROP POLICY IF EXISTS "authority_update_reports" ON hazard_reports;
CREATE POLICY "authority_update_reports" ON hazard_reports FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'authority')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'authority')
  );

-- ============ RISK LOCATIONS ============
CREATE TABLE IF NOT EXISTS risk_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  rainfall numeric DEFAULT 0,
  slope numeric DEFAULT 0,
  elevation numeric DEFAULT 0,
  historical_landslide boolean DEFAULT false,
  susceptibility text DEFAULT 'low' CHECK (susceptibility IN ('low','moderate','high','very_high')),
  vegetation text DEFAULT 'moderate' CHECK (vegetation IN ('sparse','moderate','dense')),
  risk_score numeric DEFAULT 0,
  risk_level text DEFAULT 'safe' CHECK (risk_level IN ('safe','moderate','critical')),
  label text DEFAULT '',
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE risk_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_risk_locations" ON risk_locations;
CREATE POLICY "read_risk_locations" ON risk_locations FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "authority_insert_risk_locations" ON risk_locations;
CREATE POLICY "authority_insert_risk_locations" ON risk_locations FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'authority')
  );

DROP POLICY IF EXISTS "authority_update_risk_locations" ON risk_locations;
CREATE POLICY "authority_update_risk_locations" ON risk_locations FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'authority')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'authority')
  );

DROP POLICY IF EXISTS "authority_delete_risk_locations" ON risk_locations;
CREATE POLICY "authority_delete_risk_locations" ON risk_locations FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'authority')
  );

-- ============ ALERTS ============
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid REFERENCES risk_locations(id) ON DELETE SET NULL,
  risk_level text NOT NULL DEFAULT 'moderate' CHECK (risk_level IN ('safe','moderate','critical')),
  message text NOT NULL DEFAULT '',
  estimated_risk_window text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','acknowledged'))
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_alerts" ON alerts;
CREATE POLICY "read_alerts" ON alerts FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "authority_insert_alerts" ON alerts;
CREATE POLICY "authority_insert_alerts" ON alerts FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'authority')
  );

DROP POLICY IF EXISTS "authority_update_alerts" ON alerts;
CREATE POLICY "authority_update_alerts" ON alerts FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'authority')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'authority')
  );

DROP POLICY IF EXISTS "authority_delete_alerts" ON alerts;
CREATE POLICY "authority_delete_alerts" ON alerts FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'authority')
  );

-- ============ ROADS ============
CREATE TABLE IF NOT EXISTS roads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  start_location text DEFAULT '',
  end_location text DEFAULT '',
  risk_level text DEFAULT 'safe' CHECK (risk_level IN ('safe','moderate','critical')),
  road_status text DEFAULT 'open' CHECK (road_status IN ('open','restricted','blocked'))
);

ALTER TABLE roads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_roads" ON roads;
CREATE POLICY "read_roads" ON roads FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "authority_insert_roads" ON roads;
CREATE POLICY "authority_insert_roads" ON roads FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'authority')
  );

DROP POLICY IF EXISTS "authority_update_roads" ON roads;
CREATE POLICY "authority_update_roads" ON roads FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'authority')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'authority')
  );

DROP POLICY IF EXISTS "authority_delete_roads" ON roads;
CREATE POLICY "authority_delete_roads" ON roads FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'authority')
  );

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ REPORT ID SEQUENCE ============
CREATE SEQUENCE IF NOT EXISTS hazard_report_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_report_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.report_id IS NULL THEN
    NEW.report_id := 'LG-' || EXTRACT(YEAR FROM now())::text || '-' || lpad(nextval('hazard_report_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_report_id ON hazard_reports;
CREATE TRIGGER set_report_id
  BEFORE INSERT ON hazard_reports
  FOR EACH ROW EXECUTE FUNCTION public.generate_report_id();

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_hazard_reports_user_id ON hazard_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_hazard_reports_status ON hazard_reports(status);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_risk_locations_risk_level ON risk_locations(risk_level);
