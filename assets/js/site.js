/* The whole site script. Six small things, no dependencies, about 4 KB.

   Everything here is an enhancement: with JavaScript off the page reads, every
   link works, and the theme and the motion both follow the operating system.
   Every moving part checks two things first, that this page is allowed to move
   and that the browser can do the job. */
(function () {
  "use strict";

  var root = document.documentElement;
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");

  /* Whether this page is allowed to move. The small script in the head has
     already set the attribute before the first paint — from the reader's own
     choice if they have made one, otherwise from their system — so this is
     usually just a read. The media query is the fallback for a page where that
     script did not run. */
  function motionOn() {
    var flag = root.getAttribute("data-motion");
    if (flag === "on") return true;
    if (flag === "off") return false;
    return !calm.matches;
  }

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
      if (!document.startViewTransition || !motionOn()) { apply(next); return; }

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

  /* ---- the reader's own answer about motion ---------------------------- */
  var motionBtn = document.getElementById("motionBtn");

  /* The button carries one word and one block of light. The block is lit while
     this page is allowed to move, and `aria-pressed` says the same thing to a
     screen reader, so the words never have to change under the reader's eyes
     and the header never reflows when the switch is thrown. */
  function describeMotion() {
    if (motionBtn) motionBtn.setAttribute("aria-pressed", motionOn() ? "true" : "false");
  }

  describeMotion();

  if (motionBtn) {
    motionBtn.addEventListener("click", function () {
      var next = !motionOn();
      root.setAttribute("data-motion", next ? "on" : "off");
      if (!next) root.removeAttribute("data-scrolling");
      try { localStorage.setItem("pg-motion", next ? "on" : "off"); } catch (e) {}
      describeMotion();
      // Turning it on has to finish what the load could not: the reveals that
      // are already on screen get their arrival now instead of never.
      if (next) settleReveals();
    });
  }

  /* ---- the room leans with the pointer --------------------------------- */

  /* A large screen has space either side of the column, so the light in that
     space can follow the pointer. Only where the layers were built at all — a
     narrow screen never draws them — and not on a device that reports little
     memory. The move is small and the stylesheet trails it, so it reads as
     light rather than as a cursor. */
  var ambience = document.querySelector(".ambience");
  var roomy = window.matchMedia("(min-width: 48rem)").matches;
  var thin = typeof navigator.deviceMemory === "number" && navigator.deviceMemory < 4;
  if (ambience && fine.matches && roomy && !thin) {
    var leaning = false;
    document.addEventListener("pointermove", function (e) {
      if (!motionOn() || leaning) return;
      leaning = true;
      requestAnimationFrame(function () {
        var dx = e.clientX / window.innerWidth - 0.5;
        var dy = e.clientY / window.innerHeight - 0.5;
        ambience.style.setProperty("--gx", (dx * 30).toFixed(1) + "px");
        ambience.style.setProperty("--gy", (dy * 20).toFixed(1) + "px");
        leaning = false;
      });
    }, { passive: true });
  }

  /* ---- the mark's caret works while the reader scrolls ------------------ */
  var still;
  var working = false;
  window.addEventListener("scroll", function () {
    if (!motionOn()) return;
    if (!working) { working = true; root.setAttribute("data-scrolling", ""); }
    clearTimeout(still);
    still = setTimeout(function () {
      working = false;
      root.removeAttribute("data-scrolling");
    }, 240);
  }, { passive: true });

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

  /* ---- promises the scroll reveals cannot keep ------------------------- */

  /* The reveals are native CSS (`animation-timeline: view()`), and that engine
     cannot tell "already on screen" from "not reached yet". Two cases leave a
     block dim with no scroll left to finish it: an element inside the first
     screen at load, and an element with less page beneath it than its range
     needs. Both get the page's ordinary arrival instead: they fade once and are
     done, so nothing is ever dim on purpose. Only classes are added, never
     removed, and only the reader who allows motion is affected. */
  var REVEAL_ROOM = 0.24; // the widest `animation-range` end in the stylesheet
  var reveals = document.querySelectorAll(".reveal, .reveal-group > *");
  var firstPass = true;

  function settleReveals() {
    if (!motionOn() || !reveals.length) return;
    var vh = window.innerHeight;
    var page = document.documentElement.scrollHeight;
    for (var i = 0; i < reveals.length; i++) {
      var el = reveals[i];
      if (el.classList.contains("reveal-appear")) continue;
      var box = el.getBoundingClientRect();
      var onScreen = box.top < vh && box.bottom > 0;
      var top = box.top + (window.scrollY || window.pageYOffset || 0);
      var room = top + REVEAL_ROOM * (vh + box.height) <= page;
      if (onScreen || !room) {
        // When the whole page is on screen at once, one shared fade would read
        // as a single blink. A short stagger down the page keeps the arrival
        // looking composed. Later passes are a resize or a font swap, where a
        // wave would just look broken, so they are left immediate.
        var holds = el.querySelector(".reveal, .reveal-group > *");
        el.classList.add(holds ? "reveal-hold" : "reveal-appear");
        if (!holds && firstPass && onScreen) {
          el.style.animationDelay = Math.min(i * 50, 400) + "ms";
        }
      }
    }
  }

  settleReveals();
  firstPass = false;
  // Web fonts change text height, and a taller or shorter window changes what
  // the range can reach, so the answer is worth asking again both times.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(settleReveals);
  var onResize;
  window.addEventListener("resize", function () {
    clearTimeout(onResize);
    onResize = setTimeout(settleReveals, 200);
  }, { passive: true });

  /* ---- the panel listens for the pointer ------------------------------- */
  var panel = document.getElementById("contactPanel");
  if (panel && fine.matches) {
    var queued = false;
    panel.addEventListener("pointermove", function (e) {
      // listened for either way, so the switch in the header takes effect where
      // the reader is standing rather than at the next reload
      if (!motionOn() || queued) return;
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
  if (actions && fine.matches) {
    var magnet = actions.querySelector(".btn.primary");
    if (magnet) {
      var frame = false;
      actions.addEventListener("pointermove", function (e) {
        if (!motionOn() || frame) return;
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
