// Prisma schema updates: add Coupon and WorkspaceBilling models and Plan fields
// NOTE: You must update prisma/schema.prisma manually or via commit; below is the exact block to add.

/*
model Coupon {
  id         String   @id @default(uuid()) @db.Uuid
  code       String   @unique
  type       String   // 'percentage' | 'fixed'
  amount     Int      // for percentage store percent (e.g., 20), for fixed store paise
  usageLimit Int?
  usedCount  Int      @default(0)
  validFrom  DateTime?
  validUntil DateTime?
  active     Boolean  @default(true)
  createdAt  DateTime @default(now())

  @@map("coupons")
  @@schema("public")
}

model WorkspaceBilling {
  id             String   @id @default(uuid()) @db.Uuid
  workspaceId    String   @unique @map("workspace_id") @db.Uuid
  subscriptionId String?  @map("subscription_id") @db.Uuid
  seats          Int      @default(1)
  createdAt      DateTime @default(now())

  @@map("workspace_billing")
  @@schema("public")
}

// Add to Plan model:
// razorpayPlanId String? @map("razorpay_plan_id")
// trialDays Int? @map("trial_days")
// featureFlags Json? @map("feature_flags")

// Add to Order model:
// couponId String? @map("coupon_id")
// discount Int? @default(0)
*/
