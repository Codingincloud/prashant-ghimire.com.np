/* The whole site script: a theme toggle and a copy button. Without JavaScript
   the page still reads and every link still works. */
(function () {
  "use strict";

  var root = document.documentElement;
  var btn = document.getElementById("themeBtn");

  function label() {
    if (btn) btn.textContent = root.getAttribute("data-theme") === "dark" ? "Light" : "Dark";
  }
  label();

  if (btn) {
    btn.addEventListener("click", function () {
      var dark = root.getAttribute("data-theme") === "dark";
      if (dark) root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", "dark");
      try { localStorage.setItem("pg-theme", dark ? "light" : "dark"); } catch (e) {}
      label();
    });
  }

  var copy = document.getElementById("copyBtn");
  if (copy && navigator.clipboard) {
    copy.addEventListener("click", function () {
      navigator.clipboard.writeText("ghimireprashant2005@gmail.com").then(function () {
        copy.textContent = "Copied";
        setTimeout(function () { copy.textContent = "Copy"; }, 1800);
      });
    });
  } else if (copy) {
    copy.hidden = true;
  }
})();
