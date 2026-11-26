/* Hero grid. Two looks, set by data-mode on the canvas: "squares" or the default glyphs.
   Squares: pink tiles that stay put while soft ripples spread out from the cursor like water.
   Glyphs: a quiet field of tiny gray marks that bloom into the brand palette
   around the cursor and fade out behind it, leaving a short trail. When the pointer is
   idle (or on touch screens) a soft bloom drifts slowly on its own. Static for people who
   prefer reduced motion. Colors come from ds.css: indigo, violet, orchid, rose. */
(function () {
  var canvas = document.querySelector('.hero-grid');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // data-mode="squares": soft tinted tiles that tilt and go white around the cursor.
  // Anything else: the glyph field.
  var SQUARES = canvas.getAttribute('data-mode') === 'squares';
  // Tile tints lean rose/orchid with a little violet and indigo
  var TINTS = ['#f08cc4', '#ee8fc3', '#e796bb', '#f39bcd', '#ea7fbd', '#f5a3cf'].map(function (h) {
    return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  });

  var PALETTE = ['#6254c3', '#9b5cf6', '#d17ae6', '#e796bb', '#8178d6'].map(function (h) {
    return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  });
  var BASE = [196, 196, 204];
  var TYPES = 7; // dot, plus, asterisk, dash, capsule, square, sparkle

  var W = 0, H = 0, gap = 36, radius = 170, scale = 1, cells = [];
  var ptr = { x: 0, y: 0, tx: 0, ty: 0, seen: false, last: -1e9, inside: false };
  var running = false, visible = true;

  function rand(i, j, k) {
    var h = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453;
    return h - Math.floor(h);
  }

  function layout() {
    var stop = document.querySelector('.work-head');
    W = canvas.offsetWidth;
    H = stop ? stop.offsetTop : window.innerHeight;
    canvas.style.height = H + 'px';
    var small = W < 760;
    gap = SQUARES ? (small ? 44 : 68) : (small ? 30 : 44);
    radius = SQUARES ? (small ? 110 : 200) : (small ? 130 : 260);

    var cols = Math.ceil(W / gap) + 1, rows = Math.ceil(H / gap);
    var ox = (W - (cols - 1) * gap) / 2, oy = SQUARES ? gap / 2 : gap * 0.75;
    var old = cells; cells = [];
    for (var j = 0; j < rows; j++) {
      for (var i = 0; i < cols; i++) {
        cells.push({
          x: ox + i * gap, y: oy + j * gap,
          type: Math.floor(rand(i, j, 1) * TYPES),
          col: PALETTE[Math.floor(rand(i, j, 2) * PALETTE.length)],
          rot: rand(i, j, 3) * Math.PI,
          spin: rand(i, j, 4) - 0.5,
          tint: TINTS[Math.floor(rand(i, j, 5) * TINTS.length)],
          a: pinkAlpha(rand(i, j, 6)), dim: 1,
          e: 0
        });
      }
    }
    // Tiles behind the intro text stay faint so the headline reads cleanly
    var cr = canvas.getBoundingClientRect(), boxes = [];
    Array.prototype.forEach.call(document.querySelectorAll('.intro__title, .intro__meta, .site-header'), function (el) {
      var r = el.getBoundingClientRect();
      boxes.push([(r.left - cr.left) / (cr.width / W), (r.top - cr.top) / (cr.height / H), (r.right - cr.left) / (cr.width / W), (r.bottom - cr.top) / (cr.height / H)]);
    });
    for (var n = 0; n < cells.length; n++) {
      var c0 = cells[n], h0 = gap / 2, dim = 1;
      for (var bI = 0; bI < boxes.length; bI++) {
        var bx = boxes[bI];
        if (c0.x + h0 > bx[0] - 12 && c0.x - h0 < bx[2] + 12 && c0.y + h0 > bx[1] - 8 && c0.y - h0 < bx[3] + 8) dim = 0.3;
      }
      c0.dim = dim;
    }
    if (old.length === cells.length) for (var k = 0; k < cells.length; k++) { cells[k].e = old[k].e; cells[k].a = old[k].a; cells[k].tint = old[k].tint; }

    var rect = canvas.getBoundingClientRect();
    scale = W ? rect.width / W : 1; // CSS zoom on <body> scales the page
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(W * scale * dpr);
    canvas.height = Math.round(H * scale * dpr);
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    if (reduce) draw(0);
  }

  // Tile colors: about a quarter white, the rest pink at varied strengths
  function pinkAlpha(r) { return r < 0.24 ? 0 : 0.14 + Math.pow((r - 0.24) / 0.76, 1.3) * 0.66; }
  function reroll(c) { c.tint = TINTS[Math.floor(Math.random() * TINTS.length)]; c.a = pinkAlpha(Math.random()); }

  // Ripples: the cursor drops soft rings that spread outward like water. A tile under a
  // passing crest lifts a touch (slightly larger, lighter, faint shadow); under a trough it
  // settles a hair deeper. Tiles never move from their spot.
  var ripples = [], lastDrop = { x: -1e9, y: -1e9, t: 0 };
  var SPEED = 0.3, LIFE = 2000;           // px per ms, ms
  function drop(x, y, t, s) {
    ripples.push({ x: x, y: y, t: t, s: s });
    if (ripples.length > 14) ripples.shift();
  }
  function waveAt(c, t) {
    var z = 0, wl = gap * 2.4, w = gap * 1.1;
    for (var i = 0; i < ripples.length; i++) {
      var rp = ripples[i], age = t - rp.t;
      if (age < 0 || age > LIFE) continue;
      var dx = c.x - rp.x, dy = c.y - rp.y, d = Math.sqrt(dx * dx + dy * dy);
      var front = d - SPEED * age;
      if (front > w * 3 || front < -wl * 1.5) continue;
      var env = Math.exp(-(front * front) / (2 * w * w));
      var fade = 1 - age / LIFE;
      z += rp.s * env * Math.cos(front / wl * Math.PI * 2) * fade / (1 + d / 700);
    }
    return Math.max(-1, Math.min(1, z));
  }

  var DEEP = [212, 66, 146]; // the deeper pink tiles warm toward under the cursor
  function tile(c, z) {
    var a = c.a * c.dim;
    var r = 255 + (c.tint[0] - 255) * a, g = 255 + (c.tint[1] - 255) * a, b = 255 + (c.tint[2] - 255) * a;
    var e = Math.min(1, c.e) * (c.dim < 1 ? 0.55 : 1) * 0.85;
    r += (DEEP[0] - r) * e; g += (DEEP[1] - g) * e; b += (DEEP[2] - b) * e;
    var up = Math.max(0, z), down = Math.max(0, -z);
    var lift = Math.min(1, up * 1.3);
    r += (255 - r) * lift * 0.55; g += (255 - g) * lift * 0.55; b += (255 - b) * lift * 0.55;
    r *= 1 - down * 0.06; g *= 1 - down * 0.12; b *= 1 - down * 0.07;
    var h = (gap - 1) / 2 * (1 + z * 0.08);
    if (up > 0.04) {
      ctx.fillStyle = 'rgba(90,40,80,' + (0.07 * up).toFixed(3) + ')';
      ctx.fillRect(c.x - h + 1.5 * up, c.y - h + 3 * up, h * 2, h * 2);
    }
    ctx.fillStyle = 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
    ctx.fillRect(c.x - h, c.y - h, h * 2, h * 2);
  }

  function glyph(c, s, t) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot + c.e * 1.4 + t * 0.0012 * c.spin * c.e * 3);
    var lw = Math.max(1, s * 0.38);
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.beginPath();
    switch (c.type) {
      case 0: ctx.arc(0, 0, s * 0.72, 0, Math.PI * 2); ctx.fill(); break;
      case 1: ctx.moveTo(-s, 0); ctx.lineTo(s, 0); ctx.moveTo(0, -s); ctx.lineTo(0, s); ctx.stroke(); break;
      case 2:
        for (var a = 0; a < 3; a++) {
          var ang = a * Math.PI / 3, dx = Math.cos(ang) * s, dy = Math.sin(ang) * s;
          ctx.moveTo(-dx, -dy); ctx.lineTo(dx, dy);
        }
        ctx.stroke(); break;
      case 3: ctx.lineWidth = Math.max(1.2, s * 0.6); ctx.moveTo(-s, 0); ctx.lineTo(s, 0); ctx.stroke(); break;
      case 4: ctx.ellipse(0, 0, s * 1.1, s * 0.5, 0, 0, Math.PI * 2); ctx.fill(); break;
      case 5: var q = s * 0.72; ctx.rect(-q, -q, q * 2, q * 2); ctx.fill(); break;
      default:
        var o = s * 1.15, n = s * 0.28;
        ctx.moveTo(0, -o); ctx.lineTo(n, -n); ctx.lineTo(o, 0); ctx.lineTo(n, n);
        ctx.lineTo(0, o); ctx.lineTo(-n, n); ctx.lineTo(-o, 0); ctx.lineTo(-n, -n);
        ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    var idle = !ptr.inside || t - ptr.last > 3500;
    if (idle) {
      ptr.tx = W * (0.66 + 0.22 * Math.sin(t * 0.00021));
      ptr.ty = H * (0.48 + 0.3 * Math.sin(t * 0.00029 + 1.3));
    }
    if (!ptr.seen) { ptr.x = ptr.tx; ptr.y = ptr.ty; ptr.seen = true; }
    var follow = idle ? 0.04 : 0.2;
    var pvx = (ptr.tx - ptr.x) * follow, pvy = (ptr.ty - ptr.y) * follow;
    ptr.x += pvx;
    ptr.y += pvy;

    var R = idle ? radius * (SQUARES ? 0.6 : 0.75) : radius, strength = idle ? (W < 760 ? 0.45 : 0.6) : 1;
    if (SQUARES && !reduce) {
      if (!idle) {
        var mx = ptr.x - lastDrop.x, my = ptr.y - lastDrop.y;
        if (mx * mx + my * my > gap * gap * 1.2 && t - lastDrop.t > 110) {
          drop(ptr.x, ptr.y, t, Math.min(1, 0.7 + Math.sqrt(pvx * pvx + pvy * pvy) / 30));
          lastDrop = { x: ptr.x, y: ptr.y, t: t };
        }
      } else if (t - lastDrop.t > 2600) { // an occasional raindrop while idle
        var rx = W * (0.5 + Math.random() * 0.45), ry = H * (0.15 + Math.random() * 0.7);
        drop(rx, ry, t, 0.6);
        lastDrop = { x: rx, y: ry, t: t };
      }
    }
    for (var k = 0; k < cells.length; k++) {
      var c = cells[k];
      if (!reduce) {
        var dx = c.x - ptr.x, dy = c.y - ptr.y, d = Math.sqrt(dx * dx + dy * dy);
        var target = d < R ? Math.pow(1 - d / R, 1.4) * strength : 0;
        c.e = target > c.e ? c.e + (target - c.e) * 0.3 : c.e * 0.955;
      }
      if (SQUARES) {
        if (!reduce) {
          if (Math.random() < 0.0004) reroll(c); // slow shimmer
          // Tiles under the cursor warm to a deeper pink, then fade back slowly (a short trail)
          var qx = c.x - ptr.x, qy = c.y - ptr.y, qd = Math.sqrt(qx * qx + qy * qy), RR = gap * 2.6;
          var want = !idle && qd < RR ? Math.pow(1 - qd / RR, 1.3) : 0;
          c.e = want > c.e ? c.e + (want - c.e) * 0.35 : c.e * 0.977;
        }
        tile(c, reduce ? 0 : waveAt(c, t));
        continue;
      }
      var m = Math.min(1, c.e * 1.7);
      var r = BASE[0] + (c.col[0] - BASE[0]) * m,
          g = BASE[1] + (c.col[1] - BASE[1]) * m,
          b = BASE[2] + (c.col[2] - BASE[2]) * m;
      var color = 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
      ctx.fillStyle = color; ctx.strokeStyle = color;
      glyph(c, (W < 760 ? 1.6 : 2.2) + c.e * (W < 760 ? 5.5 : 8.5), t);
    }
  }

  function frame(t) {
    if (!running) return;
    draw(t);
    requestAnimationFrame(frame);
  }
  function start() { if (!running && visible && !reduce && !document.hidden) { running = true; requestAnimationFrame(frame); } }
  function stop() { running = false; }

  window.addEventListener('pointermove', function (e) {
    var rect = canvas.getBoundingClientRect();
    var x = (e.clientX - rect.left) / scale, y = (e.clientY - rect.top) / scale;
    ptr.inside = x >= 0 && y >= 0 && x <= W && y <= H;
    if (ptr.inside) { ptr.tx = x; ptr.ty = y; ptr.last = performance.now(); }
  }, { passive: true });
  document.addEventListener('pointerleave', function () { ptr.inside = false; });

  var timer;
  window.addEventListener('resize', function () { clearTimeout(timer); timer = setTimeout(layout, 120); });
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      visible ? start() : stop();
    }).observe(canvas);
  }

  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  window.addEventListener('load', layout);
  start();
})();
