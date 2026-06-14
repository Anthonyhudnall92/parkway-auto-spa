/* Parkway Auto Spa — shared header/footer + nav.
   Inline templates (no fetch) so it works on file:// with no server. */
(function () {
  "use strict";

  var NAV = [
    ["Home", "index.html"],
    ["Services", "services.html"],
    ["Membership", "membership.html"],
    ["Book", "book.html"],
    ["Pay", "pay.html"],
    ["Gift cards", "gift-cards.html"],
    ["Contact", "contact.html"]
  ];

  var LOGO = '' +
    '<svg class="mark" viewBox="0 0 40 40" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">' +
    '<rect width="40" height="40" rx="11" fill="#0C2A4D"/>' +
    '<path d="M20 8c4.6 5.2 7.4 9 7.4 13.1A7.4 7.4 0 0 1 20 28.5a7.4 7.4 0 0 1-7.4-7.4C12.6 17 15.4 13.2 20 8z" fill="#19C3D6"/>' +
    '<circle cx="17.4" cy="19" r="1.7" fill="#0C2A4D"/>' +
    '</svg>';

  function currentFile() {
    var p = location.pathname.split("/").pop();
    return p && p.length ? p : "index.html";
  }

  function headerHTML() {
    var here = currentFile();
    var links = NAV.map(function (n) {
      var active = n[1] === here ? ' class="active"' : "";
      return '<a href="' + n[1] + '"' + active + '>' + n[0] + "</a>";
    }).join("");
    return '' +
      '<div class="wrap">' +
        '<a class="brand" href="index.html">' + LOGO + '<span>Parkway Auto&nbsp;Spa</span></a>' +
        '<button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">&#9776;</button>' +
        '<nav class="nav" id="site-nav">' + links +
          '<a class="btn btn-accent" href="pay.html">Pay now</a>' +
        '</nav>' +
      '</div>';
  }

  function footerHTML() {
    var year = new Date().getFullYear();
    var quick = NAV.map(function (n) {
      return '<li><a href="' + n[1] + '">' + n[0] + "</a></li>";
    }).join("");
    return '' +
      '<div class="wrap">' +
        '<div class="cols">' +
          '<div>' +
            '<a class="brand" href="index.html">' + LOGO + '<span>Parkway Auto Spa</span></a>' +
            '<p>Treat your car to a spa day. Rated #1 in McKinney with a 4.3&#9733; Google rating.</p>' +
            '<p><a href="tel:+19725698683">972-569-8683</a><br>' +
            '<a href="mailto:manager@parkwayautospa.com">manager@parkwayautospa.com</a><br>' +
            'McKinney, TX</p>' +
          '</div>' +
          '<div>' +
            '<h4>Hours</h4>' +
            '<ul>' +
              '<li>Mon&ndash;Sat: 8:00am&ndash;6:30pm</li>' +
              '<li>Sunday: 9:00am&ndash;5:00pm</li>' +
            '</ul>' +
          '</div>' +
          '<div>' +
            '<h4>Explore</h4>' +
            '<ul>' + quick + "</ul>" +
          '</div>' +
        '</div>' +
        '<div class="legal">' +
          '<span>&copy; ' + year + ' Parkway Auto Spa. Demo site.</span>' +
          '<span>Payments shown in demo mode &mdash; no real charges.</span>' +
        '</div>' +
      '</div>';
  }

  function mount() {
    var h = document.getElementById("site-header");
    var f = document.getElementById("site-footer");
    if (h) { h.className = "site-header"; h.innerHTML = headerHTML(); }
    if (f) { f.className = "site-footer"; f.innerHTML = footerHTML(); }

    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
