/* Verifies the vendored QR encoder works (Node). Run: node test/qr.test.js */
const assert = require("node:assert");
const qrcode = require("../js/qrcode-generator.js");

const qr = qrcode(0, "M");
qr.addData("https://parkwayautospa.com/pay.html");
qr.make();

const count = qr.getModuleCount();
assert.ok(count > 0, "module count should be positive");
assert.strictEqual(typeof qr.isDark(0, 0), "boolean");
assert.ok(typeof qr.createSvgTag === "function", "lib exposes createSvgTag");

console.log("qr.test.js OK (modules: " + count + ")");
