# Project guidance

Read `PLAN.md` for the assigned Daily Flag, Feature ID, dependencies, acceptance criteria, and file ownership. `CoreIdea.md` gives product context. Record unresolved rules in `docs/decisions.md` before implementing them.

Use the relevant project skill in `.agent/skills/` when working in that area:

- `web-frontend/SKILL.md` for Next.js pages, forms, and UI integration.
- `nest-api/SKILL.md` for NestJS endpoints, auth, and recommendations.
- `prisma-data/SKILL.md` for schema, migrations, seed, and money/Coins rules.

Keep the API contract in `docs/api-contract.md` aligned across web, API, and Postman. Backend/API changes require the matching `apps/api/postman/THAI-Please.postman_collection.json` change under `PLAN.md`.
