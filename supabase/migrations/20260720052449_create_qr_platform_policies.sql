/*
# QR Note Platform - RLS Policies (Phase 1, part 2)

## Summary
Adds row-level security policies to all foundation tables created in
part 1. Each table gets separate SELECT/INSERT/UPDATE/DELETE policies
scoped to ownership or organization membership.

## Security
- profiles: owner-only CRUD.
- organizations: org members read; owner writes.
- organization_members: org members read; owner manages.
- workspaces: org members read; owner/admin write.
- folders: org members read; owner/admin/editor write.
- qr_codes: org members read; owner/admin/editor write.
- scan_events: org members read; anon+authenticated insert (public scans).
*/

-- PROFILES
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ORGANIZATIONS
DROP POLICY IF EXISTS "orgs_select_member" ON organizations;
CREATE POLICY "orgs_select_member" ON organizations FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM organization_members m
      WHERE m.org_id = organizations.id AND m.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "orgs_insert_owner" ON organizations;
CREATE POLICY "orgs_insert_owner" ON organizations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "orgs_update_owner" ON organizations;
CREATE POLICY "orgs_update_owner" ON organizations FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "orgs_delete_owner" ON organizations;
CREATE POLICY "orgs_delete_owner" ON organizations FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

-- ORGANIZATION MEMBERS
DROP POLICY IF EXISTS "members_select_orgmember" ON organization_members;
CREATE POLICY "members_select_orgmember" ON organization_members FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM organization_members m
      WHERE m.org_id = organization_members.org_id AND m.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "members_insert_owner" ON organization_members;
CREATE POLICY "members_insert_owner" ON organization_members FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = org_id AND o.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "members_update_owner" ON organization_members;
CREATE POLICY "members_update_owner" ON organization_members FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = org_id AND o.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = org_id AND o.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "members_delete_owner" ON organization_members;
CREATE POLICY "members_delete_owner" ON organization_members FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = org_id AND o.owner_id = auth.uid())
  );

-- WORKSPACES
DROP POLICY IF EXISTS "workspaces_select_member" ON workspaces;
CREATE POLICY "workspaces_select_member" ON workspaces FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM organization_members m
      WHERE m.org_id = workspaces.org_id AND m.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "workspaces_insert_member" ON workspaces;
CREATE POLICY "workspaces_insert_member" ON workspaces FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM organization_members m
      WHERE m.org_id = workspaces.org_id AND m.user_id = auth.uid()
      AND m.role IN ('owner','admin'))
  );

DROP POLICY IF EXISTS "workspaces_update_member" ON workspaces;
CREATE POLICY "workspaces_update_member" ON workspaces FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM organization_members m
      WHERE m.org_id = workspaces.org_id AND m.user_id = auth.uid()
      AND m.role IN ('owner','admin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM organization_members m
      WHERE m.org_id = workspaces.org_id AND m.user_id = auth.uid()
      AND m.role IN ('owner','admin'))
  );

DROP POLICY IF EXISTS "workspaces_delete_member" ON workspaces;
CREATE POLICY "workspaces_delete_member" ON workspaces FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM organization_members m
      WHERE m.org_id = workspaces.org_id AND m.user_id = auth.uid()
      AND m.role IN ('owner','admin'))
  );

-- FOLDERS
DROP POLICY IF EXISTS "folders_select_member" ON folders;
CREATE POLICY "folders_select_member" ON folders FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM organization_members m
      JOIN workspaces w ON w.org_id = m.org_id
      WHERE w.id = folders.workspace_id AND m.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "folders_insert_member" ON folders;
CREATE POLICY "folders_insert_member" ON folders FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM organization_members m
      JOIN workspaces w ON w.org_id = m.org_id
      WHERE w.id = folders.workspace_id AND m.user_id = auth.uid()
      AND m.role IN ('owner','admin','editor'))
  );

DROP POLICY IF EXISTS "folders_update_member" ON folders;
CREATE POLICY "folders_update_member" ON folders FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM organization_members m
      JOIN workspaces w ON w.org_id = m.org_id
      WHERE w.id = folders.workspace_id AND m.user_id = auth.uid()
      AND m.role IN ('owner','admin','editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM organization_members m
      JOIN workspaces w ON w.org_id = m.org_id
      WHERE w.id = folders.workspace_id AND m.user_id = auth.uid()
      AND m.role IN ('owner','admin','editor'))
  );

DROP POLICY IF EXISTS "folders_delete_member" ON folders;
CREATE POLICY "folders_delete_member" ON folders FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM organization_members m
      JOIN workspaces w ON w.org_id = m.org_id
      WHERE w.id = folders.workspace_id AND m.user_id = auth.uid()
      AND m.role IN ('owner','admin','editor'))
  );

-- QR CODES
DROP POLICY IF EXISTS "qr_select_member" ON qr_codes;
CREATE POLICY "qr_select_member" ON qr_codes FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM organization_members m
      JOIN workspaces w ON w.org_id = m.org_id
      WHERE w.id = qr_codes.workspace_id AND m.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "qr_insert_member" ON qr_codes;
CREATE POLICY "qr_insert_member" ON qr_codes FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM organization_members m
      JOIN workspaces w ON w.org_id = m.org_id
      WHERE w.id = qr_codes.workspace_id AND m.user_id = auth.uid()
      AND m.role IN ('owner','admin','editor'))
  );

DROP POLICY IF EXISTS "qr_update_member" ON qr_codes;
CREATE POLICY "qr_update_member" ON qr_codes FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM organization_members m
      JOIN workspaces w ON w.org_id = m.org_id
      WHERE w.id = qr_codes.workspace_id AND m.user_id = auth.uid()
      AND m.role IN ('owner','admin','editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM organization_members m
      JOIN workspaces w ON w.org_id = m.org_id
      WHERE w.id = qr_codes.workspace_id AND m.user_id = auth.uid()
      AND m.role IN ('owner','admin','editor'))
  );

DROP POLICY IF EXISTS "qr_delete_member" ON qr_codes;
CREATE POLICY "qr_delete_member" ON qr_codes FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM organization_members m
      JOIN workspaces w ON w.org_id = m.org_id
      WHERE w.id = qr_codes.workspace_id AND m.user_id = auth.uid()
      AND m.role IN ('owner','admin','editor'))
  );

-- SCAN EVENTS
DROP POLICY IF EXISTS "scans_select_member" ON scan_events;
CREATE POLICY "scans_select_member" ON scan_events FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM organization_members m
      JOIN workspaces w ON w.org_id = m.org_id
      JOIN qr_codes q ON q.workspace_id = w.id
      WHERE q.id = scan_events.qr_id AND m.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "scans_insert_anon" ON scan_events;
CREATE POLICY "scans_insert_anon" ON scan_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);
