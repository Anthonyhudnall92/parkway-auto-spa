# Parkway Auto Spa — Website Revamp (Demo)

A modern, **fully offline-capable** demo website for Parkway Auto Spa
(McKinney, TX). It refreshes the look of the current site and adds four ways to
get paid that the existing site doesn't have — including pay-by-phone and a
scannable QR code that work even when the shop's own internet is down.

## View it

Just **double-click `index.html`** — it opens in any browser, no install, no
internet required.

Or serve it locally:

```bash
python3 -m http.server 8765
# then open http://localhost:8765
```

## Pages

Home · Services & pricing · Membership · Book · **Pay (QR)** · Gift cards · Contact

## Demo mode

Every checkout is a realistic simulation labeled **"Demo — no real charge."**
Nothing is transmitted and no card is charged. To make it real, see
[`FOR-THE-OWNER.md`](FOR-THE-OWNER.md) — it's a small, documented change to wire
in Stripe or Square.

Use test card `4242 4242 4242 4242`, any future expiry, any 3-digit CVC.

## Deploy (free)

- **Netlify:** drag this folder onto https://app.netlify.com/drop
- **GitHub Pages:** push to a repo, enable Pages on the root.

## Tests

```bash
node test/checkout.test.js   # payment logic
node test/qr.test.js         # QR encoder
bash scripts/smoke.sh        # every page returns 200 + expected content
```

See the design spec and build plan in [`docs/superpowers/`](docs/superpowers/).
