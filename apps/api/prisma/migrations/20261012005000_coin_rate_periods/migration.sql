BEGIN;

CREATE TABLE "coin_rate_periods" (
  "period_id" BIGSERIAL PRIMARY KEY,
  "starts_at" TIMESTAMPTZ(6) NOT NULL UNIQUE,
  "ends_at" TIMESTAMPTZ(6) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "coin_rate_periods_valid_window" CHECK ("starts_at" < "ends_at"),
  CONSTRAINT "coin_rate_periods_no_overlap" EXCLUDE USING gist
    (tstzrange("starts_at", "ends_at", '[)') WITH &&)
);

CREATE TABLE "shop_coin_rates" (
  "shop_coin_rate_id" BIGSERIAL PRIMARY KEY,
  "period_id" BIGINT NOT NULL REFERENCES "coin_rate_periods"("period_id") ON DELETE NO ACTION ON UPDATE NO ACTION,
  "shop_id" BIGINT NOT NULL REFERENCES "shops"("shop_id") ON DELETE NO ACTION ON UPDATE NO ACTION,
  "rule_id" BIGINT NOT NULL REFERENCES "coin_rule_versions"("rule_id") ON DELETE NO ACTION ON UPDATE NO ACTION,
  "new_customer_coins" SMALLINT NOT NULL,
  "repeat_customer_coins" SMALLINT NOT NULL,
  "sales_total_snapshot" DECIMAL(14,2) NOT NULL,
  "sales_window_starts_at" TIMESTAMPTZ(6) NOT NULL,
  "sales_window_ends_at" TIMESTAMPTZ(6) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "shop_coin_rates_coins_check" CHECK ("new_customer_coins" BETWEEN 1 AND 10 AND "repeat_customer_coins" BETWEEN 1 AND 10),
  CONSTRAINT "shop_coin_rates_sales_check" CHECK ("sales_total_snapshot" >= 0),
  CONSTRAINT "shop_coin_rates_window_check" CHECK ("sales_window_starts_at" < "sales_window_ends_at")
);
CREATE UNIQUE INDEX "shop_coin_rates_shop_id_period_id_key" ON "shop_coin_rates"("shop_id", "period_id");
CREATE INDEX "shop_coin_rates_period_id_idx" ON "shop_coin_rates"("period_id");
CREATE INDEX "shop_coin_rates_rule_id_idx" ON "shop_coin_rates"("rule_id");

COMMIT;
