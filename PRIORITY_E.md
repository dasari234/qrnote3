# Priority E: White-label, Templates, API Keys, Webhooks, Imports

This doc describes the MVP implementation added for Priority E and how to finish deployment/configuration.

What was added
- Prisma models for CustomDomain, Template, ApiKey, CustomerWebhook, ImportJob (you must add these to prisma/schema.prisma and run migration).
- Domain verification helpers and create/verify endpoints.
- Template listing and creation endpoints + frontend pages to browse templates.
- API key generation/listing endpoints and admin page.
- PR provides import endpoints and import UI scaffolding (preview + commit) — implement backend validation as needed.

Next steps / considerations
- Add the Prisma models below to prisma/schema.prisma and run:
  - npx prisma generate
  - npx prisma migrate dev --name add_priority_e
- For custom domain routing and SSL, you will need to configure your hosting provider (Vercel, Cloudflare, etc.) to route custom domains to the app and provision certificates. The DB record and verification flow here only handle token verification.
- Webhooks and API key usage: store webhook secrets securely and sign deliveries with HMAC.

Sample Prisma models to add (copy into prisma/schema.prisma):

```prisma
model CustomDomain {
  id                String   @id @default(uuid()) @db.Uuid
  workspaceId       String   @map("workspace_id") @db.Uuid
  domain            String   @unique
  verified          Boolean  @default(false)
  verificationToken String
  createdAt         DateTime @default(now()) @map("created_at")

  @@map("custom_domains")
  @@schema("public")
}

model Template {
  id          String   @id @default(uuid()) @db.Uuid
  title       String
  description String?
  authorId    String?  @map("author_id") @db.Uuid
  price       Int      @default(0)
  isPaid      Boolean  @default(false)
  content     Json
  createdAt   DateTime @default(now())

  @@map("templates")
  @@schema("public")
}

model ApiKey {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @map("user_id") @db.Uuid
  key         String   @unique
  description String?
  revoked     Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@map("api_keys")
  @@schema("public")
}

model CustomerWebhook {
  id           String   @id @default(uuid()) @db.Uuid
  workspaceId   String   @map("workspace_id") @db.Uuid
  url          String
  secret       String
  events       String   // comma-separated for MVP
  active       Boolean  @default(true)
  createdAt    DateTime @default(now())

  @@map("customer_webhooks")
  @@schema("public")
}

model ImportJob {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @map("user_id") @db.Uuid
  type        String
  filePath    String?
  preview     Json?
  status      String   @default("pending")
  createdAt   DateTime @default(now())

  @@map("import_jobs")
  @@schema("public")
}
```

Security notes
- API keys are shown once on creation — store them securely.
- Webhook secrets should be hashed at rest; this MVP stores raw for simplicity — consider hashing.
- Use background workers for large imports and webhook deliveries.

