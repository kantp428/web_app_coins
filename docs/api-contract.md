# Authentication contract (F02)

POST /auth/login: JSON `{ "username": "0000000000000", "password": "...", "role": "CUSTOMER" }`. Roles: CUSTOMER, SELLER, GOVERNMENT. Customer username must contain exactly 13 ASCII digits; other usernames are 1–255 characters. Password 1–1024 characters.

200: `{ "accessToken": "<JWT>", "expiresIn": 3600, "user": { "id": "1", "role": "CUSTOMER", "displayName": "..." } }`. 400 invalid input; 401 incorrect credentials, inactive account or role mismatch; 503 missing JWT configuration. IDs are strings. Login responses must not be cached.

GET /me: `Authorization: Bearer <JWT>`. 200 user profile with id, role, displayName; 401 missing/invalid/expired token or inactive account/changed role.

Web POST /api/auth/login forwards login to API and sets session cookie (HttpOnly, SameSite=Lax, Secure in production, 3600 seconds). Returns destination /wallet, /store or /government. Web POST /api/auth/logout returns 200 JSON `{ "message": "Logged out" }` and clears cookie; signed JWT expires naturally (no server revocation). Both require same-origin Origin header. Configure server-only API_URL for web and DATABASE_URL/JWT_SECRET for API.

Accounts use scrypt hashes documented in decisions.md. Demo seed credentials are documented in Test.md.

## Registration

POST /auth/register: common fields `role`, `username`, `password`, `confirmPassword`. Customer username is 13 ASCII digits; seller/government username is 3–64 ASCII letters/digits/underscore/dot/hyphen. Password 8–128 characters and confirmation must match.

- CUSTOMER requires `firstName` (trimmed 1–100 chars) and `lastName` (1–99 chars); joined into users.display_name. Example: `{ "role": "CUSTOMER", "username": "0000000000001", "firstName": "Test", "lastName": "Customer", "password": "ExamplePass!2026", "confirmPassword": "ExamplePass!2026" }`.
- SELLER requires `shop`: `{ "name": "Test shop", "category": "Food", "areaCode": "BKK", "address": "123 Test Road, Bangkok", "latitude": 13.75, "longitude": 100.5, "openingHours": "08:00–18:00", "sizeClass": "SMALL" }`. Name max 200, category max 100, area code max 20, address max 500, opening hours text max 500; all nonempty. Coordinates must be finite JSON numbers in latitude [-90,90], longitude [-180,180]. Size SMALL/MEDIUM/LARGE. Atomic nested creation of user + shop, shop name used as displayName; owner derived from new user; PENDING set by server. Opening hours stored as `{ "text": "..." }`.
- GOVERNMENT needs no extra profile fields; display name defaults to username.

201: `{ "user": { "id": "4", "role": "SELLER", "displayName": "Test shop" } }`; 400 invalid/missing role details; 409 duplicate identifier. ACTIVE account created; no JWT, password hash or wallet returned.

Web POST /api/auth/register: same-origin Origin required; forwards request, returns 201 `{ "message": "สมัครสมาชิกสำเร็จ" }`, 400 validation, 409 duplicate, 503 upstream failure. No session cookie; frontend redirects to login after success.

Seller registration now requires shop.address (trimmed 1–500 characters), stored as shops.address separately from area_code. Existing rows may have NULL address. Apply migration 20261011164000_shop_address before running updated API. The register map fills coordinates only; owners type and confirm address text. No geocoding API is provided.
