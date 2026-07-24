-- Add new columns to qr_codes table for A/B testing, expiry, and vanity slug support

ALTER TABLE "qr_codes" ADD COLUMN "expires_at" TIMESTAMPTZ;
ALTER TABLE "qr_codes" ADD COLUMN "variant" TEXT; -- 'A' or 'B'
ALTER TABLE "qr_codes" ADD COLUMN "test_name" TEXT;
ALTER TABLE "qr_codes" ADD COLUMN "test_id" TEXT;

-- Add index for faster test lookups
CREATE INDEX "idx_qr_codes_test_id" ON "qr_codes"("test_id");
CREATE INDEX "idx_qr_codes_expires_at" ON "qr_codes"("expires_at");
