ALTER TABLE "public"."shops" ALTER COLUMN "address" TYPE JSONB
USING CASE WHEN "address" IS NULL THEN NULL ELSE jsonb_build_object('line1', "address", 'province', '', 'district', '', 'subDistrict', '', 'postcode', '') END;
