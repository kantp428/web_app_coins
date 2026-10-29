import assert from "node:assert/strict";
import { reconcileSellerPaymentQr } from "../src/lib/seller-payment-qr.ts";

const first = { id: "fixture-first-qr", status: "PENDING", amount: "100.00" };
const next = { id: "fixture-next-qr", status: "PENDING", amount: "200.00" };
let checks = 0;
assert.equal(reconcileSellerPaymentQr(first, [{ ...first }]), first);
checks++;
for (const status of ["PAID", "CANCELLED", "EXPIRED"]) {
  assert.equal(reconcileSellerPaymentQr(first, [{ ...first, status }]), null);
  checks++;
}
assert.equal(reconcileSellerPaymentQr(first, []), first);
checks++;
// A poll started before creation cannot hide the newly generated request.
assert.equal(
  reconcileSellerPaymentQr(next, [{ ...first, status: "PAID" }]),
  next,
);
checks++;
// A stale PENDING response after completion cannot revive the old QR.
const completed = reconcileSellerPaymentQr(first, [
  { ...first, status: "PAID" },
]);
assert.equal(reconcileSellerPaymentQr(completed, [first]), null);
checks++;
assert.equal(
  reconcileSellerPaymentQr(null, [{ ...first, status: "PAID" }]),
  null,
);
checks++;
console.log(`Seller payment QR lifecycle checks passed: ${checks}`);
