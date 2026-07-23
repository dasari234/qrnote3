-- Migration: add isSuperAdmin to profiles + create org_invites table

ALTER TABLE "public"."profiles"
  ADD COLUMN IF NOT EXISTS "is_super_admin" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "public"."org_invites" (
  "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
  "org_id"     UUID        NOT NULL,
  "email"      TEXT        NOT NULL,
  "role"       "public"."Role" NOT NULL DEFAULT 'editor',
  "token"      TEXT        NOT NULL,
  "accepted"   BOOLEAN     NOT NULL DEFAULT false,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "org_invites_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "org_invites_token_key" UNIQUE ("token"),
  CONSTRAINT "org_invites_org_id_email_key" UNIQUE ("org_id", "email"),
  CONSTRAINT "org_invites_org_id_fkey" FOREIGN KEY ("org_id")
    REFERENCES "public"."organizations" ("id") ON DELETE CASCADE
);
