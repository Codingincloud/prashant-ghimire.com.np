/* The whole site script. Four small things, no dependencies, about 3 KB.

   Everything here is an enhancement: with JavaScript off the page reads, every
   link works, and the theme simply follows the operating system. Every moving
   part checks two things first, that the reader has not asked for reduced
   motion and that the browser can do the job. */
(function () {
  "use strict";

  var root = document.documentElement;
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");

  /* ---- theme, revealed from the button -------------------------------- */
  var btn = document.getElementById("themeBtn");
  var label = document.getElementById("themeLabel");

  function isDark() { return root.getAttribute("data-theme") === "dark"; }

  function name() {
    if (label) label.textContent = isDark() ? "Light" : "Dark";
    if (btn) btn.setAttribute("aria-label", isDark() ? "Switch to the light theme" : "Switch to the dark theme");
  }

  function apply(dark) {
    if (dark) root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    try { localStorage.setItem("pg-theme", dark ? "dark" : "light"); } catch (e) {}
    name();
  }

  name();

  if (btn) {
    btn.addEventListener("click", function () {
      var next = !isDark();
      if (!document.startViewTransition || calm.matches) { apply(next); return; }

      // The wipe starts where the button is and grows past the farthest corner.
      var box = btn.getBoundingClientRect();
      var x = box.left + box.width / 2;
      var y = box.top + box.height / 2;
      root.style.setProperty("--wipe-x", x + "px");
      root.style.setProperty("--wipe-y", y + "px");
      root.style.setProperty("--wipe-r",
        Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + "px");

      document.startViewTransition(function () { apply(next); });
    });
  }

  /* ---- copy the address ------------------------------------------------ */
  var copy = document.getElementById("copyBtn");
  var copyLabel = document.getElementById("copyLabel");

  if (copy && navigator.clipboard) {
    var timer;
    copy.addEventListener("click", function () {
      navigator.clipboard.writeText("ghimireprashant2005@gmail.com").then(function () {
        copy.setAttribute("data-copied", "true");
        if (copyLabel) copyLabel.textContent = "Copied";
        clearTimeout(timer);
        timer = setTimeout(function () {
          copy.removeAttribute("data-copied");
          if (copyLabel) copyLabel.textContent = "Copy";
        }, 1800);
      });
    });
  } else if (copy) {
    copy.hidden = true;
  }

  /* ---- the panel listens for the pointer ------------------------------- */
  var panel = document.getElementById("contactPanel");
  if (panel && fine.matches && !calm.matches) {
    var queued = false;
    panel.addEventListener("pointermove", function (e) {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        var box = panel.getBoundingClientRect();
        panel.style.setProperty("--mx", (e.clientX - box.left) + "px");
        panel.style.setProperty("--my", (e.clientY - box.top) + "px");
        queued = false;
      });
    });
  }

  /* ---- the primary button leans towards the pointer -------------------- */
  var actions = document.querySelector(".actions");
  if (actions && fine.matches && !calm.matches) {
    var magnet = actions.querySelector(".btn.primary");
    if (magnet) {
      var frame = false;
      actions.addEventListener("pointermove", function (e) {
        if (frame) return;
        frame = true;
        requestAnimationFrame(function () {
          var box = magnet.getBoundingClientRect();
          var dx = (e.clientX - (box.left + box.width / 2)) / box.width;
          var dy = (e.clientY - (box.top + box.height / 2)) / box.height;
          var pull = 3.5;
          actions.style.setProperty("--px", (dx * pull).toFixed(2) + "px");
          actions.style.setProperty("--py", (dy * pull).toFixed(2) + "px");
          frame = false;
        });
      });
      actions.addEventListener("pointerleave", function () {
        actions.style.setProperty("--px", "0px");
        actions.style.setProperty("--py", "0px");
      });
    }
  }
})();
