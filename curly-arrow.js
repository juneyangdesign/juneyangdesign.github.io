/* Curly arrow (from June's sketch): one mark for every bullet. Draws itself once when it scrolls into view;
   hovering the point redraws it and nudges it forward. Respects reduced motion. */
(() => {
  const BODY = "M 15.6 43.5 C 15.9 43.7 16.9 44.4 17.6 44.8 C 18.3 45.2 18.8 45.7 19.4 46.0 C 20.0 46.4 20.5 46.8 21.1 47.2 C 21.6 47.5 22.0 47.9 22.4 48.2 C 22.9 48.6 23.4 48.9 23.8 49.2 C 24.2 49.5 24.6 49.9 25.0 50.1 C 25.4 50.4 25.8 50.7 26.2 51.0 C 26.6 51.2 27.0 51.5 27.3 51.8 C 27.7 52.0 28.0 52.3 28.4 52.5 C 28.8 52.7 29.1 52.9 29.6 53.1 C 29.9 53.3 30.3 53.5 30.8 53.7 C 31.1 53.9 31.6 54.1 32.0 54.2 C 32.5 54.4 32.9 54.6 33.4 54.8 C 33.9 55.0 34.4 55.1 34.9 55.2 C 35.4 55.3 36.0 55.6 36.6 55.6 C 37.2 55.7 37.8 55.9 38.4 56.0 C 39.1 56.1 39.8 56.2 40.6 56.3 C 41.3 56.4 42.3 56.6 42.9 56.6 C 43.6 56.7 43.9 56.6 44.4 56.7 C 44.9 56.6 45.4 56.6 45.9 56.6 C 46.4 56.5 46.9 56.5 47.3 56.4 C 47.8 56.3 48.3 56.1 48.7 56.0 C 49.3 55.8 49.7 55.7 50.1 55.4 C 50.6 55.3 51.0 55.1 51.5 54.8 C 51.8 54.5 52.3 54.2 52.7 54.0 C 53.1 53.7 53.4 53.4 53.8 53.0 C 54.2 52.7 54.5 52.3 54.9 51.9 C 55.2 51.6 55.4 51.2 55.8 50.9 C 56.1 50.4 56.3 50.0 56.6 49.6 C 56.9 49.2 57.0 48.7 57.2 48.2 C 57.4 47.9 57.6 47.4 57.8 46.9 C 57.9 46.4 58.1 45.9 58.1 45.5 C 58.2 44.9 58.2 44.5 58.3 44.0 C 58.4 43.5 58.4 43.1 58.4 42.6 C 58.4 42.0 58.3 41.5 58.2 41.1 C 58.2 40.6 58.2 40.1 58.1 39.7 C 57.9 39.1 57.8 38.6 57.7 38.2 C 57.5 37.7 57.3 37.3 57.1 36.8 C 56.9 36.4 56.6 35.9 56.4 35.5 C 56.2 35.1 55.9 34.6 55.6 34.2 C 55.3 33.9 55.0 33.5 54.6 33.1 C 54.3 32.8 53.9 32.5 53.6 32.1 C 53.2 31.8 52.8 31.4 52.4 31.2 C 52.0 30.9 51.6 30.7 51.2 30.4 C 50.8 30.2 50.3 30.0 49.8 29.8 C 49.4 29.6 48.9 29.4 48.5 29.3 C 48.0 29.1 47.5 29.0 47.1 28.9 C 46.6 28.8 46.0 28.7 45.6 28.7 C 45.1 28.7 44.6 28.6 44.1 28.7 C 43.6 28.7 43.1 28.7 42.6 28.8 C 42.2 28.9 41.7 28.9 41.1 29.1 C 40.7 29.2 40.2 29.3 39.8 29.5 C 39.3 29.6 38.9 29.8 38.4 30.1 C 37.9 30.2 37.5 30.5 37.1 30.7 C 36.7 31.0 36.3 31.3 35.9 31.6 C 35.5 31.8 35.2 32.2 34.7 32.5 C 34.4 32.9 34.0 33.2 33.8 33.6 C 33.5 33.9 33.1 34.3 32.8 34.7 C 32.6 35.2 32.3 35.6 32.0 36.0 C 31.9 36.5 31.6 36.9 31.5 37.3 C 31.3 37.8 31.1 38.3 30.9 38.7 C 30.8 39.3 30.7 39.7 30.6 40.2 C 30.6 40.6 30.5 41.2 30.4 41.6 C 30.3 42.1 30.4 42.6 30.4 43.1 C 30.4 43.6 30.4 44.1 30.6 44.6 C 30.6 45.0 30.7 45.5 30.8 46.1 C 30.9 46.5 31.1 47.0 31.3 47.4 C 31.5 47.9 31.6 48.4 31.8 48.8 C 32.0 49.2 32.1 49.4 32.5 50.1 C 33.0 50.8 33.8 52.1 34.4 53.0 C 35.0 53.9 35.7 54.8 36.2 55.6 C 36.8 56.3 37.4 57.1 37.9 57.7 C 38.5 58.4 39.0 59.0 39.6 59.6 C 40.2 60.2 40.7 60.7 41.2 61.2 C 41.8 61.8 42.2 62.2 42.8 62.6 C 43.3 63.1 43.9 63.5 44.4 63.9 C 44.9 64.2 45.5 64.6 46.1 64.9 C 46.6 65.3 47.1 65.6 47.7 65.9 C 48.2 66.2 48.9 66.5 49.4 66.8 C 50.0 67.1 50.7 67.3 51.2 67.6 C 51.8 68.0 52.5 68.2 53.1 68.5 C 53.9 68.9 54.5 69.2 55.2 69.5 C 56.0 69.8 56.7 70.2 57.4 70.5 C 58.2 70.8 59.0 71.2 59.8 71.6 C 60.6 72.0 61.5 72.6 62.4 73.0 C 63.3 73.4 64.2 74.0 65.1 74.6 C 66.1 75.1 67.6 76.1 68.1 76.4";
  const HEAD = "M 64.4 65.0 L 68.1 76.4 L 56.3 78.0";
  const NS = "http://www.w3.org/2000/svg";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let uid = 0;
  function make() {
    const id = "ca" + (++uid);
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "10.6 23.6 62.5 59.4");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML =
      `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="10.6" x2="73.1" y1="0" y2="0">` +
      `<stop offset="0" stop-color="#e62fa8"/><stop offset=".52" stop-color="#7e47e0"/><stop offset="1" stop-color="#4a62d9"/></linearGradient></defs>` +
      `<path class="ca-body" d="${BODY}" pathLength="1"/><path class="ca-head" d="${HEAD}" pathLength="1"/>`;
    svg.querySelectorAll("path").forEach(p => {
      p.setAttribute("fill", "none"); p.setAttribute("stroke", `url(#${id})`);
      p.setAttribute("stroke-width", "3.91"); p.setAttribute("stroke-linecap", "round"); p.setAttribute("stroke-linejoin", "round");
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
