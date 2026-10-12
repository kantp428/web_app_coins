import 'dotenv/config';
import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import pg from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { seedHistoricalRules } from './seed-coin-rules.mjs';
import { seedCurrentRule } from './seed-current-coin-rule.mjs';
const schema = `qa_historical_rules_${Date.now()}`;
const admin = new pg.Client({ connectionString: process.env.DATABASE_URL });
await admin.connect();
let db;
try {
  await admin.query(`CREATE SCHEMA "${schema}"`);
  await admin.query(`SET search_path TO "${schema}"`);
  for (const dir of (await readdir(new URL('./migrations/', import.meta.url)))
    .filter((n) => n !== 'migration_lock.toml')
    .sort()) {
    await admin.query(
      (
        await readFile(
          new URL(`./migrations/${dir}/migration.sql`, import.meta.url),
          'utf8',
        )
      ).replaceAll('"public"', `"${schema}"`),
    );
  }
  db = new PrismaClient({
    adapter: new PrismaPg(
      { connectionString: process.env.DATABASE_URL },
      { schema },
    ),
  });
  await db.users.create({
    data: {
      login_identifier: 'demo_government',
      password_hash: 'unused',
      role: 'GOVERNMENT',
      display_name: 'QA',
    },
  });
  assert.ok(
    (await seedHistoricalRules(db)).every((r) => r.status === 'created'),
  );
  assert.ok(
    (await seedHistoricalRules(db)).every((r) => r.status === 'existing'),
  );
  assert.equal(await db.coin_rule_versions.count(), 3);
  await db.coin_rule_versions.update({
    where: { version: 2 },
    data: { minimum_purchase: '99.00' },
  });
  await assert.rejects(seedHistoricalRules(db), /already belongs/);
  assert.equal(
    (
      await db.coin_rule_versions.findUnique({ where: { version: 2 } })
    ).minimum_purchase.toFixed(2),
    '99.00',
  );
  assert.equal(await db.coin_rule_versions.count(), 3);
  assert.deepEqual(await seedCurrentRule(db), {
    version: 4,
    status: 'created',
    effectiveFrom: (
      await db.coin_rule_versions.findUnique({ where: { version: 4 } })
    )?.effective_from,
  });
  assert.deepEqual(await seedCurrentRule(db), {
    version: 4,
    status: 'existing',
  });
  const active = await db.coin_rule_versions.findUnique({
    where: { version: 4 },
  });
  assert.ok(active.effective_from <= new Date());
  assert.equal(active.effective_to, null);
  assert.equal(await db.coin_rule_versions.count(), 4);
  console.log(
    'PASS clean migration + historical seed, idempotency, collision refusal, existing data preserved. QA schema removed.',
  );
} finally {
  await db?.$disconnect();
  await admin.query('SET search_path TO public');
  await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
  await admin.end();
}
