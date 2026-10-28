ALTER TABLE "public"."purchases" ALTER COLUMN "rule_id" DROP NOT NULL;

ALTER TABLE "public"."payment_requests"
  ADD COLUMN "expires_at" TIMESTAMPTZ(6),
  ADD COLUMN "purchase_id" BIGINT;

UPDATE "public"."payment_requests"
SET "expires_at" = "created_at" + INTERVAL '15 minutes'
WHERE "expires_at" IS NULL;

ALTER TABLE "public"."payment_requests"
  ALTER COLUMN "expires_at" SET NOT NULL,
  ALTER COLUMN "expires_at" SET DEFAULT (CURRENT_TIMESTAMP + INTERVAL '15 minutes');

ALTER TABLE "public"."payment_requests" DROP CONSTRAINT "payment_requests_status_check";
ALTER TABLE "public"."payment_requests" ADD CONSTRAINT "payment_requests_status_check"
  CHECK (status IN ('PENDING','PAID','CANCELLED'));
ALTER TABLE "public"."payment_requests" ADD CONSTRAINT "payment_requests_expiry_check"
  CHECK (expires_at > created_at);

CREATE UNIQUE INDEX "payment_requests_purchase_id_key"
  ON "public"."payment_requests"("purchase_id");
ALTER TABLE "public"."payment_requests" ADD CONSTRAINT "payment_requests_purchase_id_fkey"
  FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("purchase_id")
  ON DELETE NO ACTION ON UPDATE NO ACTION;
