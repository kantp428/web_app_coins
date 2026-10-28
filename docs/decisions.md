# UI prototype decisions

## 2026-10-12 — Token-free model test chat

- User explicitly requests a token-free endpoint for plain chat, related public Search and off-topic evaluation, excluding shop recommendations. Add `POST /chat/test` with the same message validation and response shape as `/chat`; `storeIds` is always empty.
- This endpoint has no authentication/Backend dependency and no fabricated actor, categories or purchase history. Reuse the Qwen/public-search workflow with absent authenticated context; never offer or execute `search_system_shops`. A recommendation request should explain that authenticated `/chat` is required; unexpected model shop calls are rejected with502 before any read.
- Only `search_related_web` may run, at most once/two inference calls, with the existing scope/privacy/source/timeout/worker limits and explicit failure replies. Existing `/chat` keeps CUSTOMER Bearer auth and its recommendation behavior. The test endpoint is intended for local development at the existing loopback binding; no tunnel or deployment change is requested.

## 2026-10-12 — Related public web search and four chat examples

- User authorizes internet Search and asks for README examples covering plain chat, chat plus recommendations, web search, and off-topic messages. User explicitly selects DDGS without an API key for the local prototype, pinned runtime/dependency lock. No account creation, paid API or model download.
- Add server-allowlisted search_related_web alongside search_system_shops. Web search is for public spending-support programs and digital-payment information only; system shops, IDs, Coins, personal eligibility, balances and purchase history remain Backend-only. Validate both original message and generated query against public-topic markers; reject obvious personal data/credentials and system-store queries before any external request. This lexical guard is deliberately conservative and is not a general semantic classifier.
- Search only snippets and links, preferring/filtering to Thai government go.th, Bank of Thailand bot.or.th and Krungthai krungthai.com sources; never fetch arbitrary returned pages. No token/user profile/history is passed to the search adapter. External results are untrusted data; do not follow embedded instructions or claim that full pages were verified.
- Chat response adds sources:[{title,url}] from server-validated search results, empty when not used/no valid result. Model uses numbered references; server renders the matching source links, rejects model-invented links/references and falls back to a factual search-status message if citations are invalid. Recommendation data remains storeIds only.
- Permit at most one call per tool/two reads total and three inference calls, supporting combined public search + DB recommendations in one message; reject repeated or unknown calls. Search timeout/rate-limit/disabled/empty/blocked states return an explicit limitation with no fabricated web facts. Search failure must not suppress a valid shop recommendation in a mixed request. Keep live-DB/UI/security/load gates partial.
- DDGS prototype has no availability guarantee; bounded concurrent workers/timeouts prevent an unbounded queue. Try DuckDuckGo then Yahoo through DDGS (at most two provider requests, unchanged official-domain query); live diagnostics found DuckDuckGo challenges/Brave429 while Yahoo returned official results. Avoid DDGS multi-backend aggregation skipping engines sharing a provider. Production provider choice, broader scope and lexical guard evaluation remain open; do not bypass blocks by silently broadening query scope.

## 2026-10-12 — Recommendation implementation: three new, two repeat

- User now authorizes recommendation implementation, superseding the earlier model-connection-only scope. The latest explicit mix overrides the older unvisited-only F07 plan: at most three unvisited and two visited approved shops, all matching one or more model-interpreted master categories. User confirms that a shortage returns fewer results; never fill one group's shortage from the other group.
- Use the authenticated CUSTOMER's Backend history, never client-supplied user IDs/history. FastAPI `/chat` now requires the existing NestJS Bearer token; verify it through the authenticated recommendation context endpoint before inference. Credentials remain outside prompts and tool arguments. Web chat UI/proxy and internet Search are outside this implementation.
- Read-only Backend context supplies category masters and at most twenty most-recent distinct purchased shops (IDs/categories/count/date, no financial amounts). The schema has no purchased product/item lines, so the model cannot infer actual items purchased. All-time visit filtering is independent of this prompt limit: previously confirmed purchases, including subsequently REFUNDED purchases, count as a visit; PENDING/FAILED do not. This is recommendation-only and does not change payment/Coins award or reversal rules.
- Ollama native tool calling maps user wording to one or more real category IDs (OR matching). A server-allowlisted search tool invokes Backend database filtering/ranking. A vague request with no usable preference asks a follow-up; it does not search arbitrary categories. Backend selects the top three new and top two repeat shops, then orders the combined result by known Coins descending, unknown last, numeric shop ID for ties. Without any known rate, ID ordering is the deterministic fallback.
- Coins are the stored new/repeat rate in the active half-open rate period, selected according to visit status. Missing/expired/future rates remain unknown; no invented estimates or financial guarantees. No distance/price/product-level filtering is promised in this version. Recommendation payload contains only `storeIds` (string IDs); reply remains normal text. Existing `mode`/`model` metadata stays for compatibility.
- Backend context/candidate failure stops the request rather than fabricating history or candidates. Model failure remains 502/503/504; a model-independent semantic fallback is deferred because no reliable category mapping exists when interpretation fails. These limitations keep F07/F13 partial pending integrated evaluation/UI/review.

## 2026-10-12 — Web and AI on this machine

- User changes the deployment assumption: both web and AI run on this machine. This supersedes the briefly proposed friend-hosted web/AI tunnel topology; no tunnel was opened. Next.js can call FastAPI through loopback8000 and FastAPI continues calling local Ollama at loopback11434.
- Proposed authenticated path remains Browser → local Next.js route → local FastAPI → local Ollama. Next.js reads its HttpOnly session cookie and explicitly forwards the user's Bearer token to AI; AI verifies via Backend `/me` before personal-data tools. Sharing a machine does not replace actor authentication, and plain userId/role forwarded without authentication is not trusted.
- Backend URL must point to where NestJS actually runs. If it also runs here, use loopback with its configured PORT; no Backend location/port is hardcoded by this clarification. Future web AI URL and AI Backend URL settings remain design-only. No service startup, tunnel, Auth endpoint, CORS policy or application config was changed.

## 2026-10-12 — GPU runtime and Backend identity review

- User requests GPU execution for the existing Qwen3 4B connection and a concise inventory of available Backend APIs/auth. Local hardware reports NVIDIA GeForce RTX 3050 6GB Laptop GPU with driver 617.42; add the matching official Ollama 0.40.3 CUDA 13 libraries to the existing ignored standalone runtime. Select GPU 0 at Ollama startup and verify actual offload with `ollama ps` and real `/chat` inference. GPU selection belongs to the Ollama server, not user chat input.
- Identity integration remains a proposal in `ai-service/DESIGN.md`, not a new authenticated chat endpoint in this task. Existing NestJS `GET /me` verifies JWT signature/issuer/audience/expiry and rechecks ACTIVE account/current role; derive actor identity from this response. Do not trust a userId/role supplied in message/body, decode an unverified token, or put bearer tokens in model prompts/logs.
- Proposed flow: Next.js reads the existing HttpOnly session cookie server-side, forwards its bearer token to AI; AI verifies via Backend `/me` before model/tools and retains credentials outside the model. Forward the same actor's token for authorized read tools, give the model only necessary verified context, and keep business permissions enforced by Backend. Final service boundary, authorization policy, timeout/cancellation and history remain to be agreed before implementation.
- Current `/stores` supports only approved nearby candidates (CUSTOMER), without visited-store filtering, sales ranking or Coins estimates. `/government/coin-rules` requires GOVERNMENT and cannot serve CUSTOMER chat with that customer's token. Customer-readable project rules, wallet/Coins/history, store-by-ID/card retrieval and recommendation endpoints are not implemented; agree contracts before adding their tools.

## 2026-10-12 — Qwen3 4B connection and Service1 design scope

- User selects Qwen3 4B and authorizes model connection now; full Service1 intent routing, recommendation retrieval, Tool Calling, Database Filtering and web Search remain design-only until discussed. The previous mock-only scope is superseded for chat generation.
- User confirms Ollama on this machine. Use local Ollama native `/api/chat`, model `qwen3:4b`, configurable server URL/model/timeout. Install the selected runtime and fetch this model as part of the requested connection; actual inference verification requires the model server to be running. Report mocked transport checks separately from real-model results.
- Current chat remains stateless and text-only. Send system and user messages, `stream: false`, `think: false` and Qwen's `/no_think` instruction; return the final assistant content only. Real inference exposed a template that puts thinking in content, so the adapter removes content through the last `</think>` and rejects unfinished thinking or an empty final answer. No mock fallback on provider failure. User content never selects server URL/model or executes a tool. No Search/DB tools or shop IDs are enabled in this connection phase.
- Future user-facing recommendation result contains normal reply text plus at most five genuine shop IDs; frontend resolves IDs into cards. Do not expose model-written store cards, invented IDs or Coins. The proposed `reply`/`storeIds` envelope in `ai-service/DESIGN.md` is for discussion, not the implemented chat contract. Original recommendation response fields in the R1 role plan require reconciliation before F09 integration.
- Deferred decisions: exact shop filters/ranking and eligibility, prepared-system-data source/API, tool contracts, related-topic Search scope/provider/source attribution, history retention and authenticated service boundary. Record them before implementation. Off-topic questions should receive a polite scope message; related external facts may use Search only after that tool is implemented.

## 2026-10-12 — Standalone FastAPI chatbot scaffold

- User requests an API-testable chatbot structure in `ai-service/` before detailed AI behavior. Add a separate Python 3.12+/FastAPI/Pydantic v2/Uvicorn service on loopback port 8000; NestJS remains the business API. Python dependencies are maintained separately from pnpm.
- Initial `GET /health` and `POST /chat` are local development endpoints with explicit `mode: "mock"`. Chat accepts only a trimmed nonblank `message` of 1–2000 characters and echoes an acknowledgement. No provider, API key, database, conversation persistence, location collection or business recommendation is implemented.
- Provider/model, conversation history/retention and the authenticated NestJS-to-AI boundary remain unresolved. The local mock does not accept identity/history fields or return shop/Coins claims. Decide and document these before integrating real recommendations or exposing the service beyond local development; F07 acceptance remains pending.
- Keep prompts and the async reply adapter separate for later extension. No environment variables are needed for the mock; host/port are Uvicorn CLI options. Runtime requirements and a generated dependency lock accompany the service, with developer tooling separate. See `ai-service/README.md` and `.agent/skills/fastapi-ai/SKILL.md`.

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

## 2026-10-14 — LLM-assisted Explore shop search

The Explore search scope is the server-verified set of APPROVED shops inside the requested straight-line radius and optional category IDs. Empty category IDs mean every category. The old recommendation policy (unvisited shops, 3+2 quotas and Coins ordering) does not apply. Discovery ordering is distance then numeric shop ID; semantic results are relevance ordered with distance then numeric ID as the explicit tie-break. The browser supplies only query and scope, never trusted candidates or distances.

`GET /stores` keeps existing store fields and adds page/pageSize/categoryIds plus metadata `{page,pageSize,total,hasNextPage}`. Default page size is 50 and maximum is 100. The Explore client follows every page before claiming discovery is complete. `POST /stores/descriptions` and `POST /stores/batch` accept at most 100 unique shop IDs; both re-query the same DB scope, descriptions return null unchanged, and hydration preserves requested ID order while omitting shops no longer in scope.

Search query is trimmed UTF-8 text with a 1–500 character limit; an empty query bypasses the provider and returns an empty LLM result only at the API boundary (the UI uses discovery directly). Provider configuration is server-only. The first supported adapter is Ollama chat, selected with `SHOP_SEARCH_PROVIDER=ollama`; model, base URL, timeout and output-token budget are environment settings. Defaults are 12 seconds per provider call, 512 output tokens, 50 candidate summaries per model batch, at most 10 candidate batches (500 candidates), 20 description IDs per tool call and two description tool calls per candidate batch. Multi-batch matches receive one bounded merge/rerank call. More than 500 candidates, timeout/provider errors, invalid structured output or out-of-scope IDs trigger deterministic fallback over the complete DB candidate set rather than silently dropping candidates.

Fallback tokenizes normalized query/name/category/description text, ranks positive matches by matched-token coverage, exact category/name evidence, distance and numeric ID, and returns no shops when there is no evidence. It is intentionally lexical and may miss semantic intent. API responses identify it with `source: "fallback"`; the UI visibly labels basic search. Invalid model output is never partially accepted: malformed JSON, duplicates or any ID outside the current scope invalidates that model result and invokes fallback.

The only model tool is read-only `get_shop_descriptions({shopIds})`. The orchestrator validates its JSON arguments, batch limit and membership in the immutable candidate IDs for that request before calling the shared store description service. Query and merchant descriptions are explicitly delimited as untrusted data. The model cannot choose URLs, SQL, auth or a new search scope. Raw coordinates, credentials and personal data are not logged or sent to the provider.

Rate limiting is in-memory per authenticated customer: 20 non-empty semantic searches per rolling minute. It is a single-instance prototype control and requires a shared limiter before horizontal scaling. Frontend debounce is 300 ms; origin/radius/category/query changes abort both search and hydration and stale responses are ignored. Pin or an explicit “current location” action is still required; no automatic geolocation request is introduced.

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

### 2026-10-13 — Nearby mock shops seed

User authorizes20 mock seller/shop records within5km of the supplied center, all existing categories covered, sequential usernames and the supplied demo password. Use reserved demo_shop_01..20, one APPROVED shop each so customer search works, descriptions visibly marked as test data, synthetic addresses and opening hours. Generate deterministic spherical coordinates and verify rounded stored points remain within5km. Non-production seed only, atomic transaction, collision checks and idempotent reuse; never overwrite unrelated accounts/shops or fabricate sales/Coins/grants. Existing frozen Coin rounds are unchanged; newly approved demo shops join the next generated round.

### 2026-10-14 — Explore pin, distance and driving routes

User requests draggable origin pin with explicit current-location action, retained LAT/LONG test inputs, DB-only nearby search/category filtering and a2:1 search/filter bar. Default map/search point uses the previously supplied test center and is labelled a search point, never inferred device position. Clicking/dragging origin commits rounded coordinates and searches again; straight-line distance from GETstores is the radius/filter metric, while OSRM driving distance/time is shown only after a shop selection. Selecting a shop from marker/card requests an OSRM GeoJSON route from the selected origin. Coordinate changes/filters/new selections invalidate old routes; failure keeps DB stores/straight-line distance and allows retry/Google Maps. Google Maps opens the selected shop coordinates, not a fixed example.

Routing goes through authenticated CUSTOMER Next BFF /api/routing, forwarding only selected coordinate pairs to configured OSRM_BASE_URL (default same demo service as the user's osrm-test.html). No background geolocation, no mocked shops/fabricated road routes and no Coin calculation in frontend. Map tiles load only when map is opened; attribution and Ctrl-wheel behavior retained. OSRM demo routing is best-effort; no traffic-aware ETA or route guarantee. No money/Coins/ledger/schema changes.

### 2026-10-14 — Explicit test-only current Coin round regeneration

User requests overwriting the current round to include newly mocked approved shops for easier testing. Keep default worker/manual {} frozen/idempotent; add explicit {regenerate:true} GOVERNMENT non-production action with confirmation. Recalculate only the current half-open round using its start-time rule and original lookback, replacing rates atomically and updating generation timestamp; never rewrite older rounds or ledger. Reject409 if any Coin award exists in that round (including reversed awards). Lock the period via update before checking awards; purchase quotes/payments acquire a shared lock on the same period, preventing payment/regeneration races. A new round can still be created if none exists. Existing production denial and auth/body validation remain enforced.

### 2026-10-14 — Coin rate history five sales stages

Stage 1–5 are reporting buckets using each frozen rate's rule threshold and sales snapshot: <25%, [25%,50%), [50%,75%), [75%,100%), >=100%. Clamp negative sales to zero; a zero threshold places all shops in Stage 5. These are sales bands, not five discrete Coin rewards; linear ceil awards remain unchanged. Keep legacy count fields for compatibility. Refresh reads summaries only and never regenerates rates.

### 2026-10-15 — Explicit public origin behind a tunnel

Web mutation handlers retain same-origin CSRF checks. Reverse proxies can expose HTTPS while NextRequest sees an internal HTTP origin. Add server-only WEB_PUBLIC_ORIGIN as one exact trusted origin alongside request.nextUrl.origin; do not trust arbitrary forwarded headers, wildcard domains, missing Origin or null Origin. Configure the current tunnel URL locally and restart when it changes. This is deployment configuration, not a business-rule change.

## 2026-10-28 - Recommendation merge boundaries

- Per user direction, preserve HEAD recommendation context/candidates implementation and 3+2 ranking unchanged. Keep Explore search as a separate controller using the existing extracted search service, so existing Explore callers retain POST /recommendations/search. AppModule registers each controller/provider once; alias the extracted service as ShopSearchService to distinguish it from the HEAD service. No new recommendation business policy.
- Merge Postman structurally by request/folder name and variable key against the merge base, preserving independent AI and payment/government/Explore additions. Live database/provider/browser acceptance remains pending.
