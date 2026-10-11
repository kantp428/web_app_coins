BEGIN;
CREATE TABLE "categories" (
 "category_id" BIGSERIAL PRIMARY KEY,
 "name" VARCHAR(100) NOT NULL UNIQUE,
 "slug" VARCHAR(140) NOT NULL UNIQUE
);
CREATE TABLE "shop_categories" (
 "shop_id" BIGINT NOT NULL REFERENCES "shops"("shop_id") ON DELETE CASCADE ON UPDATE NO ACTION,
 "category_id" BIGINT NOT NULL REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE NO ACTION,
 PRIMARY KEY ("shop_id", "category_id")
);
CREATE INDEX "ix_shop_categories_category" ON "shop_categories"("category_id", "shop_id");
INSERT INTO "categories" ("name","slug") VALUES
 ('อาหาร','food'),('คาเฟ่','cafe'),('เบเกอรี่','bakery'),('เครื่องดื่ม','beverages'),('ของใช้','household'),('บริการ','services'),('อื่นๆ','other');
INSERT INTO "categories" ("name","slug")
SELECT DISTINCT "category", 'legacy-' || md5("category") FROM "shops" ON CONFLICT ("name") DO NOTHING;
INSERT INTO "shop_categories" ("shop_id","category_id")
SELECT s."shop_id", c."category_id" FROM "shops" s JOIN "categories" c ON c."name"=s."category";
DROP INDEX "ix_shops_map";
ALTER TABLE "shops" DROP COLUMN "category";
CREATE INDEX "ix_shops_map" ON "shops"("participation_status","area_code");
COMMIT;
