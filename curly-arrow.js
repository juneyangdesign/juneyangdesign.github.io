/* Curly arrow (from June's sketch): one mark for every bullet. Draws itself once when it scrolls into view;
   hovering the point redraws it and nudges it forward. Respects reduced motion. */
(() => {
  const BODY = "M178.0 133.0 C176.1 135.7 170.0 144.0 166.5 149.1 C163.0 154.3 159.8 159.3 157.0 164.1 C154.2 168.8 151.8 173.4 149.7 177.8 C147.6 182.3 145.8 186.5 144.3 190.6 C142.9 194.7 141.7 198.6 140.9 202.4 C140.1 206.3 139.6 209.9 139.5 213.5 C139.3 217.0 139.4 220.5 139.9 223.8 C140.3 227.2 141.0 230.4 142.1 233.5 C143.1 236.7 144.5 239.8 146.1 242.8 C147.7 245.8 149.6 248.7 151.8 251.6 C154.0 254.5 156.5 257.4 159.2 260.2 C162.0 263.0 165.0 265.8 168.3 268.6 C171.5 271.4 175.1 274.2 178.9 277.0 C182.7 279.7 186.8 282.5 191.1 285.3 C195.4 288.1 199.9 291.0 204.7 293.9 C209.5 296.7 214.6 299.6 219.9 302.6 C225.1 305.6 230.6 308.6 236.4 311.7 C242.1 314.9 250.1 319.2 254.3 321.3 C258.4 323.5 258.9 323.7 261.4 324.6 C263.8 325.6 266.3 326.5 268.8 327.2 C271.3 327.9 273.9 328.5 276.4 328.9 C279.0 329.4 281.6 329.7 284.2 329.8 C286.8 330.0 289.5 330.0 292.1 329.9 C294.7 329.8 297.3 329.6 299.9 329.2 C302.5 328.8 305.1 328.3 307.6 327.6 C310.1 327.0 312.6 326.2 315.1 325.3 C317.5 324.3 319.9 323.3 322.3 322.1 C324.6 320.9 326.9 319.6 329.1 318.2 C331.3 316.8 333.4 315.3 335.4 313.6 C337.5 312.0 339.4 310.2 341.3 308.4 C343.1 306.5 344.9 304.6 346.5 302.6 C348.2 300.5 349.7 298.4 351.1 296.2 C352.5 294.0 353.9 291.7 355.0 289.4 C356.2 287.1 357.3 284.7 358.2 282.2 C359.1 279.8 359.9 277.3 360.6 274.7 C361.3 272.2 361.8 269.6 362.2 267.1 C362.6 264.5 362.8 261.8 362.9 259.2 C363.0 256.6 363.0 254.0 362.9 251.4 C362.7 248.8 362.4 246.2 362.0 243.6 C361.5 241.0 360.9 238.5 360.2 235.9 C359.5 233.4 358.7 230.9 357.7 228.5 C356.7 226.1 355.6 223.7 354.4 221.4 C353.2 219.1 351.8 216.8 350.4 214.7 C348.9 212.5 347.3 210.4 345.7 208.4 C344.0 206.4 342.2 204.5 340.3 202.7 C338.4 200.9 336.4 199.1 334.4 197.5 C332.3 195.9 330.1 194.4 327.9 193.1 C325.7 191.7 323.4 190.4 321.0 189.3 C318.7 188.2 316.2 187.1 313.8 186.3 C311.3 185.4 308.8 184.7 306.3 184.0 C303.7 183.4 301.1 183.0 298.5 182.6 C296.0 182.3 293.3 182.1 290.7 182.0 C288.1 182.0 285.5 182.0 282.9 182.3 C280.3 182.5 277.7 182.8 275.1 183.3 C272.5 183.8 270.0 184.4 267.5 185.2 C265.0 186.0 262.5 186.9 260.1 187.9 C257.7 188.9 255.3 190.0 253.1 191.3 C250.8 192.6 248.5 194.0 246.4 195.5 C244.3 197.0 242.2 198.6 240.2 200.3 C238.3 202.1 236.4 203.9 234.6 205.8 C232.8 207.7 231.2 209.8 229.6 211.9 C228.1 213.9 226.6 216.1 225.3 218.4 C223.9 220.6 222.7 223.0 221.6 225.3 C220.6 227.7 219.6 230.2 218.8 232.7 C218.0 235.1 217.3 237.7 216.7 240.2 C216.1 242.8 215.7 245.4 215.4 248.0 C215.2 250.6 215.0 253.2 215.0 255.8 C215.0 258.4 215.1 261.0 215.4 263.6 C215.7 266.2 215.7 267.0 216.6 271.4 C217.5 275.7 219.4 283.8 220.9 289.7 C222.4 295.6 224.0 301.3 225.7 306.7 C227.3 312.1 229.1 317.4 230.9 322.3 C232.8 327.3 234.8 332.1 236.8 336.6 C238.9 341.1 241.0 345.4 243.3 349.5 C245.5 353.6 247.9 357.4 250.3 361.0 C252.8 364.6 255.4 368.0 258.1 371.1 C260.8 374.2 263.6 377.1 266.5 379.7 C269.5 382.3 272.5 384.7 275.7 386.8 C278.9 389.0 282.2 390.9 285.7 392.5 C289.1 394.1 292.7 395.5 296.4 396.7 C300.2 397.8 304.0 398.7 308.0 399.3 C312.0 399.9 316.2 400.3 320.5 400.4 C324.8 400.5 329.2 400.4 333.8 399.9 C338.5 399.5 343.2 398.8 348.1 397.9 C353.1 396.9 358.2 395.7 363.4 394.2 C368.7 392.7 374.1 391.0 379.7 388.9 C385.3 386.9 394.1 383.2 397.0 382.0";
  const HEAD = "M342 361 C370 361 398 361 414 363 C412 390 409 420 404 456";
  const NS = "http://www.w3.org/2000/svg";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let uid = 0;
  function make() {
    const id = "ca" + (++uid);
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "112 116 322 356");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML =
      `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="120" x2="430" y1="0" y2="0">` +
      `<stop offset="0" stop-color="#e62fa8"/><stop offset=".52" stop-color="#7e47e0"/><stop offset="1" stop-color="#4a62d9"/></linearGradient></defs>` +
      `<path class="ca-body" d="${BODY}" pathLength="1"/><path class="ca-head" d="${HEAD}" pathLength="1"/>`;
    svg.querySelectorAll("path").forEach(p => {
      p.setAttribute("fill", "none"); p.setAttribute("stroke", `url(#${id})`);
      p.setAttribute("stroke-width", "21"); p.setAttribute("stroke-linecap", "round"); p.setAttribute("stroke-linejoin", "round");
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
