# Parkway Auto Spa Revamp — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone, offline-capable static demo website for Parkway Auto Spa that modernizes their site and demonstrates four payment options (pay-by-phone + QR, booking deposit, membership billing, gift cards) as realistic demo-mode checkouts.

**Architecture:** Plain HTML pages share one CSS token sheet and a small JS layer. `main.js` injects a consistent header/footer (inline templates — works on `file://`, no fetch/CORS). `checkout.js` is a reusable demo checkout whose pure logic (currency, card validation, reference IDs, receipts) is Node-testable. `qr.js` wraps a vendored QR generator (no CDN) to render a real, scannable code.

**Tech Stack:** HTML5, CSS3 (custom properties), vanilla ES, vendored `qrcode-generator` (MIT), `node:assert` for logic tests, `python3 -m http.server` + `curl` for page smoke tests.

---

## File Structure

```
parkway-auto-spa/
  index.html          # Home
  services.html       # Services & pricing
  membership.html     # Monthly plans + recurring-billing signup (demo)
  book.html           # Booking + deposit (demo)
  pay.html            # Pay-by-phone + scannable QR (demo) — headline feature
  gift-cards.html     # Gift cards / prepaid bundles (demo)
  contact.html        # Hours, phone, email, map
  css/styles.css      # Design tokens + all component styles
  js/main.js          # Header/footer injection, mobile nav, active link, year
  js/checkout.js      # PayKit: pure logic + DOM checkout/receipt wiring
  js/qr.js            # renderQR(target, text) wrapper over vendored lib
  js/qrcode-generator.js  # vendored MIT QR encoder (no CDN)
  assets/             # logo.svg, favicon, hero/section imagery
  test/checkout.test.js   # node:assert tests for PayKit pure logic
  test/qr.test.js         # node:assert test that QR encodes (module count > 0)
  scripts/smoke.sh    # serves site, curls each page for 200 + marker
  FOR-THE-OWNER.md    # plain-language leave-behind + go-live steps
  README.md           # how to open/deploy
  docs/superpowers/   # spec + this plan
```

Design token contract (used by every page/component — defined once in `css/styles.css`):

```css
:root{
  --navy:#0C2A4D; --blue:#185FA5; --cyan:#19C3D6;
  --surface:#F5F8FC; --tint:#E6F1FB; --white:#FFFFFF;
  --ink:#0C2A4D; --muted:#5A6B7B; --line:#D8E2EE;
  --radius:14px; --radius-sm:10px; --maxw:1140px;
  --font:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  --shadow:0 6px 24px rgba(12,42,77,.08);
}
```

`PayKit` interface (defined in Task 4, consumed by Tasks 8–11):

```
PayKit.formatUSD(amount) -> "$1,234.56"        // number dollars -> string
PayKit.luhnValid(cardNumber) -> boolean         // digits/spaces ok
PayKit.expiryValid(mm, yy, now) -> boolean       // now = {y, m} for testability
PayKit.cvcValid(cvc) -> boolean                  // 3-4 digits
PayKit.reference(seq) -> "PAS-000123"            // deterministic from integer
PayKit.buildReceipt({label, amount, reference, when}) -> {label, amount, reference, when} formatted
PayKit.mountCheckout(rootEl, {label, amount, mode}) // DOM wiring; DOMContentLoaded-guarded
```

`qr.js` interface:

```
renderQR(targetEl, text)  // clears target, appends scannable QR (SVG)
```

---

## Task 1: Scaffold project files & README

**Files:**
- Create: `.gitignore`, `README.md`, `assets/.gitkeep`, `css/styles.css` (empty stub), `js/main.js` (empty stub)

- [ ] **Step 1: Create `.gitignore`**

```
.DS_Store
node_modules/
*.log
```

- [ ] **Step 2: Create `README.md`** — title, one-paragraph description, "Open: double-click `index.html`", "Deploy: drag the folder to Netlify or push to GitHub Pages", "Demo mode: checkout charges nothing", link to `FOR-THE-OWNER.md` and the spec.

- [ ] **Step 3: Create empty `css/styles.css` and `js/main.js` stubs and `assets/.gitkeep`.**

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: scaffold project structure and README"
```

---

## Task 2: Design tokens + shared component CSS

**Files:**
- Modify: `css/styles.css`

- [ ] **Step 1: Write the token `:root` block** exactly as in the Design token contract above.

- [ ] **Step 2: Add base + layout styles:** CSS reset essentials (`box-sizing:border-box`, margins), `body{font-family:var(--font);color:var(--ink);background:var(--white);line-height:1.6}`, `.wrap{max-width:var(--maxw);margin:0 auto;padding:0 20px}`, heading scale, `a{color:var(--blue)}`.

- [ ] **Step 3: Add component styles:** sticky `.site-header` (white, bottom border `--line`), `.nav` (flex, links, active state cyan underline), `.btn` (filled blue), `.btn-accent` (cyan), `.btn-ghost` (outline), `.card` (white, `--radius`, `--shadow`, border `--line`), `.section` (vertical padding), `.section--tint{background:var(--tint)}`, `.grid` helpers (`repeat(auto-fit,minmax(240px,1fr))`), `.badge`, `.price`, `.site-footer` (navy bg, white text), mobile `.nav-toggle` + responsive `@media (max-width:760px)` collapse.

- [ ] **Step 4: Verify** — open `index.html` later; for now confirm file parses: `npx --yes csslint css/styles.css || true` (advisory). Confirm no syntax error by eye.

- [ ] **Step 5: Commit**

```bash
git add css/styles.css && git commit -m "feat: add design tokens and shared component styles"
```

---

## Task 3: Shared header/footer + nav (main.js)

**Files:**
- Modify: `js/main.js`

- [ ] **Step 1: Implement header/footer injection.** Each page includes `<div id="site-header"></div>` and `<div id="site-footer"></div>`. `main.js` defines inline template strings and injects on `DOMContentLoaded`. Nav links: Home, Services, Membership, Book, Pay, Gift Cards, Contact; plus a `.btn-accent` "Pay now" → `pay.html`. Header includes logo (`assets/logo.svg` or text fallback "Parkway Auto Spa").

```js
const NAV = [
  ["Home","index.html"],["Services","services.html"],["Membership","membership.html"],
  ["Book","book.html"],["Pay","pay.html"],["Gift cards","gift-cards.html"],["Contact","contact.html"]
];
function headerHTML(){ /* build .site-header with .wrap, logo, nav, .nav-toggle, Pay now btn */ }
function footerHTML(){ /* navy footer: hours (Mon–Sat 8–6:30, Sun 9–5), phone 972-569-8683,
  manager@parkwayautospa.com, McKinney TX, quick links, © year via new Date().getFullYear() */ }
```

- [ ] **Step 2: Active link + mobile toggle.** Mark the link whose href matches `location.pathname`'s filename with class `active`. Wire `.nav-toggle` to toggle a `.open` class on the nav.

- [ ] **Step 3: Verify** — created later with Home; confirm injection by opening `index.html` and seeing header/footer. Smoke test (Task 13) greps for "Parkway Auto Spa" in served HTML *after* JS — instead grep static markers in each page's own content.

- [ ] **Step 4: Commit**

```bash
git add js/main.js && git commit -m "feat: shared header, footer, and nav injection"
```

---

## Task 4: Demo checkout module (PayKit) — TDD

**Files:**
- Create: `js/checkout.js`, `test/checkout.test.js`

- [ ] **Step 1: Write failing tests** in `test/checkout.test.js`:

```js
const assert = require('node:assert');
const PayKit = require('../js/checkout.js');

assert.strictEqual(PayKit.formatUSD(1234.5), '$1,234.50');
assert.strictEqual(PayKit.formatUSD(8), '$8.00');
assert.ok(PayKit.luhnValid('4242 4242 4242 4242'));
assert.ok(!PayKit.luhnValid('4242 4242 4242 4241'));
assert.ok(PayKit.expiryValid(12, 30, {y:2026,m:6}));
assert.ok(!PayKit.expiryValid(1, 20, {y:2026,m:6}));
assert.ok(PayKit.cvcValid('123'));
assert.ok(!PayKit.cvcValid('12'));
assert.strictEqual(PayKit.reference(123), 'PAS-000123');
const r = PayKit.buildReceipt({label:'Exterior wash', amount:8, reference:'PAS-000001', when:new Date('2026-06-14T15:00:00Z')});
assert.strictEqual(r.amount, '$8.00');
assert.strictEqual(r.label, 'Exterior wash');
console.log('checkout.test.js OK');
```

- [ ] **Step 2: Run to verify it fails**

Run: `node test/checkout.test.js`
Expected: FAIL (cannot find module / function undefined).

- [ ] **Step 3: Implement `js/checkout.js`.** Pure functions on a `PayKit` object; **no top-level DOM access**. Luhn over stripped digits; `formatUSD` via `Intl.NumberFormat('en-US',{style:'currency',currency:'USD'})`; `reference(seq)` zero-pads to 6 digits; `buildReceipt` formats amount with `formatUSD` and a readable date. `mountCheckout(rootEl,{label,amount,mode})` builds the Stripe-style form (card/expiry/cvc inputs, "or pay with" Apple/Google-style buttons, a visible "Demo — no real charge" badge), validates on submit using the pure fns, and on success swaps in a receipt built from `buildReceipt` + `reference`. Export for Node:

```js
if (typeof module !== 'undefined' && module.exports) module.exports = PayKit;
```

Guard DOM wiring so requiring in Node is side-effect-free.

- [ ] **Step 4: Run to verify it passes**

Run: `node test/checkout.test.js`
Expected: `checkout.test.js OK`

- [ ] **Step 5: Commit**

```bash
git add js/checkout.js test/checkout.test.js && git commit -m "feat: demo checkout module with tested pure logic"
```

---

## Task 5: Vendored QR generator + wrapper — TDD

**Files:**
- Create: `js/qrcode-generator.js` (vendored MIT lib), `js/qr.js`, `test/qr.test.js`

- [ ] **Step 1: Vendor the lib.** Obtain `qrcode-generator` (Kazuhiko Arase, MIT) as a single UMD file and save to `js/qrcode-generator.js` (downloaded during build; the file is committed so the site stays offline-capable). Keep the license header.

- [ ] **Step 2: Write failing test** `test/qr.test.js`:

```js
const assert = require('node:assert');
const qrcode = require('../js/qrcode-generator.js');
const qr = qrcode(0, 'M');
qr.addData('https://parkwayautospa.com/pay.html');
qr.make();
assert.ok(qr.getModuleCount() > 0);
console.log('qr.test.js OK');
```

- [ ] **Step 3: Run to verify** lib loads in Node: `node test/qr.test.js` → `qr.test.js OK`. (If the UMD export differs, adjust the require/access in this test to match the lib's Node export.)

- [ ] **Step 4: Implement `js/qr.js`** — `renderQR(targetEl, text)` creates a QR (`qrcode(0,'M')`, `addData`, `make`) and renders it as crisp SVG (or `createSvgTag`) into `targetEl`, sized responsively. Browser global `renderQR`.

- [ ] **Step 5: Commit**

```bash
git add js/qr.js js/qrcode-generator.js test/qr.test.js && git commit -m "feat: vendored offline QR generator and render wrapper"
```

---

## Task 6: Home page

**Files:**
- Create: `index.html`

- [ ] **Step 1: Build the page.** Standard shell: `<head>` links `css/styles.css`; body has `<div id="site-header"></div>`, main content, `<div id="site-footer"></div>`, then `<script src="js/main.js"></script>`. Sections:
  - **Hero** (navy/tint bg): "Treat your car to a spa day", subhead, `.btn-accent` "Pay now" + `.btn-ghost` "Book a wash"; small "Rated #1 in McKinney · 4.3★" badge.
  - **Services snapshot**: 3–4 `.card`s (Exterior $8, Full-service $26, Detailing $150, Inspection) linking to `services.html`.
  - **"Pay your way" band**: highlights the four payment options with icons, linking to pay/book/membership/gift-cards. Lead with the QR/pay-by-phone benefit ("Register internet down? Customers still pay from their phone.").
  - **Membership teaser** → `membership.html`.
  - **Trust/CTA** footer band.

- [ ] **Step 2: Verify** — open in browser; header/footer inject, links work, layout responsive at 360px.

- [ ] **Step 3: Commit**

```bash
git add index.html && git commit -m "feat: home page"
```

---

## Task 7: Services & pricing page

**Files:**
- Create: `services.html`

- [ ] **Step 1: Build.** Page header + grid of service `.card`s with real names/prices: Exterior wash (from $8), Full-service wash (from $26), Detailing (from $150), Hand wash & wax, Ceramic clear coat, Windshield chip repair, State vehicle inspection, Monthly wash plans (→ membership). Each card: name, short copy, `.price`, and a CTA (`Book` → `book.html` or `Pay` → `pay.html`).
- [ ] **Step 2: Verify** open + responsive check.
- [ ] **Step 3: Commit** `git add services.html && git commit -m "feat: services and pricing page"`

---

## Task 8: Membership page (recurring-billing signup, demo)

**Files:**
- Create: `membership.html`

- [ ] **Step 1: Build.** Three plan `.card`s (e.g. Basic / Premium / Unlimited monthly) with monthly prices and feature lists; "Most popular" accent on one. A "Join" button opens the demo checkout via `PayKit.mountCheckout(root,{label:'<plan> membership — monthly', amount:<price>, mode:'subscription'})`. Include `<script src="js/checkout.js"></script>`. Copy notes recurring auto-billing. Show a "Demo — no real charge" badge.
- [ ] **Step 2: Verify** — choosing a plan opens checkout; submitting a valid test card (`4242 4242 4242 4242`, future expiry, any CVC) shows a receipt with a `PAS-` reference.
- [ ] **Step 3: Commit** `git add membership.html && git commit -m "feat: membership page with demo recurring checkout"`

---

## Task 9: Book page (booking + deposit, demo)

**Files:**
- Create: `book.html`

- [ ] **Step 1: Build.** Form: service `<select>` (from the services list), date input, time `<select>`, name/phone. "Continue to deposit" runs basic field validation then calls `PayKit.mountCheckout(root,{label:'Deposit — <service> on <date> <time>', amount:<deposit>, mode:'deposit'})`. On success show a booking confirmation (summary + `PAS-` reference). Include `js/checkout.js`.
- [ ] **Step 2: Verify** — full flow: fill form → deposit checkout → confirmation. Empty required fields are blocked.
- [ ] **Step 3: Commit** `git add book.html && git commit -m "feat: booking page with deposit checkout"`

---

## Task 10: Pay Bill page (pay-by-phone + QR) — headline feature

**Files:**
- Create: `pay.html`

- [ ] **Step 1: Build.** Two-column layout:
  - **Left — "Pay from your phone":** amount input (prefilled examples / quick-pick chips $8/$26/$150), optional invoice/name field, "Pay now" → `PayKit.mountCheckout(root,{label:'Wash payment', amount:<entered>, mode:'oneoff'})` → receipt.
  - **Right — "Scan to pay":** a `<div id="qr"></div>` rendered by `renderQR(qr, payUrl)` where `payUrl` = absolute deployed pay URL if hosted, else the current location. Caption explaining the register use-case: staff shows this QR, customer pays on their own data even if shop wifi is down.
  Include `js/qrcode-generator.js`, `js/qr.js`, `js/checkout.js`.
- [ ] **Step 2: Verify** — QR renders and scans (resolves to pay page); amount → checkout → receipt works; quick-pick chips set the amount.
- [ ] **Step 3: Commit** `git add pay.html && git commit -m "feat: pay-by-phone page with scannable QR and demo checkout"`

---

## Task 11: Gift cards page (demo)

**Files:**
- Create: `gift-cards.html`

- [ ] **Step 1: Build.** Preset amount cards ($25/$50/$100) + custom amount, optional recipient name/email, "Buy gift card" → `PayKit.mountCheckout(root,{label:'Gift card', amount:<amt>, mode:'giftcard'})` → confirmation showing a demo gift-card code + `PAS-` reference. Include `js/checkout.js`.
- [ ] **Step 2: Verify** — preset + custom amounts flow to checkout and confirmation.
- [ ] **Step 3: Commit** `git add gift-cards.html && git commit -m "feat: gift cards page with demo checkout"`

---

## Task 12: Contact page

**Files:**
- Create: `contact.html`

- [ ] **Step 1: Build.** Hours (Mon–Sat 8:00am–6:30pm, Sun 9:00am–5:00pm), phone `972-569-8683` (tel link), `manager@parkwayautospa.com` (mailto), McKinney TX, an embedded Google Maps `<iframe>` for the area (with a note to swap in the exact address), and a simple non-functional contact form labeled demo.
- [ ] **Step 2: Verify** open + links work + responsive.
- [ ] **Step 3: Commit** `git add contact.html && git commit -m "feat: contact page"`

---

## Task 13: Smoke test, owner leave-behind, final verification

**Files:**
- Create: `scripts/smoke.sh`, `FOR-THE-OWNER.md`

- [ ] **Step 1: Write `scripts/smoke.sh`** — starts `python3 -m http.server 8765` in the dir, curls each of the 7 pages, asserts HTTP 200 and that each contains a page-specific static marker string (e.g. `pay.html` contains "Scan to pay"), prints PASS/FAIL per page, kills the server, exits non-zero on any failure.

- [ ] **Step 2: Run smoke test**

Run: `bash scripts/smoke.sh`
Expected: all 7 pages PASS (HTTP 200 + marker present).

- [ ] **Step 3: Run logic tests**

Run: `node test/checkout.test.js && node test/qr.test.js`
Expected: both print `OK`.

- [ ] **Step 4: Write `FOR-THE-OWNER.md`** — non-technical: the problem (register internet down = no payments, single point of failure), what the revamp adds (4 ways to get paid incl. phone/QR that don't depend on shop wifi), how to view the demo, and the go-live path (create Stripe **or** Square account → add keys at the documented seam in `js/checkout.js` → demo checkout becomes real; optional real booking calendar + SMS receipts).

- [ ] **Step 5: Manual visual pass** — open all 7 pages, click every CTA and each of the 4 checkout flows end-to-end, scan the QR with a phone, check mobile layout at 360px.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: smoke tests and owner leave-behind; final polish"
```

---

## Self-Review (completed)

- **Spec coverage:** full refresh (Tasks 2,6–12) ✓; Premium Spa tokens (Task 2) ✓; 7 pages (Tasks 6–12) ✓; pay-by-phone+QR (Task 10) ✓; booking deposit (Task 9) ✓; membership billing (Task 8) ✓; gift cards (Task 11) ✓; offline (system fonts Task 2, vendored QR Task 5) ✓; demo checkout + go-live seam (Tasks 4,13) ✓; owner leave-behind + README (Tasks 1,13) ✓.
- **Placeholder scan:** page tasks specify sections/components/content + verification rather than verbatim HTML (intentional, single-executor build); JS logic, tokens, and tests are given in full. No TBD/TODO.
- **Type consistency:** `PayKit.mountCheckout(root,{label,amount,mode})`, `PayKit.reference→"PAS-######"`, `renderQR(targetEl,text)` used consistently across Tasks 8–11.
