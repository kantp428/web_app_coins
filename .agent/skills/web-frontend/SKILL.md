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

## Feedback UI

Use Sonner (`toast` from `sonner`, root Toaster) for errors, validation alerts and operation results; do not duplicate auth errors as inline UI text, and `components/shared/confirm-dialog` for confirmations. Base UI powers Dialog/AlertDialog; keep pending operations disabled and allow retry after failure. Format changed files and run web lint/build. Example: add a logout confirmation with error and success toasts.

## Required PLAN update

Apply the progress/handoff rules in [AGENTS.md](../../../AGENTS.md#required-progress-and-collaboration-handoff) on every task using this skill. Before the final response, update [PLAN/PLAN.md](../../../PLAN/PLAN.md) with affected flag status, changed files/routes, actual checks, blockers/unresolved rules, and the next action so another collaborator can continue. Log partial or blocked work too; do not mark a whole feature DONE from a partial implementation or passing unit tests. Reread the latest plan and preserve other contributors' edits.

## Shop location maps

Use React Leaflet/Leaflet client-only through dynamic import with ssr:false, plus Leaflet CSS. Load OSM tiles only when the user opens the map, keep visible attribution and normal browser cache/referrer behavior, and do not prefetch/offline-download tiles. ShopLocationPicker supports click/drag coordinate selection with manual coordinate/address entry retained. Never request device geolocation automatically. Tile provider uses NEXT_PUBLIC_MAP_TILE_URL and NEXT_PUBLIC_MAP_ATTRIBUTION. Address is structured JSON (line1/province/district/subDistrict/postcode); use useReverseGeocode + central Axios through /api/geocoding to Nest /geocoding/reverse. Debounce and abort stale responses; allow owner edits and retry on failure. Show OSM attribution even with manual coordinates. Ctrl+wheel zooms; ordinary wheel scrolls the page. Never call public Nominatim directly per component; server serializes calls with cache for the current single-instance deployment. Example: select a shop pin in /register while preserving form validation and pending state.
