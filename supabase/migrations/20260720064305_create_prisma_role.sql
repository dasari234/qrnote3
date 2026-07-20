/*
# Create prisma database role

Creates a dedicated login role for the Prisma ORM to connect with.
This role is granted the privileges needed to read and write all
application tables and to run migrations (create/alter tables).

## Notes
1. The role can log in with a known password.
2. Granted privileges on all existing and future tables in the public schema.
3. The role bypasses RLS so Prisma queries are not filtered by auth.uid()
   (Prisma runs server-side with full trust, like the service role).
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'prisma') THEN
    CREATE ROLE prisma WITH LOGIN PASSWORD 'prisma_2026_connect' BYPASSRLS;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO prisma;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO prisma;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO prisma;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO prisma;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma;
