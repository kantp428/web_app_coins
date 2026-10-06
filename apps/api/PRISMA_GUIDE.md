# Prisma Guide — THAI Please API

คู่มือนี้ใช้กับ **Prisma 7.10.0, PostgreSQL และ PowerShell** ของโปรเจกต์นี้ คำสั่งทั้งหมดรันจาก `apps/api` โดยใช้ Prisma ที่ติดตั้งในโปรเจกต์ ไม่ใช้ CLI latest เพราะคำสั่งรุ่นใหม่อาจต่างกัน

```powershell
cd C:\Users\winne\Desktop\mono\web_app_coins\apps\api
```

## ไฟล์ที่เกี่ยวข้อง

- `prisma.config.ts`: โหลด `.env`, กำหนด schema, migrations path และ URL จาก `DATABASE_URL`
- `prisma/schema.prisma`: model, field, relation และ generator ของ Client
- `prisma/migrations/<ชื่อ>/migration.sql`: ประวัติการเปลี่ยนโครงสร้างที่ต้อง commit
- `.env`: URL และข้อมูลลับ ห้าม commit; `.env.example` เก็บเฉพาะตัวอย่าง
- `_prisma_migrations`: ตารางใน DB ที่ Prisma ใช้ติดตาม migration ที่ apply แล้ว

ตรวจปลายทางของ `DATABASE_URL` ก่อนคำสั่งที่เขียน DB สำรองข้อมูลก่อนเปลี่ยนโครงสร้าง DB ที่มีข้อมูลสำคัญ

## เลือกคำสั่งให้ตรงงาน

| คำสั่ง                             | ทิศทาง / หน้าที่                                | เปลี่ยน DB       | สร้างประวัติ migration |
| ---------------------------------- | ----------------------------------------------- | ---------------- | ---------------------- |
| `prisma db pull`                   | DB → schema.prisma                              | ไม่              | ไม่                    |
| `prisma generate`                  | schema → โค้ด Client                            | ไม่              | ไม่                    |
| `prisma validate`                  | ตรวจ schema/config                              | ไม่              | ไม่                    |
| `prisma db push`                   | schema → โครงสร้าง DB โดยตรง                    | ใช่              | ไม่                    |
| `prisma migrate dev`               | สร้างและ apply migration ใน development         | ใช่              | ใช่                    |
| `prisma migrate deploy`            | apply migration ที่มีอยู่ ใน staging/production | ใช่              | ใช้ไฟล์เดิม            |
| `prisma migrate status`            | ตรวจสถานะ migration                             | ไม่              | ไม่                    |
| `prisma migrate resolve --applied` | บันทึกว่า migration ถูกทำไปแล้ว                 | เปลี่ยน metadata | ไม่รัน SQL ในไฟล์      |

**Save ใน editor** บันทึกไฟล์ในเครื่องเท่านั้น ส่วน **db push** เปลี่ยนโครงสร้าง DB ไม่ใช่การบันทึกไฟล์ และไม่ได้เพิ่ม/แก้ข้อมูลแถวสำหรับใช้งานทั่วไป

## 1. Pull: มี DB อยู่แล้ว ต้องการ model

```powershell
pnpm exec prisma db pull
pnpm exec prisma validate
pnpm exec prisma generate
```

Pull อ่านตาราง/คอลัมน์/relations จาก DB และปรับ schema ในเครื่อง ไม่เปลี่ยนข้อมูล DB แต่มีผลกับไฟล์ schema จึงควร commit หรือสำรองไฟล์ก่อน แล้ว review diff หลัง pull โดยเฉพาะ relations, nullable, Decimal, indexes และ mappings

Generate สร้าง Client สำหรับ backend ใช้ query ไม่ได้สร้างตารางหรือทดสอบการเชื่อมต่อ DB แทนการ query จริง ใน Prisma 7 ให้รัน generate เองหลังเปลี่ยน schema

ถ้ายังให้เครื่องมืออื่นหรือ DBA จัดการ schema อยู่ ใช้ workflow นี้ได้โดยไม่ต้องเริ่ม Prisma Migrate แต่ต้องเก็บประวัติ SQL ของเครื่องมือนั้น หากต้องการย้ายมาใช้ Prisma Migrate ให้ทำ baseline ก่อน

## 2. Baseline: รับ DB เดิมมาใช้ Prisma Migrate

ใช้เมื่อ DB มีตาราง/ข้อมูลแล้ว แต่ยังไม่มี migration history ของ Prisma ที่จัดการโครงสร้างนี้ อย่าสร้าง baseline ใหม่ทับ history เดิม หากมี history อยู่แล้วให้ตรวจและ reconcile ก่อน

1. Pull, validate และ review schema ให้ตรงกับ DB เดิม
2. สร้าง migration ตั้งต้นจาก schema โดยยังไม่ execute SQL บน DB เดิม

```powershell
New-Item -ItemType Directory -Force prisma/migrations/0_init | Out-Null
pnpm exec prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script --output prisma/migrations/0_init/migration.sql
```

3. Review SQL ให้สามารถสร้างโครงสร้างเดิมใน DB ว่างได้ เพิ่ม SQL สำหรับสิ่งที่ Prisma ไม่แทนใน schema เช่น trigger, view หรือ function ที่แอปต้องใช้ อย่า overwrite migration ที่มีอยู่ด้วยคำสั่งนี้
4. สร้าง `prisma/migrations/migration_lock.toml` ด้วยเนื้อหานี้ หากยังไม่มี (ใช้ provider มาตรฐานเดียวกับ schema):

```toml
provider = "postgresql"
```

5. เฉพาะ DB เดิมที่มีโครงสร้าง baseline ครบแล้ว ให้ mark applied:

```powershell
pnpm exec prisma migrate resolve --applied 0_init
pnpm exec prisma migrate status
pnpm exec prisma generate
```

`resolve` ไม่รัน CREATE TABLE ซ้ำ แต่เขียน metadata ลง DB ต้องตรวจว่า DB ตรงกับ baseline จริงก่อนเรียก และทำกับ DB เดิมแต่ละ environment ที่มีโครงสร้างนี้แล้ว

สำหรับ DB ว่างใหม่ ให้ใช้ `migrate deploy` เพื่อ execute baseline จริง ไม่ใช้ resolve ทดสอบ baseline บน DB ว่างแยกจาก DB เดิม และ commit schema, SQL และ migration lock เข้าด้วยกัน

## 3. แก้ schema.prisma → Migrate ไป DB

หลัง baseline แล้ว แนวทางประจำของทีมคือแก้ schema ก่อน สร้าง migration ใน DB development แล้วส่งไฟล์เดียวกันไป environment อื่น

```powershell
# แก้ prisma/schema.prisma ก่อน
pnpm exec prisma validate
pnpm exec prisma migrate dev --name add_store_hours --create-only
# เปิด migration.sql ที่สร้างขึ้นและ review
pnpm exec prisma migrate dev
pnpm exec prisma generate
pnpm exec prisma migrate status
```

`--create-only` ยังตรวจ drift และอาจร้องขอ reset ได้ หากพบ drift ให้หยุดตรวจสาเหตุ ไม่ยอม reset DB ที่มีข้อมูลต้องรักษา PostgreSQL development ต้องมีสิทธิ์สร้าง shadow database หรือกำหนด shadow DB แยกที่ทิ้งข้อมูลได้ใน config ห้ามใช้ DB หลักเป็น shadow DB

การ rename field/table อาจถูกสร้างเป็น DROP + ADD ให้แก้ SQL เป็น rename หรือทำ data migration ตามความเหมาะสมก่อน apply การเปลี่ยน schema ไม่ได้ย้ายข้อมูลเดิมให้ครบทุกกรณีโดยอัตโนมัติ

Commit migration ใหม่พร้อม schema; อย่าแก้ migration ที่ merge/apply ไปแล้ว ให้สร้าง migration ถัดไปแทน

## 4. Push: ทดลอง schema โดยไม่เก็บ migration

ใช้กับ DB ทดลองที่ทิ้งได้และยังไม่ได้ยึด migration history เป็นหลัก:

```powershell
pnpm exec prisma db push
pnpm exec prisma generate
```

Push เหมาะกับการลองต้นแบบ ไม่เหมาะกับ DB ร่วมของทีม/production เพราะไม่มี SQL history สำหรับ deploy และ rollback planning ถ้าต้องเก็บประวัติ ใช้ migrate dev แทนตั้งแต่ต้น

ไม่เติม `--accept-data-loss` หรือ `--force-reset` เพื่อข้ามคำเตือน หากใช้ push กับ DB ที่มี migration history แล้วอาจเกิด drift; pull อย่างเดียวไม่ได้ซ่อม history

## 5. แก้ที่ DB โดยตรง → ต้องทำอะไรกับ migration?

### ยังไม่ได้ใช้ Prisma Migrate

Pull → validate → generate เพื่อ sync model หากจะเริ่มใช้ Migrate ค่อย baseline ตามหัวข้อ 2 ไม่มี migration ย้อนหลังเกิดขึ้นจาก pull

### ใช้ Prisma Migrate อยู่แล้ว และยังไม่ได้แก้ DB

ให้แก้ schema และสร้าง migration ตามหัวข้อ 3 แล้วใช้ migration นั้น apply DB แทนการแก้ DB ด้วยมือ

### แก้ DB ไปแล้ว เช่น DBA hotfix เพิ่มคอลัมน์

อย่ารัน migrate dev บน DB ที่ hotfix ทันที เพราะ history ต่างจากโครงสร้างจริง และอย่า reset เพื่อให้ drift หาย

1. เก็บ SQL/รายละเอียด hotfix ที่ทำจริงและ backup schema ก่อน pull
2. Pull จาก DB ที่แก้แล้ว → validate → generate → review diff ให้มีเฉพาะการเปลี่ยนที่ตั้งใจ
3. บน **DB development แยก** ที่ยังมีโครงสร้างก่อน hotfix และ apply history เดิมครบแล้ว นำ schema ที่ pull มาใช้สร้าง migration:

```powershell
# DATABASE_URL ต้องชี้ DB development แยกที่ยังไม่ได้ hotfix
pnpm exec prisma migrate dev --name sync_store_hours_hotfix --create-only
# Review SQL ให้ตรงกับ hotfix ที่ทำจริง รวมถึง custom SQL
pnpm exec prisma migrate dev
pnpm exec prisma generate
```

4. ชี้ URL กลับ DB ที่ hotfix แล้ว ตรวจว่า SQL ใน migration ถูกทำครบจริง จากนั้นใช้ชื่อโฟลเดอร์ migration ที่สร้างจริง:

```powershell
# ตัวอย่างชื่อ ต้องแทนด้วยชื่อจริงที่รวม timestamp
pnpm exec prisma migrate resolve --applied 20261006120000_sync_store_hours_hotfix
pnpm exec prisma migrate status
```

5. DB อื่นที่ยังไม่ hotfix ให้ apply migration ตามปกติด้วย `migrate deploy` ไม่ใช้ resolve ส่วน DB ที่ถูก hotfix ไปแล้วแต่ละแห่งต้องตรวจและ mark แยกกัน

หาก hotfix ทำเพียงบางส่วน อย่า mark ว่าครบ ต้อง reconcile โครงสร้างและข้อมูลให้ตรงก่อน การแก้ข้อมูลแถวอย่างเดียวอาจไม่ปรากฏใน pull/diff ต้องเก็บ SQL หรือ data migration แยกด้วย

## 6. Deploy ไป staging / production

ตั้ง URL ให้ถูก environment และ deploy ไฟล์ migration ที่ review แล้ว:

```powershell
pnpm exec prisma migrate status
pnpm exec prisma migrate deploy
pnpm exec prisma generate
```

Generate อาจทำใน build pipeline ก่อน deploy ได้ตามรูปแบบแพ็กเกจ ห้ามใช้ migrate dev บน production; deploy ไม่สร้าง migration ใหม่และไม่ตรวจ drift ให้ครบแทนการ review

## 7. Checklist ของโปรเจกต์นี้

- เงินใช้ PostgreSQL Decimal; Coins ใช้ Int และแยกจากเงินบาท
- Relations, unique constraints, idempotency และ ledger ต้องรองรับ PLAN/INTEGRATION.md
- Pull แล้วอย่าถือว่า DB ตรงกับข้อกำหนดธุรกิจทันที ต้อง review model ด้วย
- การเปลี่ยน field ที่กระทบ API ให้ปรับ docs/api-contract.md และ Postman ตามกติกาโปรเจกต์
- Schema ใช้ `prisma format`; TS ใช้ Prettier ตามคำแนะนำโปรเจกต์
- ไม่มีคำสั่ง rollback อัตโนมัติที่รับประกันคืนข้อมูลได้ วาง backup และ forward migration ก่อน deploy
- `migrate reset` ลบข้อมูล ไม่ใช่ขั้นตอนปกติสำหรับ DB เดิม

## เอกสารอ้างอิง (Prisma 7)

- [CLI reference](https://www.prisma.io/docs/orm/v7/reference/prisma-cli-reference)
- [Patching and hotfixing](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/patching-and-hotfixing)
- [Prisma 7 upgrade: config and diff flags](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7)

คู่มือนี้ไม่ได้รัน pull, push, resolve หรือ migrate กับ DB จริง คำสั่งเขียน DB เป็นขั้นตอนสำหรับเลือกใช้ตามสถานะ DB ของคุณ
