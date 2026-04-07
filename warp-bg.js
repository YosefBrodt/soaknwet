// Mount Paper Design Warp shaders behind marked sections (static HTML-friendly).
// Uses ESM CDN imports so we don't need a bundler / Next.js.

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  const [{ default: React }, { createRoot }, { Warp }] = await Promise.all([
    import("https://esm.sh/react@18"),
    import("https://esm.sh/react-dom@18/client"),
    import(
      "https://esm.sh/@paper-design/shaders-react?deps=react@18,react-dom@18"
    ),
  ]);

  function WarpBg() {
    return React.createElement(Warp, {
      style: { height: "100%", width: "100%" },
      proportion: 0.45,
      softness: 1,
      distortion: 0.25,
      swirl: 0.8,
      swirlIterations: 10,
      shape: "checks",
      shapeScale: 0.1,
      scale: 1,
      rotation: 0,
      speed: 1,
      colors: [
        "hsl(200, 100%, 20%)",
        "hsl(160, 100%, 75%)",
        "hsl(180, 90%, 30%)",
        "hsl(170, 100%, 80%)",
      ],
    });
  }

  const targets = document.querySelectorAll("[data-warp-bg]");
  targets.forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    if (el.dataset.warpBgMounted === "1") return;
    el.dataset.warpBgMounted = "1";

    // Ensure we can absolutely-position the shader behind content.
    const pos = window.getComputedStyle(el).position;
    if (pos === "static") el.style.position = "relative";
    el.style.overflow = "hidden";

    const mount = document.createElement("div");
    mount.className = "warp-bg";
    el.prepend(mount);

    const root = createRoot(mount);
    root.render(React.createElement(WarpBg));
  });
}

