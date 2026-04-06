(function () {
  "use strict";

  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var wideEnough = window.matchMedia("(min-width: 901px)").matches;

  /* Custom cursor */
  if (finePointer && wideEnough) {
    var cur = document.createElement("div");
    cur.id = "cursor";
    cur.setAttribute("aria-hidden", "true");
    document.body.appendChild(cur);
    document.body.classList.add("has-custom-cursor");
    document.documentElement.style.cursor = "none";

    var cx = 0,
      cy = 0,
      rx = 0,
      ry = 0,
      raf = 0;
    function loop() {
      rx += (cx - rx) * 0.22;
      ry += (cy - ry) * 0.22;
      cur.style.left = rx + "px";
      cur.style.top = ry + "px";
      raf = requestAnimationFrame(loop);
    }
    document.addEventListener(
      "mousemove",
      function (e) {
        cx = e.clientX;
        cy = e.clientY;
        if (!raf) raf = requestAnimationFrame(loop);
      },
      { passive: true }
    );

    var hoverSel =
      'a, button, [role="button"], input[type="submit"], .btn-p, .btn-o, .btn-n, label[for], select, .sr, .tc, .tag';
    document.addEventListener(
      "mouseover",
      function (e) {
        if (e.target.closest(hoverSel)) cur.classList.add("is-hover");
      },
      true
    );
    document.addEventListener(
      "mouseout",
      function (e) {
        if (e.target.closest(hoverSel)) cur.classList.remove("is-hover");
      },
      true
    );
  }

  /* Nav tighten on scroll */
  var nav = document.querySelector("nav");
  if (nav) {
    function onScroll() {
      nav.classList.toggle("nav-tight", window.scrollY > 80);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* IntersectionObserver for [data-animate] */
  var animEls = document.querySelectorAll("[data-animate]");
  if (animEls.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var animObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            animObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    animEls.forEach(function (el) {
      animObs.observe(el);
    });
  } else if (animEls.length) {
    animEls.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* Legacy .r reveals (pages not fully migrated) */
  var legacy = document.querySelectorAll(".r:not([data-animate])");
  if (
    legacy.length &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    var legObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("v");
            legObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    legacy.forEach(function (el) {
      legObs.observe(el);
    });
  } else if (legacy.length) {
    legacy.forEach(function (el) {
      el.classList.add("v");
    });
  }

  /* Animated stat counters (homepage) */
  var statsRoot = document.getElementById("stats-sec");
  if (statsRoot) {
    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }
    function runCounter(el, target, duration, formatter) {
      var start = performance.now();
      function frame(now) {
        var p = Math.min(1, (now - start) / duration);
        var v = easeOut(p) * target;
        el.textContent = formatter ? formatter(v) : String(Math.round(v));
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    function setFinalStats() {
      var n500 = document.getElementById("counter-500");
      if (n500) n500.textContent = "500";
      var n5 = document.getElementById("counter-5");
      if (n5) n5.textContent = "5.0";
      var n1 = document.getElementById("counter-1");
      if (n1) n1.textContent = "1";
    }

    var statObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          statObs.unobserve(entry.target);

          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setFinalStats();
            return;
          }

          var n500 = document.getElementById("counter-500");
          if (n500) runCounter(n500, 500, 1500, function (v) { return String(Math.round(v)); });

          var n5 = document.getElementById("counter-5");
          if (n5)
            runCounter(n5, 5, 1500, function (v) {
              return v.toFixed(1);
            });

          var n1 = document.getElementById("counter-1");
          if (n1) runCounter(n1, 1, 1500, function (v) { return String(Math.round(v)); });
        });
      },
      { threshold: 0.1 }
    );
    statObs.observe(statsRoot);
  }
})();
