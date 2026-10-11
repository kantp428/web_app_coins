-- Preserve all existing shops; new registrations require address in the API.
ALTER TABLE "public"."shops" ADD COLUMN "address" VARCHAR(500);
