---
name: web-frontend
description: Build or update the THAI Please Next.js customer, seller, or government UI and its API integration.
---

# Web frontend

Use for work under `apps/web`. Read the assigned Daily Flag and Feature ID in `PLAN/PLAN.md`, read the matching `PLAN/APP_DEV_A.md` or `PLAN/APP_DEV_B.md` and shared rules in `PLAN/INTEGRATION.md`, then read `docs/api-contract.md` when connecting to the API.

- Put customer routes in `src/app/(customer)/`, seller routes in `src/app/(seller)/`, and government routes in `src/app/(government)/`. Shared UI belongs in `src/components/` when reuse is real.
- Use the agreed Next.js, shadcn/ui, Lucide React, React Hook Form, Axios, and Zod stack. Add shadcn components as needed; do not assume they are already installed.
- Show server-provided amounts, Coins, visited status, and KPI. Do not recalculate business rules in the browser. Ask for location only after consent and keep manual search available.
- Run from repo root: `pnpm --filter web lint` and `pnpm --filter web build`. Check the relevant UI flow and responsive states before calling it done.

Example request: "Implement D2-A / F04 account page using the agreed `/me` and wallet response in `docs/api-contract.md`."
