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
    gap = SQUARES ? (small ? 46 : 76) : (small ? 30 : 44);
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
          a: pinkAlpha(rand(i, j, 6)), dim: 1, ang: 0, vel: 0, on: false, hold: 0, axis: 0, dir: 1, tilt: 0.3,
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

  // Tile front colors: about a quarter white, the rest pink at varied strengths
  function pinkAlpha(r) { return r < 0.24 ? 0 : 0.14 + Math.pow((r - 0.24) / 0.76, 1.3) * 0.66; }
  function reroll(c) { c.tint = TINTS[Math.floor(Math.random() * TINTS.length)]; c.a = pinkAlpha(Math.random()); }

  // Draw one tile as a card rotated in 3D (about the Y or X axis) with perspective.
  // Front face is the pink, back face is a soft white; a thin gray edge gives it thickness.
  var P = 520; // perspective distance
  function tile(c) {
    var h = (gap - 1) / 2, th = c.ang, cs = Math.cos(th), sn = Math.sin(th);
    var pts = [[-h, -h], [h, -h], [h, h], [-h, h]].map(function (q) {
      var x, y, z;
      if (c.axis === 0) { x = q[0] * cs; z = q[0] * sn; y = q[1]; }      // flip left/right
      else { y = q[1] * cs; z = q[1] * sn; x = q[0]; }                    // flip up/down
      var f = P / (P - z * c.dir);
      return [c.x + x * f, c.y + y * f];
    });
    var front = cs >= 0, lit = 0.86 + 0.14 * Math.abs(cs);
    var r, g, b;
    if (front) {
      var a = c.a * c.dim;
      r = 255 + (c.tint[0] - 255) * a; g = 255 + (c.tint[1] - 255) * a; b = 255 + (c.tint[2] - 255) * a;
    } else { r = 248; g = 247; b = 250; }
    r *= lit; g *= lit; b *= lit;
    var moving = Math.abs(sn) > 0.02;
    if (moving) { // edge / shadow for depth
      ctx.fillStyle = 'rgba(60,40,70,' + (0.10 * Math.abs(sn) + 0.03).toFixed(3) + ')';
      ctx.beginPath();
      for (var i = 0; i < 4; i++) ctx[i ? 'lineTo' : 'moveTo'](pts[i][0] + 1.5, pts[i][1] + 2);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
    ctx.beginPath();
    for (var k = 0; k < 4; k++) ctx[k ? 'lineTo' : 'moveTo'](pts[k][0], pts[k][1]);
    ctx.closePath(); ctx.fill();
    if (moving || !front) {
      ctx.strokeStyle = 'rgba(40,30,60,' + (0.05 + 0.08 * Math.abs(sn)).toFixed(3) + ')';
      ctx.lineWidth = 1; ctx.stroke();
    }
  }

  // Spring each tile toward flipped (white side up, resting at a slight tilt) or back to pink
  function stepTile(c, now, near, vx, vy) {
    if (near > 0) {
      if (!c.on) {
        c.on = true;
        c.axis = Math.abs(vx) >= Math.abs(vy) ? 0 : 1;   // flip the way the cursor is moving
        c.dir = (c.axis === 0 ? vx : vy) >= 0 ? 1 : -1;
        c.tilt = 0.18 + Math.random() * 0.32;
      }
      c.hold = now + 450 + Math.random() * 500;
    }
    if (c.on && now > c.hold) c.on = false;
    var target = c.on ? Math.PI - c.tilt : 0;
    var before = c.ang;
    c.vel += (target - c.ang) * 0.085;
    c.vel *= 0.74;
    c.ang += c.vel;
    // When the pink side swings back into view it may come back a different pink
    if (before > Math.PI / 2 && c.ang <= Math.PI / 2 && Math.random() < 0.6) reroll(c);
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
    for (var k = 0; k < cells.length; k++) {
      var c = cells[k];
      if (!reduce) {
        var dx = c.x - ptr.x, dy = c.y - ptr.y, d = Math.sqrt(dx * dx + dy * dy);
        var target = d < R ? Math.pow(1 - d / R, 1.4) * strength : 0;
        c.e = target > c.e ? c.e + (target - c.e) * 0.3 : c.e * 0.955;
      }
      if (SQUARES) {
        if (!reduce) {
          var ddx = c.x - ptr.x, ddy = c.y - ptr.y;
          stepTile(c, t, (ddx * ddx + ddy * ddy < R * R * 0.42) ? 1 : 0, pvx, pvy);
          if (!c.on && Math.abs(c.ang) < 0.01 && Math.random() < 0.0006) reroll(c); // slow shimmer
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
