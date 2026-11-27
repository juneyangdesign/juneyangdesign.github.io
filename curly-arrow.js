/* Curly arrow: one mark for every bullet. Draws itself once when it scrolls into view;
   hovering the point redraws it and nudges it forward. Respects reduced motion. */
(() => {
  const BODY = "M8.0 62.0 C8.4 62.0 9.7 62.0 10.5 62.0 C11.3 62.0 12.1 62.0 12.8 62.0 C13.6 62.0 14.3 62.0 15.0 62.0 C15.7 62.0 16.4 62.0 17.0 62.0 C17.7 62.0 18.3 62.0 18.9 62.0 C19.5 62.0 20.1 62.0 20.7 61.9 C21.3 61.9 21.9 61.9 22.4 61.8 C23.0 61.8 23.6 61.8 24.1 61.7 C24.7 61.6 25.2 61.6 25.7 61.5 C26.3 61.4 26.8 61.3 27.3 61.2 C27.9 61.1 28.4 61.0 29.0 60.9 C29.5 60.7 30.0 60.6 30.6 60.4 C31.2 60.3 31.7 60.1 32.3 59.9 C32.9 59.7 33.4 59.5 34.0 59.3 C34.6 59.0 35.2 58.8 35.9 58.5 C36.5 58.2 37.1 57.9 37.8 57.6 C38.5 57.3 39.2 57.0 39.9 56.6 C40.6 56.3 41.5 55.8 42.1 55.5 C42.7 55.2 42.9 55.0 43.3 54.8 C43.7 54.5 44.0 54.2 44.4 53.9 C44.7 53.6 45.1 53.3 45.4 53.0 C45.7 52.7 46.0 52.3 46.3 51.9 C46.6 51.6 46.8 51.2 47.1 50.8 C47.3 50.4 47.5 50.0 47.7 49.6 C47.9 49.2 48.1 48.8 48.3 48.3 C48.4 47.9 48.5 47.5 48.6 47.0 C48.8 46.6 48.8 46.1 48.9 45.6 C49.0 45.2 49.0 44.7 49.0 44.3 C49.0 43.8 49.0 43.4 49.0 42.9 C48.9 42.4 48.9 42.0 48.8 41.5 C48.7 41.1 48.6 40.6 48.4 40.2 C48.3 39.8 48.1 39.3 48.0 38.9 C47.8 38.5 47.6 38.1 47.3 37.7 C47.1 37.3 46.9 36.9 46.6 36.5 C46.3 36.1 46.1 35.8 45.8 35.4 C45.5 35.1 45.1 34.7 44.8 34.4 C44.5 34.1 44.1 33.8 43.7 33.5 C43.4 33.3 43.0 33.0 42.6 32.8 C42.2 32.6 41.8 32.3 41.4 32.2 C40.9 32.0 40.5 31.8 40.1 31.7 C39.6 31.5 39.2 31.4 38.7 31.3 C38.3 31.2 37.8 31.1 37.4 31.1 C36.9 31.0 36.5 31.0 36.0 31.0 C35.5 31.0 35.1 31.0 34.6 31.1 C34.2 31.1 33.7 31.2 33.3 31.3 C32.8 31.4 32.4 31.5 31.9 31.7 C31.5 31.8 31.1 32.0 30.6 32.2 C30.2 32.3 29.8 32.6 29.4 32.8 C29.0 33.0 28.6 33.3 28.3 33.5 C27.9 33.8 27.5 34.1 27.2 34.4 C26.9 34.7 26.5 35.1 26.2 35.4 C25.9 35.8 25.7 36.1 25.4 36.5 C25.1 36.9 24.9 37.3 24.7 37.7 C24.4 38.1 24.2 38.5 24.0 38.9 C23.9 39.3 23.7 39.8 23.6 40.2 C23.4 40.6 23.3 41.1 23.2 41.5 C23.1 42.0 23.1 42.4 23.0 42.9 C23.0 43.4 23.0 43.8 23.0 44.3 C23.0 44.7 23.0 45.2 23.1 45.6 C23.2 46.1 23.2 46.6 23.4 47.0 C23.5 47.5 23.6 47.9 23.7 48.3 C23.9 48.8 24.1 49.2 24.3 49.6 C24.5 50.0 24.7 50.4 24.9 50.8 C25.2 51.2 25.4 51.6 25.7 51.9 C26.0 52.3 26.3 52.7 26.6 53.0 C26.9 53.3 27.3 53.6 27.6 53.9 C28.0 54.2 28.3 54.5 28.7 54.8 C29.1 55.0 29.1 55.1 29.9 55.5 C30.7 55.9 32.3 56.7 33.5 57.3 C34.7 57.9 35.8 58.4 36.9 58.8 C38.0 59.3 39.0 59.7 40.1 60.1 C41.1 60.5 42.1 60.8 43.1 61.1 C44.1 61.4 45.0 61.7 46.0 61.9 C46.9 62.1 47.9 62.3 48.8 62.5 C49.7 62.6 50.6 62.8 51.5 62.9 C52.4 63.0 53.3 63.1 54.2 63.1 C55.1 63.2 55.9 63.2 56.8 63.2 C57.7 63.2 58.6 63.2 59.5 63.2 C60.4 63.2 61.4 63.2 62.3 63.1 C63.2 63.1 64.2 63.0 65.1 63.0 C66.1 62.9 67.1 62.8 68.1 62.8 C69.1 62.7 70.2 62.6 71.3 62.6 C72.3 62.5 73.4 62.4 74.6 62.3 C75.7 62.3 76.9 62.2 78.1 62.2 C79.3 62.1 80.6 62.1 81.9 62.0 C83.2 62.0 85.3 62.0 86.0 62.0";
  const HEAD = "M74 51 L87 62 L74 73";
  const NS = "http://www.w3.org/2000/svg";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let uid = 0;
  function make() {
    const id = "ca" + (++uid);
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "2 26 92 52");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML =
      `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="4" x2="92" y1="0" y2="0">` +
      `<stop offset="0" stop-color="#e62fa8"/><stop offset=".52" stop-color="#7e47e0"/><stop offset="1" stop-color="#4a62d9"/></linearGradient></defs>` +
      `<path class="ca-body" d="${BODY}" pathLength="1"/><path class="ca-head" d="${HEAD}" pathLength="1"/>`;
    svg.querySelectorAll("path").forEach(p => {
      p.setAttribute("fill", "none"); p.setAttribute("stroke", `url(#${id})`);
      p.setAttribute("stroke-width", "9"); p.setAttribute("stroke-linecap", "round"); p.setAttribute("stroke-linejoin", "round");
    });
    const wrap = document.createElement("span");
    wrap.className = "curly-arrow"; wrap.appendChild(svg);
    return wrap;
  }
  function draw(el) {
    if (reduce) return;
    el.classList.remove("is-drawing"); void el.offsetWidth; el.classList.add("is-drawing");
  }
  const marks = [];
  document.querySelectorAll(".squiggles li").forEach(li => {
    const m = make(); li.prepend(m); marks.push(m);
    li.addEventListener("mouseenter", () => draw(m));
  });
  if (!reduce && "IntersectionObserver" in window) {
    marks.forEach(m => m.classList.add("is-waiting"));
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const m = e.target; io.unobserve(m);
      const i = marks.indexOf(m) % 3;
      setTimeout(() => { m.classList.remove("is-waiting"); draw(m); }, 120 + i * 140);
    }), { threshold: 0.6 });
    marks.forEach(m => io.observe(m));
  }
})();
