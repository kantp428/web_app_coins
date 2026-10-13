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

## 2026-10-12 — Wallet cash/help and one-time seller payment requests

User defines two displayed balances: `balance` is the CASH ledger balance for CUSTOMER and SELLER; `help` is the CUSTOMER BASE subsidy fixed at THB 1,000 per Asia/Bangkok calendar month. The backend lazily creates the month's allocation on first access and calculates available help from entries in the current Bangkok month only; unused help from earlier months cannot carry forward. The reset action is available only outside production when `ENABLE_TEST_WALLET_ACTIONS=true`; it appends an adjustment that makes the current month's available help exactly THB 1,000 and never rewrites history. Top-up is a simulated CUSTOMER-only CASH credit with no external payment provider and requires an `Idempotency-Key` so retries do not credit twice.

Every seller payment request contains the decimal THB amount, an opaque UUID token, an owned shop, and a 15-minute expiry. The seeded demo seller therefore has an approved demo shop. It has no purchaser until a CUSTOMER opens/scans the token. A seller can list their requests and cancel a still-pending request. Expired requests are reported as EXPIRED; cancelled or expired requests cannot settle. Successful payment atomically changes PENDING to PAID, records the customer, creates the linked SUCCEEDED purchase, and serializes the request/wallet rows so the same request cannot settle twice under concurrent scans.

The target government contribution is 60% of the purchase, rounded half-up to satang. Actual help is the lesser of that target and the customer's current-month available help; customer CASH pays the remaining amount. Therefore zero or insufficient help never blocks an otherwise affordable purchase—the shortfall falls back to customer balance. Reject only when customer CASH cannot cover its computed share. Credit seller CASH with 100% and append immutable linked ledger entries. History groups the two customer debits into one payment item with help/customer breakdown. QR rendering/camera decoding is presentation only; the API UUID is authoritative. Coin award and refunds remain outside this slice.

Customer QR decoding uses `@zxing/browser` for both live camera frames and a user-selected image fallback instead of the browser-specific BarcodeDetector API. Selected images are decoded locally in the browser from an object URL, are limited to image MIME types and 10 MB, and are not uploaded to the API. The extracted UUID still goes through the authenticated payment-request preview before payment; manual UUID entry remains available.

## 2026-10-12 — Thai Chuai Thai daily help limit

User adds a THB 200 daily help ceiling while retaining the THB 1,000 monthly allocation. A day follows the Asia/Bangkok calendar; unused daily capacity does not raise a later day's ceiling. Preview and pay use the lesser of the remaining monthly help and remaining daily help, then move any subsidy shortfall to customer CASH under the existing fallback rule.

`GET /wallets/me` is authoritative for both daily and monthly limits and remaining amounts as decimal strings. The frontend displays these server values and does not derive financial eligibility from history.

## 2026-10-12 — Test-only daily and monthly help resets

When non-production test wallet actions are enabled, CUSTOMER may reset the current Asia/Bangkok day's THB 200 usage counter independently from the monthly balance, or restore the current month's balance to THB 1,000. Neither action deletes or rewrites payment history. A daily reset appends an auditable, net-zero BASE allocation/expiry marker pair; subsequent daily usage counts only payment debits after the latest marker while the monthly ledger balance remains unchanged. Both actions remain forbidden in production or when `ENABLE_TEST_WALLET_ACTIONS` is not `true`.

## 2026-10-12 — Government shop approval transitions and audit

Government officers may approve only a PENDING shop. They may suspend a PENDING or APPROVED shop, and suspension requires a trimmed reason of at most 500 characters. Re-approval of a suspended shop is excluded until a reinstatement policy is agreed. Every change records the government reviewer, review time and latest reason on the shop; this is latest-state metadata rather than a full immutable review-event ledger. Public nearby search and seller payment requests require APPROVED status. Suspending a shop prevents creating new QR requests and settling its outstanding QR requests.

## 2026-10-13 — Automatic shop Coin rates and manual test generation (F06)

User authorizes automatic shared shop rates and an immediate test button. Retain prototype 06:00/18:00 Asia/Bangkok cutoffs. On API startup and every minute, ensure the current half-open 12-hour period exists; no historical backfill or future generation. The API must stay running; after downtime create only the current period. ENABLE_AUTO_COIN_RATES=false disables the worker. A GOVERNMENT-only manual action runs the same generator in non-production, including when automation is disabled; production rejects it. No client-supplied times, rates or rule IDs.

Choose the rule effective at the period start. If none exists, return 409 and do not create a period or fabricate rates. Include shops APPROVED when the period is first generated; later approvals join the next period. Freeze the complete generated period (even if zero approved shops): retries return its stored count and never add/update rows. Serialize both generation paths with the existing rule-writer advisory transaction lock; insert the period and all shop rates atomically.

Sales are full purchase totals confirmed in [periodStart - salesWindowDays, periodStart), regardless of the award minimum. Include SUCCEEDED and purchases refunded at/after the cutoff; exclude refunds before cutoff. This preserves the snapshot as of the cutoff under the current full-refund schema. Partial-refund policy remains unresolved and is not implemented. A Decimal total strictly below low_sales_threshold uses new_low_sales_coins, otherwise new_other_coins; no sales means zero. Repeat rate is repeat_coins. Persist rule ID, total and sales window. This slice creates rates only; customer eligibility/Coins ledger/quest rewards remain F08 work.

## 2026-10-13 — Coin rate round summary table (F06/F10)

User requests latest 10 update rounds as a table without shop details. Count all frozen shop_coin_rates in each round, explicitly bucket sales_total_snapshot < THB 10,000 vs >= THB 10,000; this reporting threshold is fixed as requested, independent of any versioned eligibility threshold. Display round creation time and start/end. Coins awarded is the gross sum of actual coin_entries.coins with awarded_at in [starts_at, ends_at), including later-reversed awards; not a sum of configured shop rates, not grouped by monthly period_id, and no fabricated totals. Label/footnote clarifies gross awards before reversals. F08 has no award writes yet, so an empty ledger returns zero. No schema change or award behavior change.

### 2026-10-13 — F08 atomic QR Coin awards

Successful QR settlement uses the frozen shop rate covering confirmation time [starts_at, ends_at), not QR creation or a live rule recalculation. Minimum purchase is inclusive and uses that rate's immutable rule. Repeat means this customer has ever received a coin entry for this shop, across all months, including reversed entries; purchases below the minimum do not consume the first award. This is distinct from visited status (all successful purchases). Missing frozen rate returns 0 Coins with NO_RATE (e.g. newly approved shop waits for next round); below minimum returns 0 with BELOW_MINIMUM. Payment still succeeds, without fabricated rates or retroactive awards. Preview is advisory; settlement recomputes under the existing Serializable transaction/wallet locks. Unique purchase/coin constraints prevent duplicate awards; conflicts return 409 and can be retried.

Create a Bangkok monthly ledger period on first award if absent, with budget_limit=0 and DRAFT, preserving any configured period unchanged. Coin earning does not allocate or spend Main Quest budget; automatic grants/refunds remain separate work. Award timestamp equals purchase confirmation time. Wallet summary exposes current-month unreversed Coins as an integer string (null for sellers); payment preview/result includes coins, coinReason, coinRuleVersion. No historical purchases are backfilled.

### 2026-10-13 — Main Quest live grant, spend and expiry

Main Quest uses unreversed monthly Coins, target100 and reward100THB. Auto-grant within successful purchase transaction once eligible; POST /quests/me/claim retries eligibility when budget later becomes available, without requiring another purchase. Only current Bangkok month can receive grants. Existing monthly_periods must be OPEN with enough unallocated budget (budget_limit minus all grants); DRAFT/CLOSED/missing/insufficient budget => WAITING_BUDGET, no fabricated budget or grant. Lock the month row and customer row; unique(user,month) plus Serializable transactions prevent duplicate/oversubscribed grants. Do not invent or modify government budget values. GET reads only; historical grants remain auditable.

Base help still uses60% with its existing daily/monthly caps. An existing unexpired Main Quest grant covers the remaining customer share, up to its available balance; customer CASH covers the rest. Base daily cap does not consume reward balance. A grant earned by the purchase becomes usable on the next purchase, never retrospectively changes the just-confirmed bill. REWARD ledger entries link grant/purchase/payment UUID; no zero-value debits. Expiry is enforced by month/grant timestamp filtering, with expired remaining amount reported separately rather than deleting ledger. Existing refunds remain deferred; no new refund behavior is implemented. Preview is advisory and settlement recomputes all sources.

Quests displays actual Coins, progress, grant/used/available/expired amounts and twelve recent Bangkok months. Remove Preview badges/fixture disclaimers only from API-backed home/scan/top-up/receive/seller-money-history/explore/quests; keep customer monthly-history/settings/account fixtures marked. Seller shell heading uses authenticated displayName.

### 2026-10-13 — Linear new-customer Coin scale (supersedes binary rate calculation)

User approves scaling from new_low_sales_coins (maximum at zero sales) to new_other_coins (minimum at/above low_sales_threshold), rounding UP to an integer: ceil(max - (max-min) * clamp(sales,0,threshold) / threshold). Use Decimal arithmetic. Threshold zero uses minimum for all shops, matching the existing zero-threshold behavior. Equal endpoints yield a constant rate. Repeat customer rate, inclusive minimum purchase, lookback, cutoff, sales eligibility and award/quest rules remain unchanged.

Apply only when generating a new frozen round. Existing shop_coin_rates and historical awards are never rewritten, including manual reuse of a current round; stored final rates, rule IDs, sales/window snapshots and this formula-change record preserve auditability. No new scale/weight fields or schema migration. History report buckets still use their fixed10000 threshold independently of the continuous calculation.

### 2026-10-13 — Rule history scale explanation

User requests a formula and sales-to-Coins examples for each rule-history row. API computes explanatory samples with the same Decimal scale helper as rate generation; frontend only renders server values. Samples use0/25/50/75/100 percent of that rule threshold, floored to satang before calculating Coins; duplicate sales points omitted for tiny/zero thresholds. Threshold0 explicitly shows constant minimum instead of division by zero. Explain that this is the current formula for newly generated rounds, not a rewrite of older binary frozen rates. Repeat Coins stays visible inside the detail cell.
