-- Combined schema: 01-core.sql + 02-rewards.sql
-- PostgreSQL 16+ / UTF-8. Run once on an empty database.
-- Merged for single-file import into ERD/schema-visualization tools.

BEGIN;

-- ============================================================
-- Part 1: Core (originally 01-core.sql)
-- Logical group: images/er-core.png.
-- ============================================================

CREATE TABLE users (
    user_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    login_identifier varchar(255) NOT NULL UNIQUE,
    password_hash text NOT NULL,
    role varchar(16) NOT NULL CHECK (role IN ('CUSTOMER', 'SELLER', 'GOVERNMENT')),
    display_name varchar(200) NOT NULL,
    interests jsonb NOT NULL DEFAULT '[]',
    status varchar(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, role)
);

CREATE TABLE shops (
    shop_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    owner_id bigint NOT NULL,
    owner_role varchar(16) NOT NULL DEFAULT 'SELLER' CHECK (owner_role = 'SELLER'),
    name varchar(200) NOT NULL,
    category varchar(100) NOT NULL,
    area_code varchar(20) NOT NULL,
    latitude numeric(9,6) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude numeric(9,6) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    opening_hours jsonb NOT NULL DEFAULT '{}',
    participation_status varchar(16) NOT NULL DEFAULT 'PENDING'
        CHECK (participation_status IN ('PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED')),
    size_class varchar(16) NOT NULL CHECK (size_class IN ('SMALL', 'MEDIUM', 'LARGE')),
    FOREIGN KEY (owner_id, owner_role) REFERENCES users (user_id, role)
);

CREATE TABLE wallets (
    wallet_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id bigint NOT NULL,
    user_role varchar(16) NOT NULL DEFAULT 'CUSTOMER' CHECK (user_role = 'CUSTOMER'),
    wallet_type varchar(16) NOT NULL CHECK (wallet_type IN ('CASH', 'BASE', 'REWARD')),
    currency char(3) NOT NULL DEFAULT 'THB' CHECK (currency = 'THB'),
    status varchar(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FROZEN')),
    FOREIGN KEY (user_id, user_role) REFERENCES users (user_id, role),
    UNIQUE (user_id, wallet_type),
    UNIQUE (wallet_id, user_id, wallet_type)
);

CREATE TABLE purchases (
    purchase_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id bigint NOT NULL,
    customer_role varchar(16) NOT NULL DEFAULT 'CUSTOMER' CHECK (customer_role = 'CUSTOMER'),
    shop_id bigint NOT NULL REFERENCES shops (shop_id),
    rule_id bigint NOT NULL, -- FK installed below (Part 2)
    total_amount numeric(14,2) NOT NULL CHECK (total_amount > 0),
    customer_paid numeric(14,2) NOT NULL CHECK (customer_paid >= 0),
    base_subsidy_used numeric(14,2) NOT NULL DEFAULT 0 CHECK (base_subsidy_used >= 0),
    reward_subsidy_used numeric(14,2) NOT NULL DEFAULT 0 CHECK (reward_subsidy_used >= 0),
    subsidy_used numeric(14,2) GENERATED ALWAYS AS (base_subsidy_used + reward_subsidy_used) STORED,
    status varchar(16) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED')),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at timestamptz,
    refunded_at timestamptz,
    shop_area_snapshot varchar(20) NOT NULL,
    shop_size_snapshot varchar(16) NOT NULL CHECK (shop_size_snapshot IN ('SMALL', 'MEDIUM', 'LARGE')),
    idempotency_key varchar(200) NOT NULL UNIQUE,
    FOREIGN KEY (customer_id, customer_role) REFERENCES users (user_id, role),
    CHECK (total_amount = customer_paid + base_subsidy_used + reward_subsidy_used),
    CHECK ((status IN ('SUCCEEDED', 'REFUNDED')) = (confirmed_at IS NOT NULL)),
    CHECK ((status = 'REFUNDED') = (refunded_at IS NOT NULL)),
    CHECK (confirmed_at IS NULL OR confirmed_at >= created_at),
    CHECK (refunded_at IS NULL OR refunded_at >= confirmed_at),
    UNIQUE (purchase_id, customer_id),
    UNIQUE (purchase_id, customer_id, rule_id)
);

CREATE TABLE money_entries (
    entry_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idempotency_key varchar(200) NOT NULL UNIQUE,
    wallet_id bigint NOT NULL,
    user_id bigint NOT NULL,
    wallet_type varchar(16) NOT NULL,
    purchase_id bigint,
    grant_id bigint, -- FK installed below (Part 2)
    signed_amount numeric(14,2) NOT NULL CHECK (signed_amount <> 0),
    entry_type varchar(24) NOT NULL
        CHECK (entry_type IN ('TOPUP', 'BASE_ALLOCATION', 'REWARD_ALLOCATION', 'PURCHASE', 'REFUND', 'EXPIRY')),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id, user_id, wallet_type) REFERENCES wallets (wallet_id, user_id, wallet_type),
    FOREIGN KEY (purchase_id, user_id) REFERENCES purchases (purchase_id, customer_id),
    CHECK ((wallet_type = 'REWARD') = (grant_id IS NOT NULL)),
    CHECK ((entry_type IN ('PURCHASE', 'REFUND')) = (purchase_id IS NOT NULL)),
    CHECK ((entry_type IN ('PURCHASE', 'EXPIRY') AND signed_amount < 0)
        OR (entry_type IN ('TOPUP', 'BASE_ALLOCATION', 'REWARD_ALLOCATION', 'REFUND') AND signed_amount > 0)),
    CHECK (entry_type <> 'TOPUP' OR wallet_type = 'CASH'),
    CHECK (entry_type <> 'BASE_ALLOCATION' OR wallet_type = 'BASE'),
    CHECK (entry_type <> 'REWARD_ALLOCATION' OR wallet_type = 'REWARD'),
    CHECK (entry_type <> 'EXPIRY' OR wallet_type IN ('BASE', 'REWARD'))
);

-- One debit and one full refund per payment source; this prototype excludes partial refunds.
CREATE UNIQUE INDEX uq_money_purchase_source ON money_entries (purchase_id, wallet_id, entry_type)
    WHERE entry_type IN ('PURCHASE', 'REFUND');
CREATE UNIQUE INDEX uq_reward_allocation ON money_entries (grant_id)
    WHERE entry_type = 'REWARD_ALLOCATION';
CREATE INDEX ix_shops_map ON shops (participation_status, area_code, category);
CREATE INDEX ix_purchases_customer_shop ON purchases (customer_id, shop_id, confirmed_at);
CREATE INDEX ix_purchases_report ON purchases (confirmed_at, shop_area_snapshot, shop_size_snapshot);
CREATE INDEX ix_money_wallet ON money_entries (wallet_id, created_at);
CREATE INDEX ix_money_grant ON money_entries (grant_id, entry_type);

-- ============================================================
-- Part 2: Rewards (originally 02-rewards.sql)
-- Logical group: images/er-rewards.png; no policy-comparison or rule-audit feature.
-- ============================================================

CREATE TABLE monthly_periods (
    period_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    month_key date NOT NULL UNIQUE CHECK (EXTRACT(DAY FROM month_key) = 1),
    starts_at timestamptz NOT NULL,
    ends_at timestamptz NOT NULL,
    timezone varchar(40) NOT NULL DEFAULT 'Asia/Bangkok' CHECK (timezone = 'Asia/Bangkok'),
    budget_limit numeric(14,2) NOT NULL CHECK (budget_limit >= 0),
    coin_target integer NOT NULL DEFAULT 100 CHECK (coin_target = 100),
    reward_amount numeric(14,2) NOT NULL DEFAULT 100 CHECK (reward_amount = 100),
    status varchar(16) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'OPEN', 'CLOSED')),
    CHECK (starts_at = (month_key::timestamp AT TIME ZONE 'Asia/Bangkok')),
    CHECK (ends_at = ((month_key + INTERVAL '1 month')::timestamp AT TIME ZONE 'Asia/Bangkok')),
    UNIQUE (period_id, ends_at)
);

-- Immutable calculation versions are retained for FR-G02 and transaction reproducibility.
-- They do not expose a rule-change-history feature to government users.
CREATE TABLE coin_rule_versions (
    rule_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    version integer NOT NULL UNIQUE CHECK (version > 0),
    created_by bigint NOT NULL,
    creator_role varchar(16) NOT NULL DEFAULT 'GOVERNMENT' CHECK (creator_role = 'GOVERNMENT'),
    effective_from timestamptz NOT NULL,
    effective_to timestamptz,
    minimum_purchase numeric(14,2) NOT NULL CHECK (minimum_purchase > 0),
    low_sales_threshold numeric(14,2) NOT NULL CHECK (low_sales_threshold >= 0),
    sales_window_days integer NOT NULL CHECK (sales_window_days > 0),
    repeat_coins smallint NOT NULL DEFAULT 1 CHECK (repeat_coins = 1),
    new_low_sales_coins smallint NOT NULL CHECK (new_low_sales_coins BETWEEN 8 AND 10),
    new_other_coins smallint NOT NULL CHECK (new_other_coins BETWEEN 1 AND 10),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by, creator_role) REFERENCES users (user_id, role),
    CHECK (effective_to IS NULL OR effective_to > effective_from),
    CHECK (new_other_coins <= new_low_sales_coins)
);

CREATE TABLE coin_entries (
    coin_entry_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id bigint NOT NULL REFERENCES users (user_id),
    period_id bigint NOT NULL REFERENCES monthly_periods (period_id),
    purchase_id bigint NOT NULL UNIQUE,
    rule_id bigint NOT NULL REFERENCES coin_rule_versions (rule_id),
    coins smallint NOT NULL CHECK (coins BETWEEN 1 AND 10),
    awarded_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reversed_at timestamptz, -- Full refund: retain the award and exclude it from net progress.
    FOREIGN KEY (purchase_id, user_id, rule_id) REFERENCES purchases (purchase_id, customer_id, rule_id),
    CHECK (reversed_at IS NULL OR reversed_at >= awarded_at)
);

CREATE TABLE reward_grants (
    grant_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id bigint NOT NULL,
    user_role varchar(16) NOT NULL DEFAULT 'CUSTOMER' CHECK (user_role = 'CUSTOMER'),
    period_id bigint NOT NULL,
    amount numeric(14,2) NOT NULL DEFAULT 100 CHECK (amount = 100),
    granted_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamptz NOT NULL,
    FOREIGN KEY (user_id, user_role) REFERENCES users (user_id, role),
    FOREIGN KEY (period_id, expires_at) REFERENCES monthly_periods (period_id, ends_at),
    CHECK (granted_at < expires_at),
    UNIQUE (user_id, period_id),
    UNIQUE (grant_id, user_id)
);

ALTER TABLE purchases ADD CONSTRAINT fk_purchase_rule
    FOREIGN KEY (rule_id) REFERENCES coin_rule_versions (rule_id);
ALTER TABLE money_entries ADD CONSTRAINT fk_money_grant_owner
    FOREIGN KEY (grant_id, user_id) REFERENCES reward_grants (grant_id, user_id);

CREATE INDEX ix_coins_user_period ON coin_entries (user_id, period_id);
CREATE INDEX ix_grants_period ON reward_grants (period_id);

CREATE VIEW v_monthly_coin_progress AS
SELECT user_id, period_id,
       SUM(CASE WHEN reversed_at IS NULL THEN coins ELSE 0 END) AS coins_total
FROM coin_entries
GROUP BY user_id, period_id;

-- Pre-aggregate entries per grant BEFORE joining months: grants must not be counted repeatedly.
-- Allocation and expiry entries are deliberately excluded from actual spending.
CREATE VIEW v_main_quest_grant_balances AS
WITH usage AS (
    SELECT grant_id,
           SUM(CASE WHEN entry_type = 'PURCHASE' THEN -signed_amount ELSE 0 END) AS gross_used,
           SUM(CASE WHEN entry_type = 'REFUND' THEN signed_amount ELSE 0 END) AS refunded
    FROM money_entries
    WHERE grant_id IS NOT NULL
    GROUP BY grant_id
)
SELECT g.grant_id, g.user_id, g.period_id, g.amount, g.granted_at, g.expires_at,
       COALESCE(u.gross_used, 0) AS gross_used,
       COALESCE(u.refunded, 0) AS refunded,
       COALESCE(u.gross_used, 0) - COALESCE(u.refunded, 0) AS net_used,
       CASE WHEN CURRENT_TIMESTAMP < g.expires_at
            THEN g.amount - COALESCE(u.gross_used, 0) + COALESCE(u.refunded, 0)
            ELSE 0 END AS available_remaining,
       CASE WHEN CURRENT_TIMESTAMP >= g.expires_at
            THEN g.amount - COALESCE(u.gross_used, 0) + COALESCE(u.refunded, 0)
            ELSE 0 END AS expired_unused
FROM reward_grants g
LEFT JOIN usage u ON u.grant_id = g.grant_id;

-- FR-G03: monthly Main Quest budget and expense view (THB).
-- A late refund restates the original grant month's net expense, not the refund month.
-- This view includes every configured month, even with no grants or transactions.
CREATE VIEW v_main_quest_monthly_expenses AS
SELECT p.period_id, p.month_key, p.budget_limit,
       COUNT(g.grant_id) AS recipient_count,
       COALESCE(SUM(g.amount), 0) AS granted_amount,
       p.budget_limit - COALESCE(SUM(g.amount), 0) AS unallocated_budget,
       COALESCE(SUM(g.gross_used), 0) AS gross_used_amount,
       COALESCE(SUM(g.refunded), 0) AS refunded_amount,
       COALESCE(SUM(g.net_used), 0) AS actual_expense,
       COALESCE(SUM(g.available_remaining), 0) AS available_remaining,
       COALESCE(SUM(g.expired_unused), 0) AS expired_unused,
       p.budget_limit - COALESCE(SUM(g.net_used), 0) AS budget_not_spent,
       CURRENT_TIMESTAMP AS calculated_at
FROM monthly_periods p
LEFT JOIN v_main_quest_grant_balances g ON g.period_id = p.period_id
GROUP BY p.period_id, p.month_key, p.budget_limit;

-- CASH/BASE use their ledger balance. REWARD availability respects expiry immediately,
-- even if the background job has not yet posted the corresponding EXPIRY entry.
CREATE VIEW v_wallet_balances AS
SELECT w.wallet_id, w.user_id, w.wallet_type,
       CASE WHEN w.wallet_type = 'REWARD'
            THEN COALESCE((SELECT SUM(g.available_remaining)
                           FROM v_main_quest_grant_balances g WHERE g.user_id = w.user_id), 0)
            ELSE COALESCE((SELECT SUM(e.signed_amount)
                           FROM money_entries e WHERE e.wallet_id = w.wallet_id), 0)
       END AS available_balance
FROM wallets w;

COMMIT;