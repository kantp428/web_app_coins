// Isolated HTTP integration checks. No real accounts, AI, database or payments.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { collectMatchingStoreIds } from "../src/lib/collect-store-search.ts";

const appDir = fileURLToPath(new URL("../", import.meta.url));
const base = "http://127.0.0.1:3101";
const token = "local-chat-fixture-session";
const sellerToken = "local-seller-fixture-session";
let ownedStore = {
  id: "501",
  name: "Fixture owned shop",
  latitude: "13.750000",
  longitude: "100.500000",
  address: null,
  participationStatus: "APPROVED",
};
let lastChat;
let lastSearch;
let failBatch = false;
const shops = [
  {
    id: "101",
    name: "ร้านทดสอบอาหารตามสั่ง",
    description: "ข้อมูลทดสอบ: อาหารตามสั่งและผัดกะเพรา",
    categories: ["อาหาร"],
    address: { line1: "จุดทดสอบ", province: "พื้นที่ทดสอบ" },
    latitude: "13.750100",
    longitude: "100.500100",
    distanceKm: 0.35,
    coinRate: {
      coins: 10,
      minimumPurchase: "50.00",
      endsAt: "2099-12-31T23:59:59.000Z",
    },
  },
  {
    id: "102",
    name: "ร้านทดสอบกาแฟ",
    description: "ข้อมูลทดสอบ: กาแฟและเครื่องดื่ม",
    categories: ["เครื่องดื่ม"],
    address: null,
    latitude: "13.750200",
    longitude: "100.500200",
    distanceKm: 0.6,
    coinRate: null,
  },
];
const exploreShops = Array.from({ length: 251 }, (_, i) => ({
  ...shops[0],
  id: String(1001 + i),
}));
function json(response, body, status = 200) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}
const fixture = createServer(async (request, response) => {
  const path = new URL(request.url, "http://127.0.0.1").pathname;
  if (path === "/session") {
    response.writeHead(303, {
      "Set-Cookie": `session=${token}; HttpOnly; SameSite=Lax; Path=/`,
      Location: `${base}/wallet`,
    });
    return response.end();
  }
  const sellerRequest =
    request.headers.authorization === `Bearer ${sellerToken}`;
  if (!sellerRequest && request.headers.authorization !== `Bearer ${token}`)
    return json(response, { detail: "private-fixture-detail" }, 401);
  if (path === "/me")
    return json(response, {
      id: "1",
      displayName: "ผู้ใช้ทดสอบ UI",
      role: sellerRequest ? "SELLER" : "CUSTOMER",
    });
  if (path === "/wallets/me")
    return json(response, {
      role: "CUSTOMER",
      balance: "0.00",
      help: "0.00",
      helpDailyRemaining: "0.00",
      helpDailyLimit: "200.00",
      helpMonthlyLimit: "1000.00",
      month: "2026-10",
      coins: "0",
      testActionsEnabled: false,
      shopCoinRates: [],
    });
  if (path === "/stores" && request.method === "GET") {
    const query = new URL(request.url, "http://127.0.0.1").searchParams;
    const page = Number(query.get("page") ?? 1);
    const pageSize = Number(query.get("pageSize") ?? 50);
    const radiusKm = Number(query.get("radiusKm"));
    const scoped = exploreShops.filter((shop) => shop.distanceKm <= radiusKm);
    return json(response, {
      radiusKm,
      stores: scoped.slice((page - 1) * pageSize, page * pageSize),
      meta: {
        page,
        pageSize,
        total: scoped.length,
        hasNextPage: page * pageSize < scoped.length,
      },
    });
  }
  let raw = "";
  for await (const chunk of request) raw += chunk;
  const body = raw ? JSON.parse(raw) : {};
  if (path === "/seller/stores" && request.method === "GET") {
    return sellerRequest
      ? json(response, { stores: [ownedStore] })
      : json(response, { detail: "private-fixture-detail" }, 403);
  }
  if (path.startsWith("/seller/stores/") && request.method === "PATCH") {
    if (!sellerRequest)
      return json(response, { detail: "private-fixture-detail" }, 403);
    if (path !== `/seller/stores/${ownedStore.id}/location`)
      return json(response, { detail: "private-fixture-detail" }, 404);
    ownedStore = {
      ...ownedStore,
      latitude: Number(body.latitude).toFixed(6),
      longitude: Number(body.longitude).toFixed(6),
      address: body.address,
    };
    return json(response, ownedStore);
  }
  if (path === "/stores/batch" || path === "/recommendations/stores") {
    if (path === "/recommendations/stores" && sellerRequest)
      return json(response, { detail: "private-fixture-detail" }, 403);
    if (failBatch) {
      failBatch = false;
      return json(
        response,
        { message: "Fixture hydration temporarily unavailable" },
        503,
      );
    }
    return json(response, {
      stores: body.shopIds.flatMap((id) =>
        [...shops, ...exploreShops].filter(
          (shop) =>
            shop.id === id &&
            (path === "/recommendations/stores" ||
              shop.distanceKm <= body.radiusKm),
        ),
      ),
    });
  }
  if (path === "/stores/search") {
    lastSearch = body;
    const statuses = {
      expired: 401,
      forbidden: 403,
      unavailable: 503,
      timeout: 504,
      failure: 500,
    };
    if (statuses[body.query])
      return json(
        response,
        { detail: "private-fixture-detail" },
        statuses[body.query],
      );
    const page = body.page;
    const result = {
      shopIds: exploreShops
        .slice((page - 1) * 50, page * 50)
        .map((shop) => shop.id),
      source: "llm",
      meta: { page, pageSize: 50, total: 251, hasNextPage: page < 6 },
    };
    if (body.query === "duplicate") result.shopIds = ["1001", "1001"];
    if (body.query === "bad-id") result.shopIds = ["fake"];
    if (body.query === "wrong-page") result.meta.page = 2;
    return json(response, result);
  }
  if (path !== "/chat")
    return json(response, { message: "Fixture route not found" }, 404);
  lastChat = body;
  const scenario = body.message;
  if (scenario === "test:slow") await delay(2500);
  if (scenario === "test:bad-json") {
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end("{");
  }
  if (scenario === "test:unavailable")
    return json(response, { detail: "private-fixture-detail" }, 503);
  if (scenario === "test:expired")
    return json(response, { detail: "private-fixture-detail" }, 401);
  if (scenario === "test:forbidden")
    return json(response, { detail: "private-fixture-detail" }, 403);
  if (scenario === "test:timeout")
    return json(response, { detail: "private-fixture-detail" }, 504);
  if (scenario === "test:upstream-error")
    return json(response, { detail: "private-fixture-detail" }, 500);
  if (scenario === "test:cards-error") failBatch = true;
  const result = {
    reply: "คำตอบทดสอบ: ลองดูร้านที่น่าสนใจในการ์ดด้านล่างได้เลยครับ",
    storeIds:
      body.message === "recommend" || body.message.startsWith("test:")
        ? ["101", "102"]
        : [],
    sources: [{ title: "แหล่งข้อมูลทดสอบ", url: "https://www.mof.go.th/" }],
    mode: "model",
    model: "fixture-only",
  };
  if (scenario === "test:partial") result.storeIds = ["101", "103"];
  if (scenario === "test:empty") result.storeIds = [];
  if (scenario === "test:duplicate") result.storeIds = ["101", "101"];
  if (scenario === "test:unsafe-link")
    result.sources[0].url = "javascript:alert(1)";
  if (scenario === "test:ids-without-location") result.storeIds = ["101"];
  return json(response, result);
});
await new Promise((resolve, reject) => {
  fixture.once("error", reject);
  fixture.listen(0, "127.0.0.1", resolve);
});
const fixtureUrl = `http://127.0.0.1:${fixture.address().port}`;
const next = spawn(
  process.execPath,
  [
    fileURLToPath(
      new URL("../node_modules/next/dist/bin/next", import.meta.url),
    ),
    "start",
    "-p",
    "3101",
    "--hostname",
    "127.0.0.1",
  ],
  {
    cwd: appDir,
    windowsHide: true,
    env: {
      ...process.env,
      API_URL: fixtureUrl,
      AI_SERVICE_URL: fixtureUrl,
      WEB_PUBLIC_ORIGIN: base,
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let startupLog = "";
next.stdout.on("data", (chunk) => {
  startupLog += chunk;
});
next.stderr.on("data", (chunk) => {
  startupLog += chunk;
});
function cleanup() {
  next.kill();
  fixture.close();
}
process.once("SIGINT", () => {
  cleanup();
  process.exit(0);
});
process.once("SIGTERM", () => {
  cleanup();
  process.exit(0);
});
let checks = 0;
try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    if (next.exitCode !== null)
      throw new Error(`Test Next server exited: ${startupLog}`);
    try {
      const response = await fetch(`${base}/login`);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    await delay(250);
  }
  assert.ok(ready, "Isolated test server did not start");
  const location = { latitude: 13.75, longitude: 100.5, radiusKm: 5 };
  async function chat(
    body,
    { status = 200, origin = base, cookie = true, raw = false } = {},
  ) {
    const response = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
        ...(cookie ? { Cookie: `session=${token}` } : {}),
      },
      body: raw ? body : JSON.stringify(body),
    });
    const result = await response.json();
    assert.equal(response.status, status);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.ok(!JSON.stringify(result).includes(token));
    assert.ok(!JSON.stringify(result).includes("private-fixture-detail"));
    checks++;
    return result;
  }
  await chat({ message: "hello" }, { cookie: false, status: 401 });
  await chat(
    { message: "hello" },
    { origin: "https://untrusted.invalid", status: 403 },
  );
  await chat("{", { raw: true, status: 400 });
  for (const body of [
    {},
    { message: " " },
    { message: 1 },
    { message: "a".repeat(2001) },
    { message: "hello", userId: "2" },
    { message: "hello", location: { latitude: 13 } },
    { message: "hello", location: { ...location, radiusKm: 51 } },
  ])
    await chat(body, { status: 400 });
  const plain = await chat({ message: "  hello  " });
  assert.equal(lastChat.message, "hello");
  assert.deepEqual(plain.storeIds, []);
  assert.equal("location" in lastChat, false);
  const recommendation = await chat({ message: "recommend", location });
  assert.equal(lastChat.location, undefined);
  assert.deepEqual(recommendation.storeIds, ["101", "102"]);
  assert.deepEqual((await chat({ message: "recommend" })).storeIds, [
    "101",
    "102",
  ]);
  for (const [scenario, status] of [
    ["unavailable", 503],
    ["expired", 401],
    ["forbidden", 403],
    ["timeout", 504],
    ["upstream-error", 502],
    ["bad-json", 502],
    ["duplicate", 502],
    ["unsafe-link", 502],
  ])
    await chat({ message: `test:${scenario}`, location }, { status });
  const unscoped = await chat({ message: "test:ids-without-location" });
  assert.deepEqual(unscoped.storeIds, ["101"]);
  const globalHydration = await fetch(`${base}/api/recommendations/stores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: base,
      Cookie: `session=${token}`,
    },
    body: JSON.stringify({ shopIds: recommendation.storeIds }),
  });
  assert.equal(globalHydration.status, 200);
  const globalShops = (await globalHydration.json()).stores;
  assert.deepEqual(
    globalShops.map((shop) => shop.id),
    ["101", "102"],
  );
  assert.ok(globalShops.every((shop) => !("distanceKm" in shop)));
  checks++;
  for (const [body, cookie, origin, status] of [
    [{ shopIds: ["101"] }, "", base, 401],
    [{ shopIds: ["101"] }, token, "https://untrusted.invalid", 403],
    [{ shopIds: ["101"] }, sellerToken, base, 403],
    [{ shopIds: ["101"], latitude: 0 }, token, base, 400],
    [{ shopIds: ["1", "2", "3", "4", "5", "6"] }, token, base, 400],
  ]) {
    const response = await fetch(`${base}/api/recommendations/stores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
        ...(cookie ? { Cookie: `session=${cookie}` } : {}),
      },
      body: JSON.stringify(body),
    });
    assert.equal(response.status, status);
    assert.equal(response.headers.get("cache-control"), "no-store");
    checks++;
  }
  const hydration = await fetch(`${base}/api/stores/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: base,
      Cookie: `session=${token}`,
    },
    body: JSON.stringify({
      shopIds: recommendation.storeIds,
      ...location,
      categoryIds: [],
    }),
  });
  assert.equal(hydration.status, 200);
  assert.deepEqual(
    (await hydration.clone().json()).stores.map((shop) => shop.id),
    ["101", "102"],
  );
  assert.equal((await hydration.json()).stores[0].coinRate.coins, 10);
  checks++;
  const page = await fetch(`${base}/AI-chatbot`, {
    headers: { Cookie: `session=${token}` },
  });
  assert.equal(page.status, 200);
  assert.ok((await page.text()).includes("AI"));
  checks++;
  const unauthorized = await fetch(`${base}/AI-chatbot`, {
    redirect: "manual",
  });
  assert.equal(unauthorized.status, 307);
  assert.ok(unauthorized.headers.get("location").endsWith("/login"));
  checks++;
  async function explore(
    body,
    { status = 200, cookie = true, origin = base } = {},
  ) {
    const response = await fetch(`${base}/api/recommendations/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
        ...(cookie ? { Cookie: `session=${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    assert.equal(response.status, status);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.ok(!JSON.stringify(result).includes(token));
    assert.ok(!JSON.stringify(result).includes("private-fixture-detail"));
    checks++;
    return result;
  }
  const searchBody = { query: "  ผัดกะเพรา  ", ...location };
  await explore(searchBody, { cookie: false, status: 401 });
  await explore(searchBody, {
    origin: "https://untrusted.invalid",
    status: 403,
  });
  for (const changes of [
    { query: " " },
    { radiusKm: 51 },
    { categoryIds: [] },
    { page: 0 },
  ])
    await explore({ ...searchBody, ...changes }, { status: 400 });
  for (const [query, status] of [
    ["expired", 401],
    ["forbidden", 403],
    ["unavailable", 503],
    ["timeout", 504],
    ["failure", 502],
    ["duplicate", 502],
    ["bad-id", 502],
    ["wrong-page", 502],
  ])
    await explore({ ...searchBody, query }, { status });
  const allIds = await collectMatchingStoreIds(
    (page) => explore({ ...searchBody, page }),
    new AbortController().signal,
  );
  assert.equal(allIds.length, 251);
  assert.equal(lastSearch.query, "ผัดกะเพรา");
  assert.equal(lastSearch.radiusKm, location.radiusKm);
  assert.equal("categoryIds" in lastSearch, false);
  const cards = [];
  for (let offset = 0; offset < allIds.length; offset += 100) {
    const response = await fetch(`${base}/api/stores/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: base,
        Cookie: `session=${token}`,
      },
      body: JSON.stringify({
        shopIds: allIds.slice(offset, offset + 100),
        ...location,
        categoryIds: [],
      }),
    });
    assert.equal(response.status, 200);
    cards.push(...(await response.json()).stores);
  }
  assert.deepEqual(
    cards.map((card) => card.id),
    allIds,
  );
  assert.ok(cards.every((card) => card.coinRate.coins === 10));
  checks++;
  const discovery = await fetch(
    `${base}/api/stores?latitude=13.75&longitude=100.5&radiusKm=5&page=1&pageSize=100`,
    { headers: { Cookie: `session=${token}` } },
  );
  assert.equal(discovery.status, 200);
  const discoveryBody = await discovery.json();
  assert.equal(discoveryBody.stores.length, 100);
  assert.deepEqual(discoveryBody.stores[0].coinRate, shops[0].coinRate);
  checks++;
  const explorePage = await fetch(`${base}/wallet/explore`, {
    headers: { Cookie: `session=${token}` },
  });
  assert.equal(explorePage.status, 200);
  const exploreHtml = await explorePage.text();
  assert.ok(exploreHtml.includes("ค้นหาด้วย AI"));
  assert.ok(!exploreHtml.includes("explore-category-label"));
  checks++;
  async function sellerStores(
    method,
    path,
    body,
    { status = 200, cookie = sellerToken, origin = base } = {},
  ) {
    const response = await fetch(base + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
        ...(cookie ? { Cookie: `session=${cookie}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const result = await response.json();
    assert.equal(response.status, status);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.ok(!JSON.stringify(result).includes(sellerToken));
    assert.ok(!JSON.stringify(result).includes("private-fixture-detail"));
    checks++;
    return result;
  }
  const storesPath = "/api/seller/stores",
    locationPath = `${storesPath}/501/location`;
  const storeLocation = {
    latitude: "14.200000",
    longitude: "101.300000",
    address: {
      line1: "New fixture road",
      province: "",
      district: "",
      subDistrict: "",
      postcode: "",
    },
  };
  await sellerStores("GET", storesPath, undefined, { status: 401, cookie: "" });
  await sellerStores("GET", storesPath, undefined, {
    status: 403,
    cookie: token,
  });
  await sellerStores("GET", storesPath + "?ownerId=42", undefined, {
    status: 400,
  });
  await sellerStores("PATCH", locationPath, storeLocation, {
    status: 401,
    cookie: "",
  });
  await sellerStores("PATCH", locationPath, storeLocation, {
    status: 403,
    cookie: token,
  });
  await sellerStores("PATCH", locationPath, storeLocation, {
    status: 403,
    origin: "https://untrusted.invalid",
  });
  for (const changes of [
    { latitude: "91" },
    { ownerId: "42" },
    { address: { ...storeLocation.address, postcode: "123" } },
  ])
    await sellerStores(
      "PATCH",
      locationPath,
      { ...storeLocation, ...changes },
      { status: 400 },
    );
  await sellerStores("PATCH", `${storesPath}/999/location`, storeLocation, {
    status: 404,
  });
  const beforeEdit = await sellerStores("GET", storesPath);
  assert.equal(beforeEdit.stores[0].latitude, "13.750000");
  const updatedStore = await sellerStores("PATCH", locationPath, storeLocation);
  assert.equal(updatedStore.participationStatus, "APPROVED");
  const afterEdit = await sellerStores("GET", storesPath);
  assert.equal(afterEdit.stores[0].latitude, storeLocation.latitude);
  assert.equal(afterEdit.stores[0].address.line1, storeLocation.address.line1);
  const settings = await fetch(base + "/store/settings", {
    headers: { Cookie: `session=${sellerToken}` },
  });
  assert.equal(settings.status, 200);
  const settingsHtml = await settings.text();
  assert.ok(settingsHtml.includes("ตำแหน่งร้านของฉัน"));
  assert.ok(!settingsHtml.includes("UI Preview"));
  checks++;
  console.log(
    `Web HTTP integration: ${checks} cases PASS (isolated local fixtures; no real AI/DB).`,
  );
  if (process.argv.includes("--ui")) {
    console.log(`UI fixture session: ${fixtureUrl}/session`);
    console.log(
      "Next fixture page: http://127.0.0.1:3101/AI-chatbot (Ctrl+C stops owned test servers)",
    );
  } else cleanup();
} catch (error) {
  cleanup();
  console.error(error);
  process.exitCode = 1;
}
