/* Parkway Auto Spa — demo checkout module (PayKit).
   Pure logic is Node-testable; DOM wiring runs only in the browser.
   DEMO ONLY: nothing is transmitted and no card is ever charged.

   --- GO LIVE SEAM ---------------------------------------------------------
   To accept real money, replace processPayment() below with a call to your
   payment provider (Stripe Checkout Session / Payment Element, or Square).
   Everything else (validation, receipts, references) can stay. See
   FOR-THE-OWNER.md for step-by-step instructions.
   ------------------------------------------------------------------------- */
(function (root) {
  "use strict";

  var PayKit = {};

  /* ---------- pure logic (tested) ---------- */

  PayKit.formatUSD = function (amount) {
    var n = Number(amount) || 0;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  };

  PayKit.luhnValid = function (value) {
    var digits = String(value).replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) return false;
    var sum = 0, alt = false;
    for (var i = digits.length - 1; i >= 0; i--) {
      var d = parseInt(digits.charAt(i), 10);
      if (alt) { d *= 2; if (d > 9) d -= 9; }
      sum += d; alt = !alt;
    }
    return sum % 10 === 0;
  };

  PayKit.expiryValid = function (mm, yy, now) {
    mm = parseInt(mm, 10); yy = parseInt(yy, 10);
    if (!(mm >= 1 && mm <= 12)) return false;
    if (isNaN(yy)) return false;
    var year = yy < 100 ? 2000 + yy : yy;
    var n = now || (function () { var d = new Date(); return { y: d.getFullYear(), m: d.getMonth() + 1 }; })();
    if (year > n.y) return true;
    if (year < n.y) return false;
    return mm >= n.m;
  };

  PayKit.cvcValid = function (cvc) {
    return /^\d{3,4}$/.test(String(cvc));
  };

  PayKit.reference = function (seq) {
    return "PAS-" + String(seq).padStart(6, "0");
  };

  PayKit.buildReceipt = function (o) {
    var when = o.when instanceof Date ? o.when : new Date(o.when || Date.now());
    var whenStr;
    try {
      whenStr = when.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    } catch (e) {
      whenStr = when.toUTCString();
    }
    return {
      label: o.label,
      amount: PayKit.formatUSD(o.amount),
      reference: o.reference,
      when: whenStr
    };
  };

  /* ---------- demo payment "processor" ---------- */

  PayKit._seq = 1000;
  PayKit.nextReference = function () { PayKit._seq += 1; return PayKit.reference(PayKit._seq); };

  // DEMO: always "succeeds". Replace this with a real provider call to go live.
  PayKit.processPayment = function (details) {
    return Promise.resolve({ ok: true, reference: PayKit.nextReference() });
  };

  PayKit.giftCardCode = function () {
    var base = (PayKit._seq * 7919).toString(36).toUpperCase().padStart(8, "0").slice(-8);
    return "PAS-" + base.slice(0, 4) + "-" + base.slice(4, 8);
  };

  /* ---------- DOM wiring (browser only) ---------- */

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }

  var CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

  function renderReceipt(rootEl, opts, result) {
    var receipt = PayKit.buildReceipt({
      label: opts.label, amount: opts.amount, reference: result.reference, when: new Date()
    });
    var rows = "" +
      '<div class="r"><span>' + (opts.mode === "giftcard" ? "Gift card" : "Item") + '</span><span>' + receipt.label + "</span></div>" +
      '<div class="r"><span>Amount</span><span>' + receipt.amount + "</span></div>" +
      '<div class="r"><span>Reference</span><span>' + receipt.reference + "</span></div>" +
      '<div class="r"><span>Date</span><span>' + receipt.when + "</span></div>";
    if (opts.mode === "giftcard") {
      rows += '<div class="r"><span>Gift card code</span><span>' + PayKit.giftCardCode() + "</span></div>";
    }
    rootEl.innerHTML = "";
    var wrap = el("div", { class: "receipt" });
    wrap.innerHTML = '' +
      '<div class="check">' + CHECK_SVG + "</div>" +
      "<h3>Payment successful</h3>" +
      '<p class="muted">' + (opts.mode === "subscription"
        ? "Your membership is active. We&rsquo;ll bill this card automatically each month."
        : opts.mode === "deposit"
          ? "Your slot is reserved. See you soon!"
          : "Thanks &mdash; a receipt would be emailed to you.") + "</p>" +
      '<div class="receipt-rows">' + rows + "</div>" +
      '<p class="muted" style="font-size:.85rem">Demo confirmation &mdash; no real payment was processed.</p>';
    rootEl.appendChild(wrap);
  }

  PayKit.mountCheckout = function (rootEl, opts) {
    if (!rootEl) return;
    opts = opts || {};
    opts.amount = Number(opts.amount) || 0;
    opts.label = opts.label || "Payment";
    opts.mode = opts.mode || "oneoff";

    rootEl.innerHTML = "";
    var form = el("form", { class: "checkout", novalidate: "novalidate" });
    form.innerHTML = '' +
      '<div class="demo-badge"><span aria-hidden="true">&#9432;</span> Demo &mdash; no real charge. Use card 4242 4242 4242 4242.</div>' +
      '<div class="total"><span>' + opts.label + "</span><span>" + PayKit.formatUSD(opts.amount) +
        (opts.mode === "subscription" ? "/mo" : "") + "</span></div>" +
      '<div class="wallet-row">' +
        '<button type="button" class="wallet-btn dark" data-wallet="apple">&#63743; Pay</button>' +
        '<button type="button" class="wallet-btn" data-wallet="google">G&nbsp;Pay</button>' +
      "</div>" +
      '<div class="divider">or pay with card</div>' +
      '<div class="field"><label for="pk-card">Card number</label>' +
        '<input id="pk-card" inputmode="numeric" autocomplete="cc-number" placeholder="1234 1234 1234 1234"></div>' +
      '<div class="field-row">' +
        '<div class="field"><label for="pk-exp">Expiry</label>' +
          '<input id="pk-exp" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/YY"></div>' +
        '<div class="field"><label for="pk-cvc">CVC</label>' +
          '<input id="pk-cvc" inputmode="numeric" autocomplete="cc-csc" placeholder="123"></div>' +
      "</div>" +
      '<div class="field"><label for="pk-name">Name on card</label>' +
        '<input id="pk-name" autocomplete="cc-name" placeholder="Full name"></div>' +
      '<p class="pk-error" style="color:#c0392b;min-height:1.2em;font-size:.9rem;margin:.2rem 0 .6rem"></p>' +
      '<button type="submit" class="btn btn-primary btn-block btn-lg">Pay ' + PayKit.formatUSD(opts.amount) + "</button>";

    rootEl.appendChild(form);

    var card = form.querySelector("#pk-card");
    var exp = form.querySelector("#pk-exp");
    var cvc = form.querySelector("#pk-cvc");
    var errEl = form.querySelector(".pk-error");

    card.addEventListener("input", function () {
      var d = card.value.replace(/\D/g, "").slice(0, 19);
      card.value = d.replace(/(.{4})/g, "$1 ").trim();
    });
    exp.addEventListener("input", function () {
      var d = exp.value.replace(/\D/g, "").slice(0, 4);
      exp.value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
    });
    cvc.addEventListener("input", function () {
      cvc.value = cvc.value.replace(/\D/g, "").slice(0, 4);
    });

    function pay() {
      PayKit.processPayment({ amount: opts.amount, label: opts.label }).then(function (res) {
        if (res.ok) renderReceipt(rootEl, opts, res);
      });
    }

    form.querySelectorAll("[data-wallet]").forEach(function (b) {
      b.addEventListener("click", pay);
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      errEl.textContent = "";
      var parts = exp.value.split("/");
      if (!PayKit.luhnValid(card.value)) { errEl.textContent = "Please enter a valid card number."; card.focus(); return; }
      if (!PayKit.expiryValid(parts[0], parts[1])) { errEl.textContent = "Please enter a valid expiry date."; exp.focus(); return; }
      if (!PayKit.cvcValid(cvc.value)) { errEl.textContent = "Please enter a valid CVC."; cvc.focus(); return; }
      pay();
    });
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = PayKit;
  } else {
    root.PayKit = PayKit;
  }
})(typeof window !== "undefined" ? window : this);
