// DTO and server-rendered card regression; no real users, services or awards.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import * as rateContract from "../src/lib/store-coin-rate.ts";

const require = createRequire(import.meta.url);
function sourceModule(relative, aliases = {}) {
  const source = readFileSync(new URL(relative, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2020,
    },
  });
  const exports = {};
  new Function("require", "exports", compiled.outputText)(
    (name) => aliases[name] ?? require(name),
    exports,
  );
  return exports;
}
const { chatStoresSchema } = sourceModule("../src/lib/chat-contract.ts", {
  "./store-coin-rate": rateContract,
});
const reward = sourceModule("../src/components/wallet/store-coin-reward.tsx");
const categories = sourceModule("../src/components/wallet/category-icon.tsx");
const { RecommendedStoreCard } = sourceModule(
  "../src/components/chat/recommended-store-card.tsx",
  {
    "@/components/wallet/category-icon": categories,
    "@/components/wallet/store-coin-reward": reward,
  },
);
const store = {
  id: "1",
  name: "Fixture shop",
  description: null,
  address: null,
  latitude: "13.75",
  longitude: "100.5",
  distanceKm: 0.3,
  categories: ["อาหาร"],
  coinRate: {
    coins: 10,
    minimumPurchase: "50.00",
    endsAt: "2099-12-31T23:59:59.000Z",
  },
};
let checks = 0;
const [decoded] = chatStoresSchema.parse({ stores: [store] }).stores;
assert.deepEqual(decoded.coinRate, store.coinRate); // must survive Zod decoding
let html = renderToStaticMarkup(
  createElement(RecommendedStoreCard, { store: decoded }),
);
assert.match(html, /<strong[^>]*>10<\/strong>/);
assert.ok(html.includes("50.00"));
checks++;
html = renderToStaticMarkup(
  createElement(reward.StoreCoinReward, {
    rate: { ...store.coinRate, coins: 1 },
  }),
);
assert.match(html, /<strong[^>]*>1<\/strong>/);
checks++;
html = renderToStaticMarkup(
  createElement(reward.StoreCoinReward, { rate: null }),
);
assert.ok(html.includes("ยังไม่มีข้อมูล Coins"));
assert.ok(!html.includes("<strong"));
checks++;
const legacy = { ...store };
delete legacy.coinRate;
assert.equal(
  chatStoresSchema.parse({ stores: [legacy] }).stores[0].coinRate,
  null,
);
checks++;
for (const changes of [
  { coins: 0 },
  { coins: 11 },
  { coins: "10" },
  { minimumPurchase: "unknown" },
  { endsAt: "invalid" },
]) {
  assert.equal(
    chatStoresSchema.safeParse({
      stores: [{ ...store, coinRate: { ...store.coinRate, ...changes } }],
    }).success,
    false,
  );
  checks++;
}
console.log(`Store Coins DTO/card checks passed: ${checks}`);
