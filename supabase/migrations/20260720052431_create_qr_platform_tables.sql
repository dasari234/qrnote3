/*
# QR Note Platform - Tables (Phase 1, part 1)

Creates all foundation tables. Policies come in a separate migration
because several policies reference other tables that must exist first.

## New Tables
1. profiles - user profile keyed to auth.users
2. organizations - tenant root, owned by a user
3. organization_members - joins users to orgs with a role
4. workspaces - sub-tenant grouping under an org
5. folders - hierarchical grouping of QR codes within a workspace
6. qr_codes - QR records (static + dynamic, type-specific payload)
7. scan_events - per-scan analytics rows

## Notes
- RLS is enabled on every table here; policies are added in part 2.
- Triggers (auto profile, auto org/workspace, updated_at) and the
  increment_scan_count RPC are also added here.
*/

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ORGANIZATION MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('owner','admin','editor','viewer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- WORKSPACES
-- ============================================================
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FOLDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- QR CODES
-- ============================================================
CREATE TABLE IF NOT EXISTS qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  type text NOT NULL,
  is_dynamic boolean NOT NULL DEFAULT false,
  short_code text UNIQUE,
  destination_url text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  style jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','archived')),
  scan_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SCAN EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS scan_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_id uuid NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  scanned_at timestamptz NOT NULL DEFAULT now(),
  ip_hash text,
  country text,
  region text,
  city text,
  browser text,
  os text,
  device text,
  language text,
  referrer text,
  user_agent text,
  utm_source text,
  utm_medium text,
  utm_campaign text
);
ALTER TABLE scan_events ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_qr_workspace ON qr_codes(workspace_id);
CREATE INDEX IF NOT EXISTS idx_qr_folder ON qr_codes(folder_id);
CREATE INDEX IF NOT EXISTS idx_qr_short_code ON qr_codes(short_code);
CREATE INDEX IF NOT EXISTS idx_scans_qr_id ON scan_events(qr_id);
CREATE INDEX IF NOT EXISTS idx_scans_scanned_at ON scan_events(scanned_at);
CREATE INDEX IF NOT EXISTS idx_members_org_user ON organization_members(org_id, user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_org ON workspaces(org_id);
CREATE INDEX IF NOT EXISTS idx_folders_workspace ON folders(workspace_id);

-- ============================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_org()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  org_id uuid;
  ws_id uuid;
  base_slug text;
  slug text;
  i int := 0;
BEGIN
  base_slug := lower(regexp_replace(coalesce(nullif(new.email, '') , 'user'), '[^a-z0-9]+', '-', 'g'));
  slug := base_slug;
  LOOP
    EXIT WHEN NOT EXISTS (SELECT 1 FROM organizations WHERE slug = slug);
    i := i + 1;
    slug := base_slug || '-' || i;
  END LOOP;

  INSERT INTO organizations (name, slug, owner_id)
  VALUES (COALESCE(new.full_name, split_part(new.email, '@', 1)) || '''s Workspace', slug, new.id)
  RETURNING id INTO org_id;

  INSERT INTO organization_members (org_id, user_id, role)
  VALUES (org_id, new.id, 'owner');

  INSERT INTO workspaces (org_id, name)
  VALUES (org_id, 'Default')
  RETURNING id INTO ws_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_org();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS touch_profiles ON profiles;
CREATE TRIGGER touch_profiles BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS touch_organizations ON organizations;
CREATE TRIGGER touch_organizations BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS touch_workspaces ON workspaces;
CREATE TRIGGER touch_workspaces BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS touch_folders ON folders;
CREATE TRIGGER touch_folders BEFORE UPDATE ON folders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS touch_qr_codes ON qr_codes;
CREATE TRIGGER touch_qr_codes BEFORE UPDATE ON qr_codes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.increment_scan_count(qr_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE qr_codes SET scan_count = scan_count + 1 WHERE id = qr_uuid;
END;
$$;
