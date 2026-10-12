import 'dotenv/config';
import 'reflect-metadata';
import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import pg from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import { CoinRulesService } from '../dist/coin-rules/coin-rules.controller.js';
const schema = `qa_coin_rules_${Date.now()}`;
const admin = new pg.Client({ connectionString: process.env.DATABASE_URL });
await admin.connect();
let service;
try {
  await admin.query(`CREATE SCHEMA "${schema}"`);
  await admin.query(`SET search_path TO "${schema}"`);
  const dirs = (await readdir(new URL('./migrations/', import.meta.url)))
    .filter((n) => n !== 'migration_lock.toml')
    .sort();
  for (const dir of dirs) {
    const sql = await readFile(
      new URL(`./migrations/${dir}/migration.sql`, import.meta.url),
      'utf8',
    );
    await admin.query(sql.replaceAll('"public"', `"${schema}"`));
  }
  await admin.query(
    `INSERT INTO users (user_id,login_identifier,password_hash,role,display_name) VALUES (1,'qa_officer','unused','GOVERNMENT','QA')`,
  );
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set('options', `-c search_path=${schema}`);
  service = new CoinRulesService(
    new ConfigService({ DATABASE_URL: url.toString() }),
    { me: async () => ({ id: '1', role: 'GOVERNMENT' }) },
  );
  await service.db.$disconnect();
  service.db = new PrismaClient({
    adapter: new PrismaPg(
      { connectionString: process.env.DATABASE_URL },
      { schema },
    ),
  });
  const body = {
    minimumPurchase: '50.00',
    lowSalesThreshold: '10000.00',
    salesWindowDays: 7,
    repeatCoins: 1,
    newLowSalesCoins: 10,
    newOtherCoins: 5,
  };
  const results = await Promise.allSettled([
    service.create(body),
    service.create(body),
  ]);
  if (results.every((r) => r.status === 'rejected'))
    console.log(
      results.map((r) => ({ code: r.reason.code, message: r.reason.message })),
    );
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal(results.find((r) => r.status === 'rejected').reason.status, 409);
  let data = await service.list();
  assert.equal(data.rules.length, 1);
  assert.equal(data.rules[0].created_by, '1');
  assert.equal(data.rules[0].minimum_purchase, '50');
  await admin.query(`UPDATE coin_rule_versions SET effective_from=$1`, [
    new Date(Date.now() - 86400000),
  ]);
  await service.create({ ...body, newOtherCoins: 6 });
  data = await service.list();
  assert.equal(data.rules.length, 2);
  assert.equal(data.rules[0].version, 2);
  assert.equal(data.rules[1].effective_to, data.rules[0].effective_from);
  assert.equal(data.rules[1].new_other_coins, 5);
  console.log(
    'PASS full clean migration chain + concurrent create (one201/one409), persistence/read, version rollover and old values preserved. Isolated schema removed.',
  );
} finally {
  await service?.onModuleDestroy();
  await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
  await admin.end();
}
