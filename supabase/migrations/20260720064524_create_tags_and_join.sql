/*
# Phase 2 - Tags and QR-Tag join table

## Summary
Adds a tagging system so QR codes can be labeled and filtered.
Tags are scoped to a workspace. A many-to-many join table connects
QR codes to tags.

## New Tables
1. `tags` - workspace-scoped label with a name and color
2. `_qrcodetotag` - implicit many-to-many join (Prisma convention)

## Security
- RLS enabled on `tags`; org members read, owner/admin/editor write.
- The join table `_qrcodetotag` is managed by Prisma and inherits
  access through the parent tables; RLS enabled with member read +
  editor write.
*/

-- ============================================================
-- TAGS
-- ============================================================
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#6b7280',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, name)
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tags_select_member" ON tags;
CREATE POLICY "tags_select_member" ON tags FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM organization_members m
      JOIN workspaces w ON w.org_id = m.org_id
      WHERE w.id = tags.workspace_id AND m.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "tags_insert_member" ON tags;
CREATE POLICY "tags_insert_member" ON tags FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM organization_members m
      JOIN workspaces w ON w.org_id = m.org_id
      WHERE w.id = tags.workspace_id AND m.user_id = auth.uid()
      AND m.role IN ('owner','admin','editor'))
  );

DROP POLICY IF EXISTS "tags_update_member" ON tags;
CREATE POLICY "tags_update_member" ON tags FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM organization_members m
      JOIN workspaces w ON w.org_id = m.org_id
      WHERE w.id = tags.workspace_id AND m.user_id = auth.uid()
      AND m.role IN ('owner','admin','editor'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM organization_members m
      JOIN workspaces w ON w.org_id = m.org_id
      WHERE w.id = tags.workspace_id AND m.user_id = auth.uid()
      AND m.role IN ('owner','admin','editor'))
  );

DROP POLICY IF EXISTS "tags_delete_member" ON tags;
CREATE POLICY "tags_delete_member" ON tags FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM organization_members m
      JOIN workspaces w ON w.org_id = m.org_id
      WHERE w.id = tags.workspace_id AND m.user_id = auth.uid()
      AND m.role IN ('owner','admin','editor'))
  );

CREATE INDEX IF NOT EXISTS idx_tags_workspace ON tags(workspace_id);

-- ============================================================
-- QR-TAG JOIN (Prisma implicit M:N)
-- ============================================================
CREATE TABLE IF NOT EXISTS "_QrCodeToTag" (
  "A" uuid NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  "B" uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE
);

ALTER TABLE "_QrCodeToTag" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "qrtag_select_member" ON "_QrCodeToTag";
CREATE POLICY "qrtag_select_member" ON "_QrCodeToTag" FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM organization_members m
      JOIN workspaces w ON w.org_id = m.org_id
      JOIN qr_codes q ON q.workspace_id = w.id
      WHERE q.id = "A" AND m.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "qrtag_insert_member" ON "_QrCodeToTag";
CREATE POLICY "qrtag_insert_member" ON "_QrCodeToTag" FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM organization_members m
      JOIN workspaces w ON w.org_id = m.org_id
      JOIN qr_codes q ON q.workspace_id = w.id
      WHERE q.id = "A" AND m.user_id = auth.uid()
      AND m.role IN ('owner','admin','editor'))
  );

DROP POLICY IF EXISTS "qrtag_delete_member" ON "_QrCodeToTag";
CREATE POLICY "qrtag_delete_member" ON "_QrCodeToTag" FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM organization_members m
      JOIN workspaces w ON w.org_id = m.org_id
      JOIN qr_codes q ON q.workspace_id = w.id
      WHERE q.id = "A" AND m.user_id = auth.uid()
      AND m.role IN ('owner','admin','editor'))
  );

CREATE UNIQUE INDEX IF NOT EXISTS "_QrCodeToTag_AB_unique" ON "_QrCodeToTag"("A","B");
CREATE INDEX IF NOT EXISTS "_QrCodeToTag_B_index" ON "_QrCodeToTag"("B");
