/* Parkway Auto Spa — QR render wrapper over the vendored qrcode-generator.
   renderQR(targetEl, text): draws a crisp, scannable SVG QR into targetEl.
   Works fully offline (the encoder is vendored in js/qrcode-generator.js). */
(function (root) {
  "use strict";

  function renderQR(targetEl, text) {
    if (!targetEl) return;
    var maker = root.qrcode;
    if (typeof maker !== "function") {
      targetEl.textContent = "QR unavailable";
      return;
    }

    var qr = maker(0, "M");
    qr.addData(String(text));
    qr.make();

    var count = qr.getModuleCount();
    var quiet = 4;                     // quiet zone in modules (spec minimum)
    var dim = count + quiet * 2;
    var navy = "#0C2A4D";

    var rects = "";
    for (var r = 0; r < count; r++) {
      var c = 0;
      while (c < count) {
        if (qr.isDark(r, c)) {
          var start = c;
          while (c < count && qr.isDark(r, c)) c++;   // merge horizontal run
          rects += '<rect x="' + (start + quiet) + '" y="' + (r + quiet) +
                   '" width="' + (c - start) + '" height="1"/>';
        } else {
          c++;
        }
      }
    }

    targetEl.innerHTML =
      '<svg viewBox="0 0 ' + dim + " " + dim + '" xmlns="http://www.w3.org/2000/svg" ' +
      'shape-rendering="crispEdges" role="img" aria-label="QR code to pay Parkway Auto Spa">' +
      '<rect width="' + dim + '" height="' + dim + '" fill="#ffffff"/>' +
      '<g fill="' + navy + '">' + rects + "</g></svg>";
  }

  root.renderQR = renderQR;
  if (typeof module !== "undefined" && module.exports) module.exports = renderQR;
})(typeof window !== "undefined" ? window : this);
