# Seed scripts

This folder contains scripts to seed the database with sample plans and coupons.

Run:

1. Ensure your Prisma schema is up to date and migrations applied.
   npx prisma generate
   npx prisma migrate dev --name seed_plans_coupons

2. Run the seed script with Node (requires @prisma/client installed):
   node scripts/seed-payments.js

The script upserts three plans (Basic, Pro, Enterprise) and two coupons (SUMMER20, WELCOME100).
