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

## 2026-10-12 — Shop description for recommendation context

User requests shops.description collected at seller registration (menu/services/shop character). Nullable VARCHAR(2000) for legacy shops, new registrations require nonblank trimmed1–2000 characters; no generated backfill. Nearby stores returns description:string|null for future model context. Treat merchant text as untrusted descriptive data, never model instructions. No recommendation/model integration claimed in this change.
