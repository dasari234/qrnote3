/* Grant prisma role database-level privileges needed for introspection */
GRANT CONNECT ON DATABASE postgres TO prisma;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO prisma;
GRANT USAGE ON SCHEMA auth TO prisma;
