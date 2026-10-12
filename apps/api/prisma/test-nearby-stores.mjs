import 'dotenv/config';
import 'reflect-metadata';
import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import pg from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import { StoresService } from '../dist/stores/stores.controller.js';
const schema = `qa_nearby_${Date.now()}`;
const admin = new pg.Client({ connectionString: process.env.DATABASE_URL });
await admin.connect();
let service;
try {
  await admin.query(`CREATE SCHEMA "${schema}"`);
  await admin.query(`SET search_path TO "${schema}"`);
  for (const dir of (await readdir(new URL('./migrations/', import.meta.url)))
    .filter((n) => n !== 'migration_lock.toml')
    .sort())
    await admin.query(
      (
        await readFile(
          new URL(`./migrations/${dir}/migration.sql`, import.meta.url),
          'utf8',
        )
      ).replaceAll('"public"', `"${schema}"`),
    );
  await admin.query(`INSERT INTO users (user_id,login_identifier,password_hash,role,display_name) VALUES(1,'seller','unused','SELLER','QA');
 INSERT INTO shops (shop_id,owner_id,name,latitude,longitude,size_class,participation_status) VALUES (1,1,'Nearest',13.75,100.5,'SMALL','APPROVED'),(2,1,'Nearby',13.76,100.5,'SMALL','APPROVED'),(3,1,'Far',14.75,100.5,'SMALL','APPROVED'),(4,1,'Pending',13.75,100.5,'SMALL','PENDING'),(5,1,'Across date line',0,-179.99,'SMALL','APPROVED');`);
  const url = new URL(process.env.DATABASE_URL);
  url.hostname = url.hostname.replace('-pooler', '');
  url.searchParams.set('options', `-c search_path=${schema}`);
  service = new StoresService(
    new ConfigService({ DATABASE_URL: url.toString() }),
    { me: async () => ({ id: '2', role: 'CUSTOMER' }) },
  );
  await service.db.$disconnect();
  service.db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url.toString() }, { schema }),
  });
  await admin.query(
    "UPDATE shops SET description='ร้านอาหารอีสาน ส้มตำ ลาบ ไก่ย่าง' WHERE shop_id=1",
  );
  await assert.rejects(
    admin.query("UPDATE shops SET description='   ' WHERE shop_id=2"),
    { code: '23514' },
  );
  const result = await service.list({
    latitude: '13.75',
    longitude: '100.5',
    radiusKm: '5',
  });
  assert.deepEqual(
    result.stores.map((s) => s.name),
    ['Nearest', 'Nearby'],
  );
  assert.equal(
    result.stores[0].description,
    'ร้านอาหารอีสาน ส้มตำ ลาบ ไก่ย่าง',
  );
  assert.equal(result.stores[1].description, null);
  assert.ok(result.stores[0].distanceKm < 0.001);
  assert.ok(result.stores[1].distanceKm > 1);
  assert.equal(
    (await service.list({ latitude: '0', longitude: '179.99', radiusKm: '5' }))
      .stores[0].name,
    'Across date line',
  );
  assert.equal(
    (await service.list({ latitude: '-80', longitude: '0' })).stores.length,
    0,
  );
  const columns = await admin.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name='shops'",
    [schema],
  );
  assert.ok(!columns.rows.some((r) => r.column_name === 'area_code'));
  console.log(
    'PASS clean migrations, register-compatible shop insert without area_code, approved-only distance ordering/radius, zero distance/date line/empty. QA schema removed.',
  );
} finally {
  await service?.onModuleDestroy();
  await admin.query('SET search_path TO public');
  await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
  await admin.end();
}
