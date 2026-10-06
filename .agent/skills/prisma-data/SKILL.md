---
name: prisma-data
description: Design and change THAI Please PostgreSQL schema, Prisma migrations, seed data, and transaction rules.
---

# Prisma data

Use for work in `apps/api/prisma/` or for API logic that changes persisted money, Coins, or rewards. Read `PLAN.md` section 5, `docs/decisions.md`, and `docs/api-contract.md` first. `docs/blueprint/schema/` is reference material, not an applied migration.

- Keep Prisma schema, migrations, and seed in `apps/api/prisma/`. Run Prisma from the API workspace.
- Store money as PostgreSQL decimal and send decimal strings through the API; keep Coins integer. Use `Asia/Bangkok` for monthly periods.
- Preserve ledgers and rule versions. Use database transactions, uniqueness, and idempotency to prevent duplicate purchases or grants. Add new migrations instead of rewriting merged migrations.
- Test migration and seed on a clean PostgreSQL database; test duplicate and concurrent purchase behavior when changing transaction logic. Report what was actually run.

Example request: "Implement F00 initial Prisma schema and seed for three roles from the agreed contract, then run a clean migration."
