/* Thought bubble: one mark for every reflection point.
   On scroll: the two dots pop in, then the bubble draws itself. On hover: the bubble floats up a touch.
   Respects reduced motion. (curly-arrow.js is the previous arrow version, kept for reference.) */
(() => {
  const CLOUD = "M87.7 36.8 A17.1 17.1 0 0 1 75.7 58.1 A22.3 22.3 0 0 1 44.0 61.3 A18.7 18.7 0 0 1 24.3 43.2 A17.1 17.1 0 0 1 36.3 21.9 A22.3 22.3 0 0 1 68.0 18.7 A18.7 18.7 0 0 1 87.7 36.8 Z";
  const DOTS = [[25, 77, 4.6], [13, 90, 2.9]];
  const NS = "http://www.w3.org/2000/svg";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let uid = 0;
  function make() {
    const id = "tb" + (++uid);
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "4 8 92 88");
    svg.setAttribute("aria-hidden", "true");
    let html = `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="8" x2="92" y1="0" y2="0">` +
      `<stop offset="0" stop-color="#d9419f"/><stop offset=".52" stop-color="#7448cf"/><stop offset="1" stop-color="#3b4fb8"/></linearGradient></defs>` +
      `<g class="tb-cloud"><path d="${CLOUD}" pathLength="1" fill="none" stroke="url(#${id})" stroke-width="5.4" stroke-linejoin="round"/></g>`;
    DOTS.forEach(([x, y, r], i) => {
      html += `<circle class="tb-dot tb-dot--${i}" cx="${x}" cy="${y}" r="${r}" fill="url(#${id})" style="transform-origin:${x}px ${y}px"/>`;
    });
    svg.innerHTML = html;
    const wrap = document.createElement("span");
    wrap.className = "thought-mark"; wrap.appendChild(svg);
    return wrap;
  }
  function play(el) {
    if (reduce) return;
    el.classList.remove("is-drawing"); void el.offsetWidth; el.classList.add("is-drawing");
  }
  const marks = [];
  document.querySelectorAll(".squiggles li").forEach(li => {
    const m = make(); li.prepend(m); marks.push(m);
  });
  if (!reduce && "IntersectionObserver" in window) {
    marks.forEach(m => m.classList.add("is-waiting"));
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const m = e.target; io.unobserve(m);
      const i = marks.indexOf(m) % 3;
      setTimeout(() => { m.classList.remove("is-waiting"); play(m); }, 120 + i * 160);
    }), { threshold: 0.6 });
    marks.forEach(m => io.observe(m));
  }
})();
