import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = ts.transpileModule(
  readFileSync(
    new URL("../src/app/api/routing/route.ts", import.meta.url),
    "utf8",
  ),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;
const goodRoute = {
  code: "Ok",
  routes: [
    {
      distance: 1800,
      duration: 240,
      geometry: {
        coordinates: [
          [99.991808, 14.020894],
          [99.974583, 14.025278],
        ],
      },
    },
  ],
};
const params =
  "originLat=14.020894&originLng=99.991808&destinationLat=14.025278&destinationLng=99.974583";
async function run({
  cookie = true,
  role = "CUSTOMER",
  userStatus = 200,
  routeStatus = 200,
  route = goodRoute,
  query = params,
  fail = false,
} = {}) {
  const calls = [];
  const exported = {};
  const response = (status, data) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  });
  const context = {
    exports: exported,
    process: { env: { OSRM_BASE_URL: "https://routing.example" } },
    AbortSignal,
    Number,
    Math,
    require: (name) => {
      if (name === "next/server")
        return {
          NextResponse: { json: (data, options) => ({ data, ...options }) },
        };
      if (name === "next/headers")
        return {
          cookies: async () => ({
            get: () => (cookie ? { value: "test-session" } : undefined),
          }),
        };
      if (name === "@/lib/auth") return { apiUrl: "https://api.example" };
      throw new Error(`Unexpected import ${name}`);
    },
    fetch: async (url, options) => {
      calls.push({ url, options });
      if (fail) throw new Error("offline");
      return calls.length === 1
        ? response(userStatus, { role })
        : response(routeStatus, route);
    },
  };
  vm.runInNewContext(source, context);
  const result = await exported.GET({
    nextUrl: new URL(`https://web.example/api/routing?${query}`),
    signal: new AbortController().signal,
  });
  return { result, calls };
}

test("requires a session before contacting either upstream", async () => {
  const { result, calls } = await run({ cookie: false });
  assert.equal(result.status, 401);
  assert.equal(calls.length, 0);
});
for (const query of [
  "originLat=91&originLng=0&destinationLat=1&destinationLng=1",
  "originLat=&originLng=0&destinationLat=1&destinationLng=1",
  `${params}&url=https://unexpected.example`,
  "originLat=NaN&originLng=0&destinationLat=1&destinationLng=1",
]) {
  test(`rejects invalid coordinates/options: ${query}`, async () => {
    const { result, calls } = await run({ query });
    assert.equal(result.status, 400);
    assert.equal(calls.length, 0);
  });
}
test("checks role and prevents seller routing", async () => {
  const { result, calls } = await run({ role: "SELLER" });
  assert.equal(result.status, 403);
  assert.equal(calls.length, 1);
});
test("rejects an expired upstream session", async () => {
  const { result, calls } = await run({ userStatus: 401 });
  assert.equal(result.status, 401);
  assert.equal(calls.length, 1);
});
test("sends lon/lat to OSRM and converts GeoJSON to Leaflet lat/lon", async () => {
  const { result, calls } = await run();
  assert.equal(result.status, 200);
  assert(calls[1].url.includes("99.991808,14.020894;99.974583,14.025278"));
  assert(calls[1].url.includes("geometries=geojson"));
  assert.deepEqual(JSON.parse(JSON.stringify(result.data)), {
    distanceMeters: 1800,
    durationSeconds: 240,
    coordinates: [
      [14.020894, 99.991808],
      [14.025278, 99.974583],
    ],
  });
  assert.equal(result.headers["Cache-Control"], "no-store");
});
test("reports no route without fabricating a line", async () => {
  assert.equal((await run({ route: { code: "NoRoute" } })).result.status, 404);
});
test("reports malformed geometry", async () => {
  assert.equal(
    (
      await run({
        route: {
          code: "Ok",
          routes: [
            {
              distance: 1,
              duration: 1,
              geometry: {
                coordinates: [
                  [999, 1],
                  [1, 1],
                ],
              },
            },
          ],
        },
      })
    ).result.status,
    503,
  );
});
test("reports routing upstream failure", async () => {
  assert.equal((await run({ routeStatus: 503 })).result.status, 503);
});
test("reports network failure", async () => {
  assert.equal((await run({ fail: true })).result.status, 503);
});
