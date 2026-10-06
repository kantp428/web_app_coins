-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."coin_entries" (
    "coin_entry_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "period_id" BIGINT NOT NULL,
    "purchase_id" BIGINT NOT NULL,
    "rule_id" BIGINT NOT NULL,
    "coins" SMALLINT NOT NULL,
    "awarded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reversed_at" TIMESTAMPTZ(6),

    CONSTRAINT "coin_entries_pkey" PRIMARY KEY ("coin_entry_id")
);

-- CreateTable
CREATE TABLE "public"."coin_rule_versions" (
    "rule_id" BIGSERIAL NOT NULL,
    "version" INTEGER NOT NULL,
    "created_by" BIGINT NOT NULL,
    "creator_role" VARCHAR(16) NOT NULL DEFAULT 'GOVERNMENT',
    "effective_from" TIMESTAMPTZ(6) NOT NULL,
    "effective_to" TIMESTAMPTZ(6),
    "minimum_purchase" DECIMAL(14,2) NOT NULL,
    "low_sales_threshold" DECIMAL(14,2) NOT NULL,
    "sales_window_days" INTEGER NOT NULL,
    "repeat_coins" SMALLINT NOT NULL DEFAULT 1,
    "new_low_sales_coins" SMALLINT NOT NULL,
    "new_other_coins" SMALLINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coin_rule_versions_pkey" PRIMARY KEY ("rule_id")
);

-- CreateTable
CREATE TABLE "public"."money_entries" (
    "entry_id" BIGSERIAL NOT NULL,
    "idempotency_key" VARCHAR(200) NOT NULL,
    "wallet_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "wallet_type" VARCHAR(16) NOT NULL,
    "purchase_id" BIGINT,
    "grant_id" BIGINT,
    "signed_amount" DECIMAL(14,2) NOT NULL,
    "entry_type" VARCHAR(24) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "money_entries_pkey" PRIMARY KEY ("entry_id")
);

-- CreateTable
CREATE TABLE "public"."monthly_periods" (
    "period_id" BIGSERIAL NOT NULL,
    "month_key" DATE NOT NULL,
    "starts_at" TIMESTAMPTZ(6) NOT NULL,
    "ends_at" TIMESTAMPTZ(6) NOT NULL,
    "timezone" VARCHAR(40) NOT NULL DEFAULT 'Asia/Bangkok',
    "budget_limit" DECIMAL(14,2) NOT NULL,
    "coin_target" INTEGER NOT NULL DEFAULT 100,
    "reward_amount" DECIMAL(14,2) NOT NULL DEFAULT 100,
    "status" VARCHAR(16) NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "monthly_periods_pkey" PRIMARY KEY ("period_id")
);

-- CreateTable
CREATE TABLE "public"."purchases" (
    "purchase_id" BIGSERIAL NOT NULL,
    "customer_id" BIGINT NOT NULL,
    "customer_role" VARCHAR(16) NOT NULL DEFAULT 'CUSTOMER',
    "shop_id" BIGINT NOT NULL,
    "rule_id" BIGINT NOT NULL,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "customer_paid" DECIMAL(14,2) NOT NULL,
    "base_subsidy_used" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "reward_subsidy_used" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "subsidy_used" DECIMAL(14,2) GENERATED ALWAYS AS ((base_subsidy_used + reward_subsidy_used)) STORED,
    "status" VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMPTZ(6),
    "refunded_at" TIMESTAMPTZ(6),
    "shop_area_snapshot" VARCHAR(20) NOT NULL,
    "shop_size_snapshot" VARCHAR(16) NOT NULL,
    "idempotency_key" VARCHAR(200) NOT NULL,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("purchase_id")
);

-- CreateTable
CREATE TABLE "public"."reward_grants" (
    "grant_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "user_role" VARCHAR(16) NOT NULL DEFAULT 'CUSTOMER',
    "period_id" BIGINT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL DEFAULT 100,
    "granted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "reward_grants_pkey" PRIMARY KEY ("grant_id")
);

-- CreateTable
CREATE TABLE "public"."shops" (
    "shop_id" BIGSERIAL NOT NULL,
    "owner_id" BIGINT NOT NULL,
    "owner_role" VARCHAR(16) NOT NULL DEFAULT 'SELLER',
    "name" VARCHAR(200) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "area_code" VARCHAR(20) NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "opening_hours" JSONB NOT NULL DEFAULT '{}',
    "participation_status" VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    "size_class" VARCHAR(16) NOT NULL,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("shop_id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "user_id" BIGSERIAL NOT NULL,
    "login_identifier" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" VARCHAR(16) NOT NULL,
    "display_name" VARCHAR(200) NOT NULL,
    "interests" JSONB NOT NULL DEFAULT '[]',
    "status" VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."wallets" (
    "wallet_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "user_role" VARCHAR(16) NOT NULL DEFAULT 'CUSTOMER',
    "wallet_type" VARCHAR(16) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'THB',
    "status" VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("wallet_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coin_entries_purchase_id_key" ON "public"."coin_entries"("purchase_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "coin_entries_purchase_id_user_id_rule_id_key" ON "public"."coin_entries"("purchase_id" ASC, "user_id" ASC, "rule_id" ASC);

-- CreateIndex
CREATE INDEX "ix_coins_user_period" ON "public"."coin_entries"("user_id" ASC, "period_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "coin_rule_versions_version_key" ON "public"."coin_rule_versions"("version" ASC);

-- CreateIndex
CREATE INDEX "ix_money_grant" ON "public"."money_entries"("grant_id" ASC, "entry_type" ASC);

-- CreateIndex
CREATE INDEX "ix_money_wallet" ON "public"."money_entries"("wallet_id" ASC, "created_at" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "money_entries_idempotency_key_key" ON "public"."money_entries"("idempotency_key" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "uq_money_purchase_source" ON "public"."money_entries"("purchase_id" ASC, "wallet_id" ASC, "entry_type" ASC) WHERE ((entry_type)::text = ANY ((ARRAY['PURCHASE'::character varying, 'REFUND'::character varying])::text[]));

-- CreateIndex
CREATE UNIQUE INDEX "uq_reward_allocation" ON "public"."money_entries"("grant_id" ASC) WHERE ((entry_type)::text = 'REWARD_ALLOCATION'::text);

-- CreateIndex
CREATE UNIQUE INDEX "monthly_periods_month_key_key" ON "public"."monthly_periods"("month_key" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "monthly_periods_period_id_ends_at_key" ON "public"."monthly_periods"("period_id" ASC, "ends_at" ASC);

-- CreateIndex
CREATE INDEX "ix_purchases_customer_shop" ON "public"."purchases"("customer_id" ASC, "shop_id" ASC, "confirmed_at" ASC);

-- CreateIndex
CREATE INDEX "ix_purchases_report" ON "public"."purchases"("confirmed_at" ASC, "shop_area_snapshot" ASC, "shop_size_snapshot" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "purchases_idempotency_key_key" ON "public"."purchases"("idempotency_key" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "purchases_purchase_id_customer_id_key" ON "public"."purchases"("purchase_id" ASC, "customer_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "purchases_purchase_id_customer_id_rule_id_key" ON "public"."purchases"("purchase_id" ASC, "customer_id" ASC, "rule_id" ASC);

-- CreateIndex
CREATE INDEX "ix_grants_period" ON "public"."reward_grants"("period_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "reward_grants_grant_id_user_id_key" ON "public"."reward_grants"("grant_id" ASC, "user_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "reward_grants_user_id_period_id_key" ON "public"."reward_grants"("user_id" ASC, "period_id" ASC);

-- CreateIndex
CREATE INDEX "ix_shops_map" ON "public"."shops"("participation_status" ASC, "area_code" ASC, "category" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_login_identifier_key" ON "public"."users"("login_identifier" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_user_id_role_key" ON "public"."users"("user_id" ASC, "role" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_wallet_type_key" ON "public"."wallets"("user_id" ASC, "wallet_type" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "wallets_wallet_id_user_id_wallet_type_key" ON "public"."wallets"("wallet_id" ASC, "user_id" ASC, "wallet_type" ASC);

-- AddForeignKey
ALTER TABLE "public"."coin_entries" ADD CONSTRAINT "coin_entries_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "public"."monthly_periods"("period_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."coin_entries" ADD CONSTRAINT "coin_entries_purchase_id_user_id_rule_id_fkey" FOREIGN KEY ("purchase_id", "user_id", "rule_id") REFERENCES "public"."purchases"("purchase_id", "customer_id", "rule_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."coin_entries" ADD CONSTRAINT "coin_entries_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "public"."coin_rule_versions"("rule_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."coin_entries" ADD CONSTRAINT "coin_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."coin_rule_versions" ADD CONSTRAINT "coin_rule_versions_created_by_creator_role_fkey" FOREIGN KEY ("created_by", "creator_role") REFERENCES "public"."users"("user_id", "role") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."money_entries" ADD CONSTRAINT "fk_money_grant_owner" FOREIGN KEY ("grant_id", "user_id") REFERENCES "public"."reward_grants"("grant_id", "user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."money_entries" ADD CONSTRAINT "money_entries_purchase_id_user_id_fkey" FOREIGN KEY ("purchase_id", "user_id") REFERENCES "public"."purchases"("purchase_id", "customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."money_entries" ADD CONSTRAINT "money_entries_wallet_id_user_id_wallet_type_fkey" FOREIGN KEY ("wallet_id", "user_id", "wallet_type") REFERENCES "public"."wallets"("wallet_id", "user_id", "wallet_type") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."purchases" ADD CONSTRAINT "fk_purchase_rule" FOREIGN KEY ("rule_id") REFERENCES "public"."coin_rule_versions"("rule_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."purchases" ADD CONSTRAINT "purchases_customer_id_customer_role_fkey" FOREIGN KEY ("customer_id", "customer_role") REFERENCES "public"."users"("user_id", "role") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."purchases" ADD CONSTRAINT "purchases_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("shop_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."reward_grants" ADD CONSTRAINT "reward_grants_period_id_expires_at_fkey" FOREIGN KEY ("period_id", "expires_at") REFERENCES "public"."monthly_periods"("period_id", "ends_at") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."reward_grants" ADD CONSTRAINT "reward_grants_user_id_user_role_fkey" FOREIGN KEY ("user_id", "user_role") REFERENCES "public"."users"("user_id", "role") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."shops" ADD CONSTRAINT "shops_owner_id_owner_role_fkey" FOREIGN KEY ("owner_id", "owner_role") REFERENCES "public"."users"("user_id", "role") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."wallets" ADD CONSTRAINT "wallets_user_id_user_role_fkey" FOREIGN KEY ("user_id", "user_role") REFERENCES "public"."users"("user_id", "role") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Preserve check constraints from the existing database.
ALTER TABLE "public"."coin_entries" ADD CONSTRAINT "coin_entries_check" CHECK (((reversed_at IS NULL) OR (reversed_at >= awarded_at)));
ALTER TABLE "public"."coin_entries" ADD CONSTRAINT "coin_entries_coins_check" CHECK (((coins >= 1) AND (coins <= 10)));
ALTER TABLE "public"."coin_rule_versions" ADD CONSTRAINT "coin_rule_versions_check" CHECK (((effective_to IS NULL) OR (effective_to > effective_from)));
ALTER TABLE "public"."coin_rule_versions" ADD CONSTRAINT "coin_rule_versions_check1" CHECK ((new_other_coins <= new_low_sales_coins));
ALTER TABLE "public"."coin_rule_versions" ADD CONSTRAINT "coin_rule_versions_creator_role_check" CHECK (((creator_role)::text = 'GOVERNMENT'::text));
ALTER TABLE "public"."coin_rule_versions" ADD CONSTRAINT "coin_rule_versions_low_sales_threshold_check" CHECK ((low_sales_threshold >= (0)::numeric));
ALTER TABLE "public"."coin_rule_versions" ADD CONSTRAINT "coin_rule_versions_minimum_purchase_check" CHECK ((minimum_purchase > (0)::numeric));
ALTER TABLE "public"."coin_rule_versions" ADD CONSTRAINT "coin_rule_versions_new_low_sales_coins_check" CHECK (((new_low_sales_coins >= 8) AND (new_low_sales_coins <= 10)));
ALTER TABLE "public"."coin_rule_versions" ADD CONSTRAINT "coin_rule_versions_new_other_coins_check" CHECK (((new_other_coins >= 1) AND (new_other_coins <= 10)));
ALTER TABLE "public"."coin_rule_versions" ADD CONSTRAINT "coin_rule_versions_repeat_coins_check" CHECK ((repeat_coins = 1));
ALTER TABLE "public"."coin_rule_versions" ADD CONSTRAINT "coin_rule_versions_sales_window_days_check" CHECK ((sales_window_days > 0));
ALTER TABLE "public"."coin_rule_versions" ADD CONSTRAINT "coin_rule_versions_version_check" CHECK ((version > 0));
ALTER TABLE "public"."money_entries" ADD CONSTRAINT "money_entries_check" CHECK ((((wallet_type)::text = 'REWARD'::text) = (grant_id IS NOT NULL)));
ALTER TABLE "public"."money_entries" ADD CONSTRAINT "money_entries_check1" CHECK ((((entry_type)::text = ANY ((ARRAY['PURCHASE'::character varying, 'REFUND'::character varying])::text[])) = (purchase_id IS NOT NULL)));
ALTER TABLE "public"."money_entries" ADD CONSTRAINT "money_entries_check2" CHECK (((((entry_type)::text = ANY ((ARRAY['PURCHASE'::character varying, 'EXPIRY'::character varying])::text[])) AND (signed_amount < (0)::numeric)) OR (((entry_type)::text = ANY ((ARRAY['TOPUP'::character varying, 'BASE_ALLOCATION'::character varying, 'REWARD_ALLOCATION'::character varying, 'REFUND'::character varying])::text[])) AND (signed_amount > (0)::numeric))));
ALTER TABLE "public"."money_entries" ADD CONSTRAINT "money_entries_check3" CHECK ((((entry_type)::text <> 'TOPUP'::text) OR ((wallet_type)::text = 'CASH'::text)));
ALTER TABLE "public"."money_entries" ADD CONSTRAINT "money_entries_check4" CHECK ((((entry_type)::text <> 'BASE_ALLOCATION'::text) OR ((wallet_type)::text = 'BASE'::text)));
ALTER TABLE "public"."money_entries" ADD CONSTRAINT "money_entries_check5" CHECK ((((entry_type)::text <> 'REWARD_ALLOCATION'::text) OR ((wallet_type)::text = 'REWARD'::text)));
ALTER TABLE "public"."money_entries" ADD CONSTRAINT "money_entries_check6" CHECK ((((entry_type)::text <> 'EXPIRY'::text) OR ((wallet_type)::text = ANY ((ARRAY['BASE'::character varying, 'REWARD'::character varying])::text[]))));
ALTER TABLE "public"."money_entries" ADD CONSTRAINT "money_entries_entry_type_check" CHECK (((entry_type)::text = ANY ((ARRAY['TOPUP'::character varying, 'BASE_ALLOCATION'::character varying, 'REWARD_ALLOCATION'::character varying, 'PURCHASE'::character varying, 'REFUND'::character varying, 'EXPIRY'::character varying])::text[])));
ALTER TABLE "public"."money_entries" ADD CONSTRAINT "money_entries_signed_amount_check" CHECK ((signed_amount <> (0)::numeric));
ALTER TABLE "public"."monthly_periods" ADD CONSTRAINT "monthly_periods_budget_limit_check" CHECK ((budget_limit >= (0)::numeric));
ALTER TABLE "public"."monthly_periods" ADD CONSTRAINT "monthly_periods_check" CHECK ((starts_at = ((month_key)::timestamp without time zone AT TIME ZONE 'Asia/Bangkok'::text)));
ALTER TABLE "public"."monthly_periods" ADD CONSTRAINT "monthly_periods_check1" CHECK ((ends_at = ((month_key + '1 mon'::interval) AT TIME ZONE 'Asia/Bangkok'::text)));
ALTER TABLE "public"."monthly_periods" ADD CONSTRAINT "monthly_periods_coin_target_check" CHECK ((coin_target = 100));
ALTER TABLE "public"."monthly_periods" ADD CONSTRAINT "monthly_periods_month_key_check" CHECK ((EXTRACT(day FROM month_key) = (1)::numeric));
ALTER TABLE "public"."monthly_periods" ADD CONSTRAINT "monthly_periods_reward_amount_check" CHECK ((reward_amount = (100)::numeric));
ALTER TABLE "public"."monthly_periods" ADD CONSTRAINT "monthly_periods_status_check" CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'OPEN'::character varying, 'CLOSED'::character varying])::text[])));
ALTER TABLE "public"."monthly_periods" ADD CONSTRAINT "monthly_periods_timezone_check" CHECK (((timezone)::text = 'Asia/Bangkok'::text));
ALTER TABLE "public"."purchases" ADD CONSTRAINT "purchases_base_subsidy_used_check" CHECK ((base_subsidy_used >= (0)::numeric));
ALTER TABLE "public"."purchases" ADD CONSTRAINT "purchases_check" CHECK ((total_amount = ((customer_paid + base_subsidy_used) + reward_subsidy_used)));
ALTER TABLE "public"."purchases" ADD CONSTRAINT "purchases_check1" CHECK ((((status)::text = ANY ((ARRAY['SUCCEEDED'::character varying, 'REFUNDED'::character varying])::text[])) = (confirmed_at IS NOT NULL)));
ALTER TABLE "public"."purchases" ADD CONSTRAINT "purchases_check2" CHECK ((((status)::text = 'REFUNDED'::text) = (refunded_at IS NOT NULL)));
ALTER TABLE "public"."purchases" ADD CONSTRAINT "purchases_check3" CHECK (((confirmed_at IS NULL) OR (confirmed_at >= created_at)));
ALTER TABLE "public"."purchases" ADD CONSTRAINT "purchases_check4" CHECK (((refunded_at IS NULL) OR (refunded_at >= confirmed_at)));
ALTER TABLE "public"."purchases" ADD CONSTRAINT "purchases_customer_paid_check" CHECK ((customer_paid >= (0)::numeric));
ALTER TABLE "public"."purchases" ADD CONSTRAINT "purchases_customer_role_check" CHECK (((customer_role)::text = 'CUSTOMER'::text));
ALTER TABLE "public"."purchases" ADD CONSTRAINT "purchases_reward_subsidy_used_check" CHECK ((reward_subsidy_used >= (0)::numeric));
ALTER TABLE "public"."purchases" ADD CONSTRAINT "purchases_shop_size_snapshot_check" CHECK (((shop_size_snapshot)::text = ANY ((ARRAY['SMALL'::character varying, 'MEDIUM'::character varying, 'LARGE'::character varying])::text[])));
ALTER TABLE "public"."purchases" ADD CONSTRAINT "purchases_status_check" CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'SUCCEEDED'::character varying, 'FAILED'::character varying, 'REFUNDED'::character varying])::text[])));
ALTER TABLE "public"."purchases" ADD CONSTRAINT "purchases_total_amount_check" CHECK ((total_amount > (0)::numeric));
ALTER TABLE "public"."reward_grants" ADD CONSTRAINT "reward_grants_amount_check" CHECK ((amount = (100)::numeric));
ALTER TABLE "public"."reward_grants" ADD CONSTRAINT "reward_grants_check" CHECK ((granted_at < expires_at));
ALTER TABLE "public"."reward_grants" ADD CONSTRAINT "reward_grants_user_role_check" CHECK (((user_role)::text = 'CUSTOMER'::text));
ALTER TABLE "public"."shops" ADD CONSTRAINT "shops_latitude_check" CHECK (((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric)));
ALTER TABLE "public"."shops" ADD CONSTRAINT "shops_longitude_check" CHECK (((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric)));
ALTER TABLE "public"."shops" ADD CONSTRAINT "shops_owner_role_check" CHECK (((owner_role)::text = 'SELLER'::text));
ALTER TABLE "public"."shops" ADD CONSTRAINT "shops_participation_status_check" CHECK (((participation_status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'SUSPENDED'::character varying, 'REJECTED'::character varying])::text[])));
ALTER TABLE "public"."shops" ADD CONSTRAINT "shops_size_class_check" CHECK (((size_class)::text = ANY ((ARRAY['SMALL'::character varying, 'MEDIUM'::character varying, 'LARGE'::character varying])::text[])));
ALTER TABLE "public"."users" ADD CONSTRAINT "users_role_check" CHECK (((role)::text = ANY ((ARRAY['CUSTOMER'::character varying, 'SELLER'::character varying, 'GOVERNMENT'::character varying])::text[])));
ALTER TABLE "public"."users" ADD CONSTRAINT "users_status_check" CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'SUSPENDED'::character varying])::text[])));
ALTER TABLE "public"."wallets" ADD CONSTRAINT "wallets_currency_check" CHECK ((currency = 'THB'::bpchar));
ALTER TABLE "public"."wallets" ADD CONSTRAINT "wallets_status_check" CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'FROZEN'::character varying])::text[])));
ALTER TABLE "public"."wallets" ADD CONSTRAINT "wallets_user_role_check" CHECK (((user_role)::text = 'CUSTOMER'::text));
ALTER TABLE "public"."wallets" ADD CONSTRAINT "wallets_wallet_type_check" CHECK (((wallet_type)::text = ANY ((ARRAY['CASH'::character varying, 'BASE'::character varying, 'REWARD'::character varying])::text[])));

-- Preserve reporting views in dependency order.
CREATE VIEW "public"."v_monthly_coin_progress" AS  SELECT user_id,
    period_id,
    sum(
        CASE
            WHEN (reversed_at IS NULL) THEN (coins)::integer
            ELSE 0
        END) AS coins_total
   FROM coin_entries
  GROUP BY user_id, period_id;
CREATE VIEW "public"."v_main_quest_grant_balances" AS  WITH usage AS (
         SELECT money_entries.grant_id,
            sum(
                CASE
                    WHEN ((money_entries.entry_type)::text = 'PURCHASE'::text) THEN (- money_entries.signed_amount)
                    ELSE (0)::numeric
                END) AS gross_used,
            sum(
                CASE
                    WHEN ((money_entries.entry_type)::text = 'REFUND'::text) THEN money_entries.signed_amount
                    ELSE (0)::numeric
                END) AS refunded
           FROM money_entries
          WHERE (money_entries.grant_id IS NOT NULL)
          GROUP BY money_entries.grant_id
        )
 SELECT g.grant_id,
    g.user_id,
    g.period_id,
    g.amount,
    g.granted_at,
    g.expires_at,
    COALESCE(u.gross_used, (0)::numeric) AS gross_used,
    COALESCE(u.refunded, (0)::numeric) AS refunded,
    (COALESCE(u.gross_used, (0)::numeric) - COALESCE(u.refunded, (0)::numeric)) AS net_used,
        CASE
            WHEN (CURRENT_TIMESTAMP < g.expires_at) THEN ((g.amount - COALESCE(u.gross_used, (0)::numeric)) + COALESCE(u.refunded, (0)::numeric))
            ELSE (0)::numeric
        END AS available_remaining,
        CASE
            WHEN (CURRENT_TIMESTAMP >= g.expires_at) THEN ((g.amount - COALESCE(u.gross_used, (0)::numeric)) + COALESCE(u.refunded, (0)::numeric))
            ELSE (0)::numeric
        END AS expired_unused
   FROM (reward_grants g
     LEFT JOIN usage u ON ((u.grant_id = g.grant_id)));
CREATE VIEW "public"."v_main_quest_monthly_expenses" AS  SELECT p.period_id,
    p.month_key,
    p.budget_limit,
    count(g.grant_id) AS recipient_count,
    COALESCE(sum(g.amount), (0)::numeric) AS granted_amount,
    (p.budget_limit - COALESCE(sum(g.amount), (0)::numeric)) AS unallocated_budget,
    COALESCE(sum(g.gross_used), (0)::numeric) AS gross_used_amount,
    COALESCE(sum(g.refunded), (0)::numeric) AS refunded_amount,
    COALESCE(sum(g.net_used), (0)::numeric) AS actual_expense,
    COALESCE(sum(g.available_remaining), (0)::numeric) AS available_remaining,
    COALESCE(sum(g.expired_unused), (0)::numeric) AS expired_unused,
    (p.budget_limit - COALESCE(sum(g.net_used), (0)::numeric)) AS budget_not_spent,
    CURRENT_TIMESTAMP AS calculated_at
   FROM (monthly_periods p
     LEFT JOIN v_main_quest_grant_balances g ON ((g.period_id = p.period_id)))
  GROUP BY p.period_id, p.month_key, p.budget_limit;
CREATE VIEW "public"."v_wallet_balances" AS  SELECT wallet_id,
    user_id,
    wallet_type,
        CASE
            WHEN ((wallet_type)::text = 'REWARD'::text) THEN COALESCE(( SELECT sum(g.available_remaining) AS sum
               FROM v_main_quest_grant_balances g
              WHERE (g.user_id = w.user_id)), (0)::numeric)
            ELSE COALESCE(( SELECT sum(e.signed_amount) AS sum
               FROM money_entries e
              WHERE (e.wallet_id = w.wallet_id)), (0)::numeric)
        END AS available_balance
   FROM wallets w;
