BEGIN;
ALTER TABLE "shops" ADD COLUMN "description" VARCHAR(2000);
ALTER TABLE "shops" ADD CONSTRAINT "shops_description_nonempty"
  CHECK ("description" IS NULL OR length(btrim("description")) > 0);
COMMIT;
