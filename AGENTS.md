# Project guidance

Read `PLAN/PLAN.md` for the assigned Daily Flag, Feature ID, dependencies, acceptance criteria, and file ownership. Detailed role plans are `PLAN/APP_DEV_A.md`, `PLAN/APP_DEV_B.md`, `PLAN/AI_DEV.md`, and `PLAN/INTEGRATION.md`; shared requirements and acceptance rules live in `PLAN/INTEGRATION.md`. `CoreIdea.md` gives product context. Record unresolved rules in `docs/decisions.md` before implementing them.

Use the relevant project skill in `.agent/skills/` when working in that area:

- `web-frontend/SKILL.md` for Next.js pages, forms, and UI integration.
- `nest-api/SKILL.md` for NestJS endpoints, auth, and recommendations.
- `prisma-data/SKILL.md` for schema, migrations, seed, and money/Coins rules.

Keep the API contract in `docs/api-contract.md` aligned across web, API, and Postman. Backend/API changes require the matching `apps/api/postman/THAI-Please.postman_collection.json` change under `PLAN/PLAN.md`.

## Automatic code formatting

After every AI code generation or edit, run the owning package's Prettier on all supported source files generated or edited in that task, then run `--check` on the same files before delivery. Do this automatically without a separate user request. Respect existing configuration and ignore rules; exclude dependencies, build outputs, binary assets, and generated lockfiles. For web use `pnpm --filter web exec prettier --write <files>` and `pnpm --filter web exec prettier --check <files>`. Formatting must not change behavior.
