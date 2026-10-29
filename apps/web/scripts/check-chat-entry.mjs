import assert from "node:assert/strict";
import { createChatEntryStore } from "../src/lib/chat-entry.ts";

let checks = 0;
const events = new EventTarget();
const entry = createChatEntryStore(events);
assert.equal(entry.getSnapshot(), 0);
assert.equal(entry.getServerSnapshot(), 0);
checks++;

let notifications = 0;
let stop = entry.subscribe(() => {
  notifications++;
});
const initial = entry.getSnapshot();
assert.notEqual(initial, 0);
assert.equal(entry.getSnapshot(), initial);
assert.equal(notifications, 1);
checks++;

events.dispatchEvent(
  Object.assign(new Event("pageshow"), { persisted: false }),
);
events.dispatchEvent(new Event("visibilitychange"));
assert.equal(entry.getSnapshot(), initial);
checks++;

events.dispatchEvent(Object.assign(new Event("pageshow"), { persisted: true }));
const restored = entry.getSnapshot();
assert.notEqual(restored, initial);
checks++;

events.dispatchEvent(new Event("popstate"));
const returned = entry.getSnapshot();
assert.notEqual(returned, restored);
checks++;

events.dispatchEvent(new Event("pagehide"));
const hidden = entry.getSnapshot();
assert.notEqual(hidden, returned);
checks++;

stop();
const inactiveNotifications = notifications;
events.dispatchEvent(new Event("popstate"));
events.dispatchEvent(new Event("pagehide"));
events.dispatchEvent(Object.assign(new Event("pageshow"), { persisted: true }));
assert.equal(entry.getSnapshot(), hidden);
assert.equal(notifications, inactiveNotifications);
checks++;

stop = entry.subscribe(() => {
  notifications++;
});
assert.notEqual(entry.getSnapshot(), hidden);
checks++;

const independent = createChatEntryStore(new EventTarget());
assert.equal(independent.getSnapshot(), 0);
events.dispatchEvent(new Event("popstate"));
assert.equal(independent.getSnapshot(), 0);
stop();
checks++;

console.log(
  `Chat entry lifecycle: ${checks} cases PASS (synthetic navigation/page restore; no browser or user history read).`,
);
