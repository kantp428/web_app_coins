BEGIN;
DROP INDEX "ix_shops_map";
ALTER TABLE "shops" DROP COLUMN "area_code";
CREATE INDEX "ix_shops_map" ON "shops"("participation_status");
ALTER TABLE "purchases" ALTER COLUMN "shop_area_snapshot" DROP NOT NULL;
DROP INDEX "ix_purchases_report";
CREATE INDEX "ix_purchases_report" ON "purchases"("confirmed_at","shop_size_snapshot");
COMMIT;
