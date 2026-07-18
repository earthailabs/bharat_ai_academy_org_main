(function () {
  "use strict";

  var AUTH_KEY = "bai-ai4all-access";
  var PASSWORD_HASH = "ea72790ad5f2c1433957d4fb9a97c605dec5d7a4c65704c99da53f228c8dc97e";

  function toHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map(function (b) {
        return b.toString(16).padStart(2, "0");
      })
      .join("");
  }

  function sha256(text) {
    if (!window.crypto || !window.crypto.subtle) {
      return Promise.reject(new Error("Secure hashing is not available in this browser."));
    }
    return window.crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(text))
      .then(toHex);
  }

  function alreadyUnlocked() {
    try {
      return window.sessionStorage.getItem(AUTH_KEY) === PASSWORD_HASH;
    } catch (e) {
      return false;
    }
  }

  function unlock() {
    try {
      window.sessionStorage.setItem(AUTH_KEY, PASSWORD_HASH);
    } catch (e) {
      /* ignore storage errors */
    }
  }

  function lockPage() {
    var style = document.createElement("style");
    style.id = "bai-gate-style";
    style.textContent = [
      "html,body{margin:0;padding:0;min-height:100%;}",
      "body.bai-locked>*:not(#bai-access-gate){display:none!important;}",
      "#bai-access-gate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;",
      "padding:24px;background:linear-gradient(160deg,#0b2545 0%,#13315c 55%,#1d4ed8 100%);",
      "font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;}",
      "#bai-access-gate .card{width:100%;max-width:420px;background:#fff;border-radius:18px;padding:28px 26px;",
      "box-shadow:0 24px 60px rgba(0,0,0,.28);}",
      "#bai-access-gate h1{margin:0 0 8px;font-size:1.35rem;color:#0b2545;letter-spacing:-.02em;}",
      "#bai-access-gate p{margin:0 0 18px;color:#5b6b7f;font-size:.95rem;line-height:1.5;}",
      "#bai-access-gate label{display:block;font-size:.8rem;font-weight:700;color:#0b2545;margin-bottom:8px;}",
      "#bai-access-gate input{width:100%;box-sizing:border-box;border:1.5px solid #e6ebf2;border-radius:12px;",
      "padding:13px 14px;font:inherit;font-size:1rem;outline:none;}",
      "#bai-access-gate input:focus{border-color:#1d4ed8;box-shadow:0 0 0 3px rgba(29,78,216,.12);}",
      "#bai-access-gate button{width:100%;margin-top:14px;border:0;border-radius:12px;padding:13px 16px;",
      "background:#0b2545;color:#fff;font:inherit;font-weight:700;cursor:pointer;}",
      "#bai-access-gate button:hover{background:#13315c;}",
      "#bai-access-gate .error{min-height:1.2em;margin-top:10px;color:#b91c1c;font-size:.85rem;font-weight:600;}"
    ].join("");
    document.head.appendChild(style);
    document.body.classList.add("bai-locked");

    var gate = document.createElement("div");
    gate.id = "bai-access-gate";
    gate.innerHTML = [
      '<div class="card">',
      "<h1>Student Access</h1>",
      "<p>Enter the class password to open AI For Everyone materials.</p>",
      '<form id="bai-access-form">',
      '<label for="bai-access-password">Password</label>',
      '<input id="bai-access-password" type="password" autocomplete="current-password" required autofocus />',
      "<button type=\"submit\">Unlock Materials</button>",
      '<div class="error" id="bai-access-error" aria-live="polite"></div>',
      "</form>",
      "</div>"
    ].join("");
    document.body.appendChild(gate);

    var form = document.getElementById("bai-access-form");
    var input = document.getElementById("bai-access-password");
    var error = document.getElementById("bai-access-error");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      error.textContent = "";
      var value = (input.value || "").trim();
      if (!value) {
        error.textContent = "Please enter the password.";
        return;
      }
      sha256(value)
        .then(function (hash) {
          if (hash === PASSWORD_HASH) {
            unlock();
            gate.remove();
            style.remove();
            document.body.classList.remove("bai-locked");
          } else {
            error.textContent = "Incorrect password. Try again.";
            input.value = "";
            input.focus();
          }
        })
        .catch(function () {
          error.textContent = "Unable to verify password in this browser.";
        });
    });
  }

  function start() {
    if (alreadyUnlocked()) return;
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", start);
      return;
    }
    lockPage();
  }

  start();
})();
