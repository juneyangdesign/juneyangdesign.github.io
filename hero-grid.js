/* Hero grid. Two looks, set by data-mode on the canvas: "squares" or the default glyphs.
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
  var TINTS = ['#e796bb', '#ef8fc0', '#e796bb', '#ef8fc0', '#d17ae6', '#b98ce8'].map(function (h) {
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
    gap = SQUARES ? (small ? 44 : 72) : (small ? 30 : 44);
    radius = SQUARES ? (small ? 120 : 230) : (small ? 130 : 260);

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
          a: tileAlpha(rand(i, j, 6)), at: 0, dim: 1,
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
        if (c0.x + h0 > bx[0] - 12 && c0.x - h0 < bx[2] + 12 && c0.y + h0 > bx[1] - 8 && c0.y - h0 < bx[3] + 8) dim = 0.18;
      }
      c0.dim = dim; c0.at = c0.a;
    }
    if (old.length === cells.length) for (var k = 0; k < cells.length; k++) { cells[k].e = old[k].e; cells[k].a = old[k].a; cells[k].at = old[k].at; }

    var rect = canvas.getBoundingClientRect();
    scale = W ? rect.width / W : 1; // CSS zoom on <body> scales the page
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(W * scale * dpr);
    canvas.height = Math.round(H * scale * dpr);
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    if (reduce) draw(0);
  }

  // Most tiles stay white or barely tinted; a few are a stronger pink
  function tileAlpha(r) { return r < 0.5 ? 0 : Math.pow((r - 0.5) / 0.5, 1.5) * 0.55; }

  function tile(c) {
    var e = c.e, size = gap - 3;
    var tint = c.tint, a = c.a * c.dim * (1 - Math.min(1, e * 1.4));
    // tint over white, fading toward a cool white as the tile flips
    var r = 255 + (tint[0] - 255) * a, g = 255 + (tint[1] - 255) * a, b = 255 + (tint[2] - 255) * a;
    var f = Math.min(1, e * 1.5);
    r += (247 - r) * f; g += (247 - g) * f; b += (249 - b) * f;
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(e * 0.16 * (c.spin > 0 ? 1 : -1));
    var k = 1 - e * 0.14, half = size * k / 2;
    if (e > 0.02) {
      ctx.fillStyle = 'rgba(40,30,70,' + (0.07 * e).toFixed(3) + ')';
      ctx.fillRect(-half + 2 * e, -half + 3 * e, half * 2, half * 2);
    }
    ctx.fillStyle = 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
    ctx.fillRect(-half, -half, half * 2, half * 2);
    ctx.strokeStyle = 'rgba(30,20,60,' + (0.045 + 0.05 * e).toFixed(3) + ')';
    ctx.lineWidth = 1;
    ctx.strokeRect(-half + 0.5, -half + 0.5, half * 2 - 1, half * 2 - 1);
    ctx.restore();
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
    ptr.x += (ptr.tx - ptr.x) * follow;
    ptr.y += (ptr.ty - ptr.y) * follow;

    var R = idle ? radius * 0.75 : radius, strength = idle ? (W < 760 ? 0.45 : 0.6) : 1;
    for (var k = 0; k < cells.length; k++) {
      var c = cells[k];
      if (!reduce) {
        var dx = c.x - ptr.x, dy = c.y - ptr.y, d = Math.sqrt(dx * dx + dy * dy);
        var target = d < R ? Math.pow(1 - d / R, 1.4) * strength : 0;
        c.e = target > c.e ? c.e + (target - c.e) * 0.3 : c.e * 0.955;
      }
      if (SQUARES) {
        if (!reduce) {
          if (Math.random() < 0.0015) c.at = tileAlpha(Math.random());
          c.a += (c.at - c.a) * 0.02;
        }
        tile(c);
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
