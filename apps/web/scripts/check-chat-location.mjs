import assert from "node:assert/strict";
import { currentChatLocation } from "../src/lib/chat-location.ts";

let checks = 0;
const validPosition = { coords: { latitude: 13.75, longitude: 100.5 } };
let requestedOptions;
assert.deepEqual(
  await currentChatLocation(new AbortController().signal, {
    getCurrentPosition(success, _failure, options) {
      requestedOptions = options;
      success(validPosition);
    },
  }),
  { latitude: 13.75, longitude: 100.5, radiusKm: 5 },
);
assert.ok(requestedOptions.timeout > 0 && requestedOptions.timeout <= 15000);
assert.ok(requestedOptions.maximumAge <= 30000);
checks++;

await assert.rejects(
  currentChatLocation(new AbortController().signal, undefined),
  /Geolocation unavailable/,
);
checks++;

const denied = { code: 1, message: "Permission denied fixture" };
await assert.rejects(
  currentChatLocation(new AbortController().signal, {
    getCurrentPosition(_success, failure) {
      failure(denied);
    },
  }),
  { code: 1 },
);
checks++;

let calls = 0;
const cancelled = new AbortController();
cancelled.abort();
await assert.rejects(
  currentChatLocation(cancelled.signal, {
    getCurrentPosition() {
      calls++;
    },
  }),
  { name: "AbortError" },
);
assert.equal(calls, 0);
checks++;

let lateSuccess;
const inFlight = new AbortController();
const waiting = currentChatLocation(inFlight.signal, {
  getCurrentPosition(success) {
    lateSuccess = success;
  },
});
inFlight.abort();
await assert.rejects(waiting, { name: "AbortError" });
lateSuccess(validPosition);
await assert.rejects(waiting, { name: "AbortError" });
checks++;

const deadline = new AbortController();
const timeout = setTimeout(
  () => deadline.abort(new DOMException("Deadline reached", "TimeoutError")),
  5,
);
await assert.rejects(
  currentChatLocation(deadline.signal, { getCurrentPosition() {} }),
  { name: "TimeoutError" },
);
clearTimeout(timeout);
checks++;

for (const coords of [
  { latitude: NaN, longitude: 100 },
  { latitude: 13, longitude: 181 },
]) {
  await assert.rejects(
    currentChatLocation(new AbortController().signal, {
      getCurrentPosition(success) {
        success({ coords });
      },
    }),
    /Invalid current location/,
  );
  checks++;
}

await assert.rejects(
  currentChatLocation(new AbortController().signal, {
    getCurrentPosition() {
      throw new DOMException("Blocked fixture", "SecurityError");
    },
  }),
  { name: "SecurityError" },
);
checks++;

console.log(
  `Chat current-location checks: ${checks} cases PASS (synthetic browser geolocation; no device location read).`,
);
