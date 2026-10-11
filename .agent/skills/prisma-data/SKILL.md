---
name: prisma-data
description: Design and change THAI Please PostgreSQL schema, Prisma migrations, seed data, and transaction rules.
---

# Prisma data

Use for work in `apps/api/prisma/` or for API logic that changes persisted money, Coins, or rewards. Read `PLAN/PLAN.md` and the contract/data rules in `PLAN/INTEGRATION.md`, `docs/decisions.md`, and `docs/api-contract.md` first. `docs/blueprint/schema/` is reference material, not an applied migration.

- Keep Prisma schema, migrations, and seed in `apps/api/prisma/`. Run Prisma from the API workspace.
- Store money as PostgreSQL decimal and send decimal strings through the API; keep Coins integer. Use `Asia/Bangkok` for monthly periods.
- Preserve ledgers and rule versions. Use database transactions, uniqueness, and idempotency to prevent duplicate purchases or grants. Add new migrations instead of rewriting merged migrations.
- Test migration and seed on a clean PostgreSQL database; test duplicate and concurrent purchase behavior when changing transaction logic. Report what was actually run.

Example request: "Implement F00 initial Prisma schema and seed for three roles from the agreed contract, then run a clean migration."

## Required PLAN update

Apply the progress/handoff rules in [AGENTS.md](../../../AGENTS.md#required-progress-and-collaboration-handoff) on every task using this skill. Before the final response, update [PLAN/PLAN.md](../../../PLAN/PLAN.md) with affected flag status, changed files/routes, actual checks, blockers/unresolved rules, and the next action so another collaborator can continue. Log partial or blocked work too; do not mark a whole feature DONE from a partial implementation or passing unit tests. Reread the latest plan and preserve other contributors' edits.
