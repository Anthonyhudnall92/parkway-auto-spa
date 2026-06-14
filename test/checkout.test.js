/* Logic tests for PayKit (Node, no browser). Run: node test/checkout.test.js */
const assert = require("node:assert");
const PayKit = require("../js/checkout.js");

// formatUSD
assert.strictEqual(PayKit.formatUSD(1234.5), "$1,234.50");
assert.strictEqual(PayKit.formatUSD(8), "$8.00");
assert.strictEqual(PayKit.formatUSD(0), "$0.00");

// luhnValid
assert.ok(PayKit.luhnValid("4242 4242 4242 4242"), "valid test card");
assert.ok(PayKit.luhnValid("4111111111111111"), "valid visa");
assert.ok(!PayKit.luhnValid("4242 4242 4242 4241"), "bad checksum");
assert.ok(!PayKit.luhnValid("1234"), "too short");
assert.ok(!PayKit.luhnValid("abcd efgh"), "non-numeric");

// expiryValid (now = {y, m})
assert.ok(PayKit.expiryValid(12, 30, { y: 2026, m: 6 }), "future year");
assert.ok(PayKit.expiryValid(6, 26, { y: 2026, m: 6 }), "current month ok");
assert.ok(!PayKit.expiryValid(5, 26, { y: 2026, m: 6 }), "last month expired");
assert.ok(!PayKit.expiryValid(1, 20, { y: 2026, m: 6 }), "past year");
assert.ok(!PayKit.expiryValid(13, 30, { y: 2026, m: 6 }), "bad month");

// cvcValid
assert.ok(PayKit.cvcValid("123"));
assert.ok(PayKit.cvcValid("1234"));
assert.ok(!PayKit.cvcValid("12"));
assert.ok(!PayKit.cvcValid("12a"));

// reference
assert.strictEqual(PayKit.reference(123), "PAS-000123");
assert.strictEqual(PayKit.reference(1), "PAS-000001");

// buildReceipt
const r = PayKit.buildReceipt({
  label: "Exterior wash",
  amount: 8,
  reference: "PAS-000001",
  when: new Date("2026-06-14T15:00:00Z")
});
assert.strictEqual(r.amount, "$8.00");
assert.strictEqual(r.label, "Exterior wash");
assert.strictEqual(r.reference, "PAS-000001");
assert.ok(typeof r.when === "string" && r.when.length > 0);

console.log("checkout.test.js OK");
