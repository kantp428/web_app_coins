---
name: nest-api
description: Build or change THAI Please NestJS endpoints, auth, recommendation logic, and API tests.
---

# Nest API

Use for work under `apps/api`. Read the assigned Daily Flag and Feature ID in `PLAN/PLAN.md` plus `PLAN/INTEGRATION.md` (`PLAN/AI_DEV.md` for recommendations) and the API contract before changing a route. If the contract is missing or ambiguous, record the decision in `docs/decisions.md` and update `docs/api-contract.md` with the team.

- Keep recommendations in `src/recommendations/`; put other feature modules under `src/` by domain.
- Enforce authentication, role, ownership, validation, and idempotency on the server. Keep purchase totals, Coins, rewards, and reports derived from persisted data.
- Update `apps/api/postman/THAI-Please.postman_collection.json` in the same change as every API route change, including relevant error cases, as required by `PLAN/PLAN.md`.
- This scaffold uses ESM and Vitest. Run from repo root: `pnpm --filter api lint`, `pnpm --filter api test`, and `pnpm --filter api build`.

Example request: "Implement D2-I / F02 login and role checks according to `docs/api-contract.md`, with Vitest and Postman cases."

## Required PLAN update

Apply the progress/handoff rules in [AGENTS.md](../../../AGENTS.md#required-progress-and-collaboration-handoff) on every task using this skill. Before the final response, update [PLAN/PLAN.md](../../../PLAN/PLAN.md) with affected flag status, changed files/routes, actual checks, blockers/unresolved rules, and the next action so another collaborator can continue. Log partial or blocked work too; do not mark a whole feature DONE from a partial implementation or passing unit tests. Reread the latest plan and preserve other contributors' edits.
