/* Arrow cursor: over anything clickable, the cursor becomes June's curly arrow.
   The arrowhead tip sits exactly on the pointer, so clicks stay precise.
   Mouse/trackpad only (touch is untouched); with reduced motion it appears without drawing. */
(() => {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CLICKABLE = "a[href], button, [role='button'], label[for], summary, select, .project, .phone__frame.is-clickable";
  const W = 34, H = 25.9, TIP_X = 32.3, TIP_Y = 18.6;
  const el = document.createElement("div");
  el.className = "arrow-cursor";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML =
    `<svg width="${W}" height="${H}" viewBox="-74.7 38.4 279.5 212.7" overflow="visible">` +
    `<defs><linearGradient id="arrow-cursor-g" gradientUnits="userSpaceOnUse" x1="-74.7" x2="204.8" y1="0" y2="0">` +
    `<stop offset="0" stop-color="#d9419f"/><stop offset=".52" stop-color="#7448cf"/><stop offset="1" stop-color="#3b4fb8"/></linearGradient></defs>` +
    `<g fill="none" stroke="url(#arrow-cursor-g)" stroke-width="15.6" stroke-linecap="round" stroke-linejoin="round">` +
    `<path class="ac-body" pathLength="1" d="M-60.7 97.2 C-60.3 100.4 -59.7 110.4 -58.4 116.9 C-57.1 123.3 -55.3 129.8 -53.2 136.0 C-51.0 142.2 -48.6 148.4 -45.6 154.2 C-42.7 160.0 -39.4 165.8 -35.5 170.9 C-31.5 176.0 -26.9 180.7 -21.9 184.7 C-16.8 188.7 -11.1 192.1 -5.3 195.0 C0.5 197.9 6.8 200.2 13.1 201.9 C19.3 203.7 25.9 204.9 32.4 205.4 C38.8 205.8 45.5 205.7 51.9 204.9 C58.3 204.1 64.8 202.5 70.9 200.4 C77.1 198.3 83.2 195.6 88.8 192.4 C94.5 189.2 100.0 185.4 104.8 181.1 C109.6 176.8 114.1 171.9 117.8 166.7 C121.5 161.4 124.8 155.6 126.9 149.6 C129.1 143.6 130.4 137.2 130.8 130.8 C131.2 124.5 130.6 117.8 129.3 111.5 C128.1 105.2 126.0 98.8 123.3 93.0 C120.5 87.2 117.0 81.6 112.9 76.7 C108.8 71.8 103.8 67.4 98.5 63.8 C93.3 60.3 87.2 57.4 81.2 55.5 C75.1 53.6 68.5 52.5 62.2 52.4 C55.8 52.3 49.2 53.1 43.0 54.7 C36.9 56.4 30.7 59.0 25.4 62.3 C20.0 65.6 14.9 69.9 10.7 74.7 C6.4 79.4 2.9 85.1 0.0 90.8 C-2.8 96.6 -5.0 102.9 -6.4 109.2 C-7.7 115.5 -8.4 122.1 -8.2 128.5 C-8.1 134.9 -7.2 141.6 -5.5 147.8 C-3.9 154.0 -1.6 160.3 1.4 165.9 C4.4 171.6 8.3 176.9 12.6 181.8 C16.9 186.6 21.9 190.9 27.1 194.9 C32.3 198.9 37.9 202.5 43.6 205.7 C49.3 209.0 55.3 211.9 61.4 214.4 C67.5 216.8 73.7 219.0 80.1 220.6 C86.4 222.1 93.0 223.2 99.5 223.6 C106.0 224.1 112.6 223.8 119.0 223.0 C125.5 222.2 131.9 220.6 138.2 218.8 C144.5 216.9 150.7 214.5 156.7 211.8 C162.7 209.1 168.6 206.0 174.2 202.6 C179.9 199.2 188.0 193.4 190.8 191.6"/><path class="ac-head" pathLength="1" d="M152.8 179.6 L190.8 191.6 L180.3 237.1"/></g></svg>`;
  // outside <body> so the page's zoom doesn't scale it
  document.documentElement.appendChild(el);
  document.documentElement.classList.add("has-arrow-cursor");

  let x = -100, y = -100, raf = 0, on = false;
  const place = () => { raf = 0; el.style.transform = `translate3d(${x - TIP_X}px, ${y - TIP_Y}px, 0)`; };
  addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse") return;
    x = e.clientX; y = e.clientY;
    if (!raf) raf = requestAnimationFrame(place);
    const hit = e.target instanceof Element && e.target.closest(CLICKABLE);
    if (!!hit !== on) {
      on = !!hit;
      el.classList.toggle("is-on", on);
      if (on && !reduce) { el.classList.remove("is-drawing"); void el.offsetWidth; el.classList.add("is-drawing"); }
    }
  }, { passive: true });
  document.addEventListener("pointerleave", () => { on = false; el.classList.remove("is-on"); });
  addEventListener("blur", () => { on = false; el.classList.remove("is-on"); });
})();
