/* Cursor circle: a soft translucent gradient circle trails the pointer and expands over anything clickable.
   The native cursor stays visible. Mouse/trackpad only; with reduced motion it follows without easing.
   (cursor-arrow.js is the earlier arrow-cursor version, kept for reference.) */
(() => {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CLICKABLE = "a[href], button, [role='button'], label[for], summary, select, .project, .phone__frame.is-clickable";
  const el = document.createElement("div");
  el.className = "cursor-circle";
  el.setAttribute("aria-hidden", "true");
  document.documentElement.appendChild(el);          // outside <body> so the page zoom doesn't scale it

  let tx = -200, ty = -200, x = tx, y = ty, raf = 0, seen = false, last = 0;
  function tick(now) {
    const dt = Math.min(48, now - (last || now)); last = now;
    const k = reduce ? 1 : 1 - Math.pow(0.0009, dt / 1000 * 6);   // smooth, frame-rate independent trailing
    x += (tx - x) * k; y += (ty - y) * k;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    raf = (Math.abs(tx - x) + Math.abs(ty - y) > 0.1) ? requestAnimationFrame(tick) : 0;
    if (!raf) last = 0;
  }
  addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse") return;
    tx = e.clientX; ty = e.clientY;
    if (!seen) { seen = true; x = tx; y = ty; el.classList.add("is-visible"); }
    if (!raf) raf = requestAnimationFrame(tick);
    const hit = e.target instanceof Element && e.target.closest(CLICKABLE);
    el.classList.toggle("is-hover", !!hit);
  }, { passive: true });
  addEventListener("pointerdown", () => el.classList.add("is-press"));
  addEventListener("pointerup", () => el.classList.remove("is-press"));
  document.addEventListener("pointerleave", () => { el.classList.remove("is-visible", "is-hover"); seen = false; });
  addEventListener("blur", () => { el.classList.remove("is-visible", "is-hover"); seen = false; });
})();
