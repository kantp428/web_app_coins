ALTER TABLE "public"."wallets" DROP CONSTRAINT "wallets_user_role_check";
ALTER TABLE "public"."wallets" ADD CONSTRAINT "wallets_user_role_check"
  CHECK ((user_role)::text = ANY ((ARRAY['CUSTOMER'::varchar, 'SELLER'::varchar])::text[]));

ALTER TABLE "public"."money_entries" DROP CONSTRAINT "money_entries_entry_type_check";
ALTER TABLE "public"."money_entries" ADD CONSTRAINT "money_entries_entry_type_check"
  CHECK ((entry_type)::text = ANY ((ARRAY['TOPUP'::varchar, 'BASE_ALLOCATION'::varchar, 'REWARD_ALLOCATION'::varchar, 'PURCHASE'::varchar, 'REFUND'::varchar, 'EXPIRY'::varchar, 'PAYMENT_DEBIT'::varchar, 'PAYMENT_CREDIT'::varchar])::text[]));
ALTER TABLE "public"."money_entries" DROP CONSTRAINT "money_entries_check2";
ALTER TABLE "public"."money_entries" ADD CONSTRAINT "money_entries_check2"
  CHECK (((entry_type IN ('PURCHASE','EXPIRY','PAYMENT_DEBIT')) AND signed_amount < 0) OR ((entry_type IN ('TOPUP','BASE_ALLOCATION','REWARD_ALLOCATION','REFUND','PAYMENT_CREDIT')) AND signed_amount > 0));

CREATE TABLE "public"."payment_requests" (
  "payment_request_id" UUID NOT NULL,
  "seller_id" BIGINT NOT NULL,
  "shop_id" BIGINT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "status" VARCHAR(16) NOT NULL DEFAULT 'PENDING',
  "customer_id" BIGINT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paid_at" TIMESTAMPTZ(6),
  CONSTRAINT "payment_requests_pkey" PRIMARY KEY ("payment_request_id"),
  CONSTRAINT "payment_requests_amount_check" CHECK (amount > 0),
  CONSTRAINT "payment_requests_status_check" CHECK (status IN ('PENDING','PAID')),
  CONSTRAINT "payment_requests_paid_check" CHECK ((status = 'PAID') = (customer_id IS NOT NULL AND paid_at IS NOT NULL))
);
CREATE INDEX "ix_payment_requests_seller" ON "public"."payment_requests"("seller_id", "created_at");
CREATE INDEX "ix_payment_requests_customer" ON "public"."payment_requests"("customer_id", "paid_at");
ALTER TABLE "public"."payment_requests" ADD CONSTRAINT "payment_requests_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."payment_requests" ADD CONSTRAINT "payment_requests_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."payment_requests" ADD CONSTRAINT "payment_requests_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."money_entries" ADD COLUMN "payment_request_id" UUID;
CREATE INDEX "ix_money_payment_request" ON "public"."money_entries"("payment_request_id");
CREATE UNIQUE INDEX "uq_money_payment_wallet" ON "public"."money_entries"("payment_request_id", "wallet_id") WHERE payment_request_id IS NOT NULL;
ALTER TABLE "public"."money_entries" ADD CONSTRAINT "money_entries_payment_request_id_fkey" FOREIGN KEY ("payment_request_id") REFERENCES "public"."payment_requests"("payment_request_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
