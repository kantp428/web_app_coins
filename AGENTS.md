# Project guidance

Read `PLAN/PLAN.md` for the assigned Daily Flag, Feature ID, dependencies, acceptance criteria, and file ownership. Detailed role plans are `PLAN/APP_DEV_A.md`, `PLAN/APP_DEV_B.md`, `PLAN/AI_DEV.md`, and `PLAN/INTEGRATION.md`; shared requirements and acceptance rules live in `PLAN/INTEGRATION.md`. `CoreIdea.md` gives product context. Record unresolved rules in `docs/decisions.md` before implementing them.

Use the relevant project skill in `.agent/skills/` when working in that area:

- `web-frontend/SKILL.md` for Next.js pages, forms, and UI integration.
- `nest-api/SKILL.md` for NestJS endpoints, auth, and recommendations.
- `prisma-data/SKILL.md` for schema, migrations, seed, and money/Coins rules.

Keep the API contract in `docs/api-contract.md` aligned across web, API, and Postman. Backend/API changes require the matching `apps/api/postman/THAI-Please.postman_collection.json` change under `PLAN/PLAN.md`.

## Automatic code formatting

After every AI code generation or edit, run the owning package's Prettier on all supported source files generated or edited in that task, then run `--check` on the same files before delivery. Do this automatically without a separate user request. Respect existing configuration and ignore rules; exclude dependencies, build outputs, binary assets, and generated lockfiles. For web use `pnpm --filter web exec prettier --write <files>` and `pnpm --filter web exec prettier --check <files>`. Formatting must not change behavior.

## Required progress and collaboration handoff

For every project task (implementation, fixes, reviews/investigations, tests, configuration, documentation, or skills), read `PLAN/PLAN.md` before work and update it before the final response, even when the task is incomplete or blocked. `PLAN/PLAN.md` is the shared progress source; do not create a separate root `PLAN.md`.

- Update only affected Feature/Daily Flag rows using actual evidence. Keep partial work as DOING/PARTIAL/UI PREVIEW; PR requires a real PR link, and DONE requires the defined acceptance/review gates. If no flag fits, record the work as cross-cutting maintenance without inventing a completed feature.
- Append a concise entry to the collaboration handoff log: Asia/Bangkok date/time, task and related flags/role, changed files or routes, actual check commands/results (or not run and why), unresolved decisions/blockers, and a concrete next step. Include links to relevant code/docs/PRs when available. Do not log secrets, tokens, real identifiers, or credentials.
- Before saving, reread the current plan/diff and preserve other contributors' updates. Merge only your task's rows/log entry; never overwrite the board wholesale. Keep progress history and avoid repeating the full plan in each entry.
- Record unresolved business rules in `docs/decisions.md` before implementing them, then reference them from the plan. Format/check modified Markdown with the installed package Prettier before delivery. A documentation-only update does not require an app build.
