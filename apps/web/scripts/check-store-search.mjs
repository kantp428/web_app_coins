import assert from "node:assert/strict";
import { collectMatchingStoreIds } from "../src/lib/collect-store-search.ts";

let checks = 0;
function result(page, total, ids) {
  return {
    shopIds: ids,
    source: "llm",
    meta: { page, pageSize: 50, total, hasNextPage: page * 50 < total },
  };
}
const pages = [];
const all = await collectMatchingStoreIds(async (page) => {
  pages.push(page);
  return result(
    page,
    251,
    Array.from({ length: Math.min(50, 251 - (page - 1) * 50) }, (_, i) =>
      String((page - 1) * 50 + i + 1),
    ),
  );
}, new AbortController().signal);
assert.equal(all.length, 251);
assert.equal(all.at(-1), "251");
assert.deepEqual(pages, [1, 2, 3, 4, 5, 6]);
checks++;
const sparse = await collectMatchingStoreIds(
  async (page) => result(page, 101, page === 3 ? ["101"] : []),
  new AbortController().signal,
);
assert.deepEqual(sparse, ["101"]);
checks++;
for (const scenario of [
  "duplicate",
  "changed-total",
  "wrong-page",
  "failed-page",
]) {
  await assert.rejects(
    collectMatchingStoreIds(async (page) => {
      if (page === 1) return result(page, 51, ["1"]);
      if (scenario === "failed-page") throw new Error("Fixture failure");
      return result(
        scenario === "wrong-page" ? 3 : page,
        scenario === "changed-total" ? 52 : 51,
        [scenario === "duplicate" ? "1" : "51"],
      );
    }, new AbortController().signal),
  );
  checks++;
}
const aborted = new AbortController();
let calls = 0;
await assert.rejects(
  collectMatchingStoreIds(async (page) => {
    calls++;
    aborted.abort();
    return result(page, 51, ["1"]);
  }, aborted.signal),
  { name: "AbortError" },
);
assert.equal(calls, 1);
checks++;
console.log(`Store search pagination checks passed: ${checks}`);
