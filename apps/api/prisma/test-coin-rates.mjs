import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import pg from 'pg';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query('BEGIN');
  // Transactional isolated schema: no application data or migration history changed.
  await client.query('CREATE SCHEMA coin_rates_migration_test');
  await client.query('SET LOCAL search_path TO coin_rates_migration_test');
  await client.query(`CREATE TABLE shops (shop_id bigint PRIMARY KEY);
    CREATE TABLE coin_rule_versions (rule_id bigint PRIMARY KEY);
    INSERT INTO shops VALUES (1), (2);
    INSERT INTO coin_rule_versions VALUES (1);`);
  const sql = await readFile(
    new URL(
      './migrations/20261012005000_coin_rate_periods/migration.sql',
      import.meta.url,
    ),
    'utf8',
  );
  await client.query(sql.replace(/^BEGIN;|^COMMIT;/gm, ''));
  async function rejects(sql, code) {
    await client.query('SAVEPOINT invalid_case');
    let actual;
    try {
      await client.query(sql);
    } catch (error) {
      actual = error.code;
    }
    await client.query('ROLLBACK TO SAVEPOINT invalid_case');
    assert.equal(actual, code);
  }
  await client.query(`INSERT INTO coin_rate_periods (starts_at, ends_at) VALUES
    ('2026-10-12 06:00+07', '2026-10-12 18:00+07'),
    ('2026-10-12 18:00+07', '2026-10-13 06:00+07');`);
  await rejects(
    `INSERT INTO coin_rate_periods (starts_at,ends_at) VALUES ('2026-10-12 07:00+07','2026-10-12 19:00+07')`,
    '23P01',
  );
  await rejects(
    `INSERT INTO coin_rate_periods (starts_at,ends_at) VALUES ('2026-10-14 06:00+07','2026-10-14 06:00+07')`,
    '23514',
  );
  const insert = (
    shop = 1,
    coins = 10,
    sales = 100,
  ) => `INSERT INTO shop_coin_rates
    (period_id,shop_id,rule_id,new_customer_coins,repeat_customer_coins,sales_total_snapshot,sales_window_starts_at,sales_window_ends_at)
    VALUES (1,${shop},1,${coins},1,${sales},'2026-10-05 06:00+07','2026-10-12 06:00+07')`;
  await client.query(insert());
  await rejects(insert(), '23505');
  await rejects(insert(999), '23503');
  await rejects(insert(2, 11), '23514');
  await rejects(insert(2, 10, -1), '23514');
  await client.query(insert(2));
  assert.equal(
    (await client.query('SELECT count(*)::int AS count FROM shop_coin_rates'))
      .rows[0].count,
    2,
  );
  console.log(
    'PASS: adjacent periods, overlap/window checks, rate uniqueness, foreign keys, Coin bounds, nonnegative sales; rolled back.',
  );
} finally {
  await client.query('ROLLBACK');
  await client.end();
}
