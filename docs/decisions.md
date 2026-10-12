# UI prototype decisions

- User request on 2026-10-06 authorizes a mobile wallet UI for normal/customer and store/seller across apps/web, covering D1-A/F04 and D1-B/F05 shells with F09/F10 preview screens. No API integration, authentication, payment, or government role in this task.
- All balances, sales, Coins, eligibility, map pins, AI replies, and approval statuses are explicitly illustrative fixtures. They do not establish business rules. Store form changes are local and reset on reload.
- Use shadcn default neutral tokens. Customer and seller routes reuse a mobile shell; role links are preview navigation, not access control.
- Unresolved payment, benefit, location, and Coins rules remain deferred to the API contract before integration. No financial or Coins state is recalculated or persisted by this prototype.

- Prisma schema validation fix (2026-10-06): keep one coin entry per purchase and its composite ownership/rule relation; add explicit composite unique metadata required by Prisma. This additional constraint is not applied to the existing DB by this edit and must be reconciled in a reviewed migration. Reward grants have multiple money entries; the partial unique for REWARD_ALLOCATION remains unchanged. No DB mutation was executed.

- Existing Neon database baselined as 0_init on 2026-10-06. Baseline preserves the live generated subsidy column, 55 check constraints and four reporting views. Executed all baseline SQL in an isolated schema within a transaction and rolled it back; schema-to-datasource diff was empty. Marked 0_init applied through Prisma resolve; application tables/data were not reset or migrated. Future schema changes require new migrations, not edits to 0_init.

## Login — 2026-10-11 (F02 / R1-D2-I, shared web integration)

- Separate CUSTOMER, SELLER and GOVERNMENT accounts; one role per user, globally unique login_identifier. Shared /login page has three role tabs. CUSTOMER identifiers require exactly 13 ASCII digits (format only, no citizenship verification); other roles use ordinary usernames.
- API validates credentials, ACTIVE status and selected role. Password hashes use scrypt$<hex salt>$<hex digest> (Node scrypt, 64 bytes). Existing hashes in other formats require an explicit migration; no plaintext fallback.
- HS256 JWT expires after one hour, issuer thai-please-api, audience thai-please-web; claims contain user ID and role, never national ID. JWT_SECRET must contain at least 32 bytes. Web BFF stores JWT in HttpOnly, SameSite=Lax, path=/ cookie, Secure in production. No localStorage token. Origin checked on web mutations.
- /me verifies JWT and rechecks active account/role from DB. Protected web pages call /me; seller/customer existing screens remain UI previews. Government landing is an authenticated placeholder. No registration, refresh token or database mutation included.

## AuthContext — 2026-10-11

- Protected customer, seller and government pages pass the server-verified /me profile to AuthProvider. Client descendants use useAuth().user for id, role and displayName. JWT remains server-only in the HttpOnly cookie.
- Context is scoped to authenticated pages; server role checks remain mandatory. Login/logout use full navigation so cookie changes load a fresh profile. Context does not grant permissions or store a duplicate token.

## Web API organization — 2026-10-11

- Follow radio-project's contexts/, hooks/ and lib/api.ts separation. lib/api.ts owns browser Axios instances and typed login/logout requests; hooks own mutation loading/errors; contexts/auth-context.tsx exposes verified user and logout state.
- Same-origin BFF and server role checks remain in place. Web logout returns JSON for Axios, then the hook navigates to /login. No refresh endpoint or browser-readable JWT is introduced.

- Login/logout hooks now use Next router.replace and router.refresh to reload server-verified session data after cookie changes, superseding the earlier full-navigation approach.

## Demo login accounts — 2026-10-11

- User authorizes creating three demo users in the configured project database and recording credentials in Test.md. Demo customer identifier 0000000000000 is synthetic, format-only. No wallets, shops, ledgers or financial data are seeded.
- Seed is an explicit development-only operation; it uses one transaction, creates missing accounts, and verifies existing matching accounts without updating credentials or roles. Username collisions abort the transaction. Re-running keeps user IDs/password hashes unchanged.

## Alerts and confirmations — 2026-10-11

- Follow radio-project UI conventions: inline destructive Alert for actionable errors, Sonner toast for auth results, and shared confirmation AlertDialog before logout. Existing detail dialogs continue using Dialog.
- Keep Base UI primitives already used by this project. Confirmation disables actions/closing during logout and keeps failures visible for retry. Sonner is the only additional UI dependency; no auth/API contracts change.

## Error presentation — 2026-10-11

- User requests floating alerts rather than inline error text. Auth API failures and login form validation use Sonner error alerts only. Inputs retain aria-invalid and validation focus; logout confirmation retains pending/retry controls without duplicating error messages inside the dialog. This supersedes the earlier inline auth error convention.

## Role page routes — 2026-10-11

- User authorizes replacing primary state tabs with explicit Next routes for all roles. Customer: /wallet, /wallet/explore, /wallet/quests, /wallet/history, /wallet/account. Seller: /store, /store/receive, /store/history, /store/settings, /store/account. Government: /government, /government/stores, /government/coin-rules, /government/reports, /government/account.
- Role layouts verify sessions and provide AuthContext. Each leaf selects its UI section; primary navigation uses Link, action shortcuts use router.push. No state-tab navigation remains. Local form/search state resets when leaving its page. Existing customer/seller fixtures remain previews; government feature pages remain explicit placeholders without fabricated KPIs.

## Register all roles — 2026-10-11

- User authorizes /register for CUSTOMER, SELLER and GOVERNMENT with a link from /login. For this prototype all three roles can self-register ACTIVE accounts, including GOVERNMENT. No invitation/approval flow is introduced; production government provisioning remains an unresolved policy.
- Registration collects displayName, username, password and confirmPassword. Customer ID is exactly 13 ASCII digits (format only); seller/government usernames are 3–64 ASCII letters/digits/underscore/dot/hyphen. Password is 8–128 characters, confirmation must match. Display name is trimmed, 1–200 characters. Global login_identifier uniqueness remains.
- API creates users only with random-salt scrypt hashes; duplicate identifiers return 409. Registration does not create shops/wallets or issue JWT. Success redirects to login; errors appear as floating Sonner alerts. No schema migration needed.

## Registration details by role — 2026-10-11

- CUSTOMER must supply firstName and lastName; persist the joined full name in existing users.display_name (no schema change). SELLER must supply shop name/category/area code/latitude/longitude/opening hours/size (SMALL/MEDIUM/LARGE); use shop name as account display name. GOVERNMENT supplies only credentials; display_name defaults to username. This replaces the generic displayName registration field.
- Seller registration uses an atomic nested Prisma user+shop create. Owner is the new SELLER user, participation status is server-set PENDING. opening_hours stores a JSON object with text entered by the user. No approval, money or Coins rules are changed.

## Shop registration map/address — 2026-10-11

- User requests React Leaflet + OpenStreetMap to collect shop location. Provide opt-in map opening, click-to-select and draggable marker; retain editable coordinates for keyboard/manual entry and tile outages. Do not request device geolocation automatically. Address is typed/confirmed by owner, not automatically geocoded; no Nominatim/autocomplete service added.
- Add nullable shops.address VARCHAR(500) in a new additive migration to preserve existing rows. Require a nonempty trimmed address (max 500) on new seller registrations. Save address separately from the existing area_code; geographic master/code policy remains unresolved.
- Use React Leaflet client-only (dynamic ssr:false) with Leaflet CSS, standard HTTPS OSM tile URL and visible attribution. No prefetch/offline downloads. Tile URL configurable through NEXT_PUBLIC_MAP_TILE_URL; alternative providers must supply NEXT_PUBLIC_MAP_ATTRIBUTION. References: https://react-leaflet.js.org/docs/start-introduction/ and https://operations.osmfoundation.org/policies/tiles/.

## 2026-10-12 — Structured shop address and reverse geocoding

User approved converting shop.address to JSON and automatic reverse lookup following geocode-test.html. Store only normalized {line1, province, district, subDistrict, postcode}; editable owner-confirmed fields, no raw provider response. Legacy text migrates to line1 without loss, null stays null. No inferred area_code from postcode. Nominatim reverse is user-triggered by pin/manual coordinate change, debounced, server serialized >=1100 ms with bounded cache and queue, configurable provider. Current runtime is one API instance; shared limiter/cache or alternate provider required before multiple replicas. Do not send names/credentials/address text to provider. Ctrl+wheel zoom only; ordinary wheel scrolls page. Lookup failures retain editable fields and use Sonner; stale responses cannot overwrite newer coordinates.

## 2026-10-12 — Shop category many-to-many

User authorized DB adjustment after recommendation: categories(category_id,name unique,slug unique) and shop_categories(shop_id,category_id composite PK), reverse category index; migrate each legacy shops.category into master/join without losing associations, then remove legacy column and rebuild map index on status/area. Initial editable-by-migration taxonomy: อาหาร, คาเฟ่, เบเกอรี่, เครื่องดื่ม, ของใช้, บริการ, อื่นๆ; preserve legacy category names as additional categories. Register uses categoryIds (1–10 unique positive decimal ID strings), validates against master before atomic user/shop/join write. Public GET /categories supplies master; no category creation/admin endpoint in this scope. Taxonomy is prototype pending business review. Existing wallet fixture labels remain preview, not DB integration.

## 2026-10-12 — Registration opening schedule

User requests day dropdown with select-all and open/close time bar. Store openingHours as {days:[MON..SUN],open:HH:mm,close:HH:mm,timeZone:Asia/Bangkok} in existing JSON opening_hours; no schema migration or rewrite of old {text} rows. One shared time interval for all selected days; 1–7 unique days, valid 24h HH:mm, open != close. close < open means closing next day (show explanation); 24h/per-day/multiple intervals are future scope. Validate same contract at server; customer/government unaffected.

## 2026-10-12 — Shared Coin rate periods

User authorizes coin_rate_periods + shop_coin_rates, one shared period across shops and unique shop/period rate. Periods use timestamptz and half-open [starts_at,ends_at), must not overlap globally. Proposed 06:00/18:00 Asia/Bangkok cutoffs remain pending final business confirmation; this migration creates storage only, no scheduler or fabricated rates. Rate rows snapshot rule, new/repeat Coins and sales window/total. New-vs-repeat scope remains unresolved; preserve current rule semantics until agreed. Ledger linkage and award selection are subsequent F08 work; existing ledger rows are unchanged.

## 2026-10-12 — Government rule management

Implement GET/POST government/coin-rules, immutable rule versions. Prototype cutoff defaults now06:00/18:00 Asia/Bangkok; new rules activate at next cutoff strictly after request time, never change locked shop rates. Serialize writers via transaction advisory lock; reject creation while a future rule exists (409), so no edit/cancel pending in this scope. Preserve existing DB checks: repeat1, low-sales new8–10, other1–10 and <=low-sales. GET also returns latest shared periods and their stored shop rates; no invented rates or automatic scheduler. Store low-sales window days and minimum purchase; transaction eligibility/new-vs-repeat from all successful history remains Integration policy. F06 preview/F08 award generation remain separate work.

## 2026-10-12 — Historical demo Coin rules

User requests mock old rules. seed:coin-rules inserts expired demo versions1–3 only (Sep1–Oct1 2026 Bangkok), attributed to existing ACTIVE demo_government. Prototype values, not policy. Shared advisory lock with rule creation; exact existing seed rows skipped, conflicting version or overlapping window aborts entire transaction. Never renumber/overwrite existing rules or create active/pending rules. Refuse NODE_ENV=production. No rates, ledger or money changes.

## 2026-10-12 — Current demo Coin rule

User requests active mock version. seed:coin-rules:current creates max version+1 starting current06/18Bangkok cutoff (or later prior expiry), with50THB minimum/10000THB threshold/7days/new-low10/new-other5/repeat1. Preserves existing active rule and refuses pending rule; serialized with shared advisory lock, production guard. No shop rates/ledger changes.

## 2026-10-12 — Nearby shops replace area codes

User removes shops.area_code and area grouping. Drop shops column/index, remove register areaCode. Preserve purchases.shop_area_snapshot as nullable deprecated audit-only data; remove its report grouping index. New discovery uses customer opt-in current latitude/longitude and radiusKm default5 (0.1–50), approved shops nearest-first limit50. Never persist customer coordinates or send to geocoder; no location access on mount, manual coordinates fallback. GET /stores CUSTOMER only. Haversine SQL parameterized; no inferred area/postcode grouping. Existing fixed-area AI and reporting requirements superseded for discovery; geographic impact aggregation policy deferred.

## 2026-10-12 — Shop description for recommendation context

User requests shops.description collected at seller registration (menu/services/shop character). Nullable VARCHAR(2000) for legacy shops, new registrations require nonblank trimmed1–2000 characters; no generated backfill. Nearby stores returns description:string|null for future model context. Treat merchant text as untrusted descriptive data, never model instructions. No recommendation/model integration claimed in this change.
