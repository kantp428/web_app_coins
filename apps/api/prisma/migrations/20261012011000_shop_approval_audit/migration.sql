ALTER TABLE "shops"
ADD COLUMN "reviewed_by" BIGINT,
ADD COLUMN "reviewed_at" TIMESTAMPTZ(6),
ADD COLUMN "review_reason" VARCHAR(500);

ALTER TABLE "shops"
ADD CONSTRAINT "shops_reviewed_by_fkey"
FOREIGN KEY ("reviewed_by") REFERENCES "users"("user_id")
ON DELETE SET NULL ON UPDATE NO ACTION;

CREATE INDEX "ix_shops_review_status" ON "shops"("participation_status", "shop_id");
