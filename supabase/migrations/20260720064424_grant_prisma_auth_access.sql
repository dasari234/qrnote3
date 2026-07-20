/*
# Grant prisma role read access to auth schema

Grants the prisma login role USAGE on the auth schema and SELECT on
auth.users so Prisma can introspect the foreign key reference from
public.profiles to auth.users without needing full database privileges.
*/

GRANT USAGE ON SCHEMA auth TO prisma;
GRANT SELECT ON auth.users TO prisma;
