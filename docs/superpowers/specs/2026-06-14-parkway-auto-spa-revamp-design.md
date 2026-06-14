# Parkway Auto Spa — Website Revamp Design

**Date:** 2026-06-14
**Status:** Approved (design) — pending spec review
**Type:** Standalone static website (clickable demo / pitch deliverable)

## Context

A customer visited Parkway Auto Spa (McKinney, TX) and learned the shop could
not take any payment because the in-store internet was down — payments depend
entirely on the in-store connection, a single point of failure. The current
website (https://parkwayautospa.com/) has an appointment form but **no payment
processing of any kind** (no Stripe, Square, or online checkout). So even a
"scan to pay" QR code would have nothing to point at.

This project is a **revamp pitch** to send to the business: a modernized,
fully clickable demo website that shows what the shop *could* have — including
several ways to take money that don't all hinge on the register's internet.

## Goals

- Modernize the look and structure of the site (full visual refresh).
- Demonstrate four payment capabilities the shop currently lacks:
  1. **Pay-by-phone + QR** — customer scans a QR (at the register or on the
     site) and pays their bill from their *own* phone/data. Directly removes
     the "shop internet is down → no payment" single point of failure.
  2. **Booking with deposit** — reserve a wash/detail slot and prepay/deposit.
  3. **Monthly membership billing** — sign up for the monthly wash plans with
     recurring auto-billing.
  4. **Gift cards / prepaid packages** — buy gift cards or prepaid bundles.
- Be a self-contained artifact the user can hand to the owner and the owner can
  view with zero setup.

## Non-Goals (out of scope for this deliverable)

- Charging real cards / live payment processing. The demo simulates checkout.
- Connecting to the shop's real Stripe/Square accounts (they don't exist yet).
- A backend, database, or user accounts.
- Replacing the live site automatically. This is a proposal/demo.

## Deliverable

A standalone static website in `/Users/anthonyhudnall/parkway-auto-spa`,
unrelated to any other project, with its own git repo. Opens by double-clicking
`index.html`; deployable for free to Netlify / GitHub Pages / the shop's host.
Includes a short "For the owner" leave-behind explaining the upgrades and the
path to going live.

## Build Approach

**Static, no-build site — plain HTML + CSS + vanilla JS.** No framework, no
build step, no install. Chosen over React/Next.js because a pitch demo benefits
from being trivially openable and handed off; a build/deploy pipeline is
friction with no payoff here.

- Shared header/footer injected via a tiny vanilla-JS include (or duplicated
  partials) so navigation stays consistent across pages.
- One shared stylesheet (`css/styles.css`) holding the design tokens.
- Mobile-first, responsive down to ~360px.
- Vanilla JS only; one small third-party lib for QR generation (see below).

## Brand / Design Direction — "Premium Spa"

Their existing blue identity, elevated. Feels like *them*, but modern and
high-end.

- **Palette:**
  - Navy (primary / headers): `#0C2A4D`
  - Blue (brand / links / buttons): `#185FA5`
  - Cyan (accent / highlights / CTAs): `#19C3D6`
  - Off-white surface: `#F5F8FC`
  - Light blue tint (section bg): `#E6F1FB`
  - Ink text: `#0C2A4D`; muted text: `#5A6B7B`; white: `#FFFFFF`
- **Type:** clean modern sans via a **system font stack** (no web-font CDN, so
  it renders instantly and works fully offline). Large confident headings,
  generous line-height.
- **Style:** flat, clean, lots of whitespace, soft rounded cards, subtle
  borders, one accent color used intentionally. No heavy gradients/clutter.
- **Imagery:** automotive/clean-car hero treatment (CSS-driven; royalty-free or
  placeholder images with clear swap-in notes — no copyrighted assets).
- **Voice:** keeps "Treat your car to a spa day," surfaces the 4.3★ / "Rated #1
  in McKinney" social proof.

## Site Structure (7 pages)

Shared sticky header (logo, nav, "Pay now" button) and footer (hours, contact,
quick links) on every page.

1. **Home (`index.html`)** — hero + tagline, social proof, services snapshot,
   membership teaser, and prominent *Pay Now / Book / Join* CTAs.
2. **Services & Pricing (`services.html`)** — cards for each service with real
   prices: exterior wash (from $8), full-service (from $26), detailing (from
   $150), hand wash/wax, ceramic coat, windshield chip repair, state inspection.
3. **Membership (`membership.html`)** — monthly wash plan tiers with a
   recurring-billing signup flow (demo checkout).
4. **Book (`book.html`)** — pick service + date/time, then a deposit checkout to
   hold the slot (demo checkout).
5. **Pay Bill (`pay.html`)** — the headline feature. A large scannable QR code
   plus an "enter amount → pay from your phone" flow (demo checkout). Explains
   the register-QR use case.
6. **Gift Cards (`gift-cards.html`)** — choose amount / prepaid bundle, then
   demo checkout; produces a gift-card confirmation.
7. **Contact (`contact.html`)** — hours, phone (972-569-8683),
   manager@parkwayautospa.com, address/map embed (McKinney, TX).

## Payment Demo Architecture

A single reusable **checkout module** (`js/checkout.js`) powers all four flows.

- **Demo mode (default):** a realistic Stripe-style payment UI — card number /
  expiry / CVC fields, an "or pay with" Apple/Google-Pay-styled row — that
  validates format only, never transmits, and shows a success screen + receipt.
  Clearly labeled "Demo — no real charge."
- **QR code:** generated client-side with a small **vendored** QR library
  (the lib file lives in `js/`, no CDN) so it is **real, scannable, and works
  offline**, pointing at `pay.html`. On a deployed URL it encodes the live pay
  page; locally it encodes the relative pay URL with a note.
- **Receipt/confirmation:** shared confirmation component reused by all flows
  (amount, service, reference number, timestamp).
- **Go-live path (documented, not built):** the module exposes a clearly marked
  seam where a real Stripe Checkout Session / Payment Element (or Square) call
  would replace the simulated submit. Documented in the owner leave-behind.

## Business Data (source of truth for content)

- Name: Parkway Auto Spa — McKinney, TX
- Phone: 972-569-8683 · Email: manager@parkwayautospa.com
- Hours: Mon–Sat 8:00am–6:30pm, Sun 9:00am–5:00pm
- Social proof: 4.3★ Google, "Rated #1 in McKinney"
- Services & starting prices: exterior wash $8, full-service $26, detailing
  $150, plus hand wash/wax, ceramic clear coat, windshield chip repair, state
  vehicle inspection, monthly wash plans.

## Accessibility & Responsiveness

- Semantic HTML, labeled form fields, visible focus states, sufficient color
  contrast (navy/cyan on white all pass AA), `alt` text on imagery.
- Responsive grid; nav collapses to a mobile menu; QR and checkout usable on
  phone widths.

## Proposed File Structure

```
parkway-auto-spa/
  index.html
  services.html
  membership.html
  book.html
  pay.html
  gift-cards.html
  contact.html
  css/styles.css
  js/main.js          # nav, shared header/footer, small interactions
  js/checkout.js      # reusable demo checkout + receipt
  js/qr.js            # QR generation wrapper
  assets/             # logo, images, icons
  FOR-THE-OWNER.md    # leave-behind: what changed + how to go live
  README.md           # how to open/deploy the demo
  docs/superpowers/specs/2026-06-14-parkway-auto-spa-revamp-design.md
```

## Owner Leave-Behind (`FOR-THE-OWNER.md`)

Plain-language summary for the business: the problem (internet-down = no
payments), what the revamp adds, screenshots/where to click, and concrete next
steps to go live (create Stripe or Square account → drop in keys → the demo
checkout becomes real). Keeps it non-technical and pitch-friendly.

## Future / If They Say Yes

- Wire real Stripe (Checkout Sessions or Payment Element) or Square.
- Real booking calendar + availability.
- Email/SMS receipts and reminders.
- Connect membership to recurring billing (Stripe Billing).
