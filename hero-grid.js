/* Hero grid. Two looks, set by data-mode on the canvas: "squares" or the default glyphs.
   Squares: pink tiles with thin gaps. Moving the cursor sends smooth rings outward that tip the
   tiles near it and fade within a few tiles; tiles under the cursor shade from pink through purple to blue. Mostly
   white by default; after a moment without hovering the pinks come up and soft color drifts and
   rings move across the grid (color only, no tile motion).
   Glyphs: a quiet field of tiny gray marks that bloom into the brand palette
   around the cursor and fade out behind it, leaving a short trail. When the pointer is
   idle (or on touch screens) a soft bloom drifts slowly on its own. Static for people who
   prefer reduced motion. Colors come from ds.css: pink, purple, blue. */
(function () {
  var canvas = document.querySelector('.hero-grid');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // data-mode="squares": soft tinted tiles that tilt and go white around the cursor.
  // Anything else: the glyph field.
  var SQUARES = canvas.getAttribute('data-mode') === 'squares';
  // Tile color schemes. data-palette on the canvas: "shift" (cycle pink → purple → blue), or a
  // single scheme. #pink / #purple / #blue / #shift in the URL overrides it, for comparing.
  // Each: resting tints (main color ~3/4, the others as accents) and the ripple ramp from its
  // pale edge to its deepest point.
  function rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  var SCHEMES = {
    pink: { // pink main, blue and purple accents
      tints: ['#f472d0', '#f472d0', '#f472d0', '#f472d0', '#f472d0', '#f472d0', '#f472d0', '#f472d0', '#f472d0', '#6b8cf5', '#6b8cf5', '#a78bfa'],
      ramp: [[251, 212, 240], [246, 160, 222], [238, 120, 205], [170, 140, 240]]
    },
    purple: { // purple main, pink and blue accents
      tints: ['#a78bfa', '#a78bfa', '#a78bfa', '#a78bfa', '#a78bfa', '#a78bfa', '#a78bfa', '#a78bfa', '#a78bfa', '#f472d0', '#f472d0', '#6b8cf5'],
      ramp: [[240, 220, 250], [200, 180, 250], [167, 139, 250], [130, 120, 240]]
    },
    blue: { // blue main, pink and purple accents
      tints: ['#6b8cf5', '#6b8cf5', '#6b8cf5', '#6b8cf5', '#6b8cf5', '#6b8cf5', '#6b8cf5', '#6b8cf5', '#6b8cf5', '#f472d0', '#f472d0', '#a78bfa'],
      ramp: [[244, 214, 246], [170, 188, 250], [120, 150, 245], [95, 125, 236]]
    }
  };
  var CYCLE = ['pink', 'purple', 'blue'], HOLD = 14000, SWEEP = 5000; // ms per color, ms per change
  var shifting = false, cyc = 0, nextShift = 0, sweepStart = -1e9, rampFrom = null, rampTo = null;
  var TINTS, RAMP;
  function schemeName() {
    var h = (location.hash || '').slice(1), d = canvas.getAttribute('data-palette');
    if (h === 'shift' || SCHEMES[h]) return h;
    return d === 'shift' || SCHEMES[d] ? d : 'blue';
  }
  function liftRamp(r) { // lift each stop well toward white so the hover never gets too dark
    return r.map(function (c) { return c.map(function (v) { return v + (255 - v) * 0.3; }); });
  }
  function useScheme(name) {
    shifting = name === 'shift' && !reduce;
    if (name === 'shift') {
      cyc = Math.floor(Math.random() * CYCLE.length); // each visit starts somewhere different
      name = CYCLE[cyc];
      nextShift = performance.now() + HOLD;
    }
    var sc = SCHEMES[name];
    TINTS = sc.tints.map(rgb);
    RAMP = liftRamp(sc.ramp); rampFrom = rampTo = RAMP;
    // existing tiles drift to the new colors (same tile keeps the same slot in the list)
    for (var i = 0; i < cells.length; i++) { cells[i].tt = TINTS[Math.floor(cells[i].pick * TINTS.length)]; cells[i].sw = 0; }
  }
  // Move to the next main color: tiles pick up the new tint in a soft sweep from left to
  // right (with a little randomness), and the ripple colors blend across over the same time.
  function shiftStep(t) {
    if (!shifting) return;
    if (t >= nextShift) {
      cyc = (cyc + 1) % CYCLE.length;
      var sc = SCHEMES[CYCLE[cyc]];
      TINTS = sc.tints.map(rgb);
      rampFrom = RAMP; rampTo = liftRamp(sc.ramp);
      sweepStart = t; nextShift = t + HOLD;
      for (var i = 0; i < cells.length; i++) {
        var c = cells[i];
        c.sw = t + (c.x / (W || 1)) * SWEEP * 0.75 + c.nz * SWEEP * 0.25;
      }
    }
    for (var j = 0; j < cells.length; j++) {
      var cj = cells[j];
      if (cj.sw && t >= cj.sw) { cj.tt = TINTS[Math.floor(cj.pick * TINTS.length)]; cj.sw = 0; }
    }
    var f = Math.max(0, Math.min(1, (t - sweepStart) / SWEEP));
    if (f < 1) RAMP = rampFrom.map(function (a, k) { return a.map(function (v, m) { return v + (rampTo[k][m] - v) * f; }); });
    else RAMP = rampTo;
  }

  var PALETTE = ['#f472d0', '#ee6bd2', '#a78bfa', '#6b8cf5', '#a5b4fc'].map(function (h) {
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

    cols = Math.ceil(W / gap) + 1; rows = Math.ceil(H / gap);
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
          pick: rand(i, j, 5), tint: TINTS[Math.floor(rand(i, j, 5) * TINTS.length)],
          a: pinkAlpha(rand(i, j, 6)), dim: 1, nz: rand(i, j, 7), sw: 0, gx: 0, gy: 0, re: 0,
          e: 0
        });
      }
    }
    for (var m0 = 0; m0 < cells.length; m0++) { var cm = cells[m0]; cm.at = cm.a; cm.tt = cm.tint; cm.tc = cm.tint.slice(); }
    // Full grid everywhere: the CSS haze softens the tiles behind the nav and the text
    for (var n = 0; n < cells.length; n++) cells[n].dim = 1;
    if (old.length === cells.length) for (var k = 0; k < cells.length; k++) { var ok = old[k], nk = cells[k]; nk.e = ok.e; nk.a = ok.a; nk.at = ok.at; nk.tt = ok.tt; nk.tc = ok.tc; }

    var rect = canvas.getBoundingClientRect();
    scale = W ? rect.width / W : 1; // CSS zoom on <body> scales the page
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(W * scale * dpr);
    canvas.height = Math.round(H * scale * dpr);
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    if (reduce) draw(0);
  }

  // Tile colors: about a quarter white, the rest pink at varied strengths
  // more tiles stay white, and tinted ones stay light
  function pinkAlpha(r) { return r < 0.42 ? 0 : 0.1 + Math.pow((r - 0.42) / 0.58, 1.4) * 0.42; }
  function reroll(c) { c.tt = TINTS[Math.floor(Math.random() * TINTS.length)]; c.at = pinkAlpha(Math.random()); }
  function easeColor(c, k) { // drift toward a new pink over about a second and a half
    var f = 1 - Math.pow(0.97, k);
    c.a += (c.at - c.a) * f;
    for (var i = 0; i < 3; i++) c.tc[i] += (c.tt[i] - c.tc[i]) * f;
  }

  // Spread: the cursor tints the tiles under it a deeper pink, and that color soaks outward
  // to neighboring tiles (a simple diffusion), fading as it travels. No movement, no bounce.
  var cols = 0, rows = 0, next = [], lastT = 0, STEP = 1000 / 60;
  function rampColor(x) { // x: 0..1
    x = Math.max(0, Math.min(1, x)) * (RAMP.length - 1);
    var i = Math.min(RAMP.length - 2, Math.floor(x)), f = x - i, a = RAMP[i], b = RAMP[i + 1];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  }
  // Ripples: each cursor movement sends out one smooth ring that travels outward and fades
  // steadily (no sloshing back). A tile tips toward the ring as it arrives and away as it
  // passes, so a soft crest rolls across the grid. Timed in milliseconds, so it looks the same
  // at any frame rate.
  var waves = [], lastWave = { x: -1e9, y: -1e9, t: 0 };
  var RING_V = 0.4, RING_LIFE = 620, RING_AMP = 0.085;   // px/ms, ms, slope
  function ripples(t, idle, spd, k) {
    var i, c;
    var moving = !idle && spd > 2 && t - ptr.last < 70; // only while the mouse is really moving
    var ghost = false; // idle mode moves colors only, no tile motion
    if (moving || ghost) {
      var mx = ptr.x - lastWave.x, my = ptr.y - lastWave.y;
      if (mx * mx + my * my > gap * gap * 0.8 || t - lastWave.t > (ghost ? 180 : 110)) {
        var str = moving ? Math.max(0.15, Math.min(1, (spd - 2) / 14)) : 0.35 * idleMix;
        waves.push({ x: ptr.x, y: ptr.y, t: t, s: str });
        if (waves.length > 30) waves.shift();
        lastWave = { x: ptr.x, y: ptr.y, t: t };
      }
    }
    while (waves.length && t - waves[0].t > RING_LIFE) waves.shift();
    var w = gap * 0.95, ease = 1 - Math.pow(0.72, k);
    for (i = 0; i < cells.length; i++) {
      c = cells[i];
      var tx = 0, ty = 0;
      for (var j = 0; j < waves.length; j++) {
        var rw = waves[j], age = t - rw.t;
        var dx = c.x - rw.x, dy = c.y - rw.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        var off = d - RING_V * age;
        if (off > w * 3 || off < -w * 3) continue;
        var life = 1 - age / RING_LIFE;
        var amp = rw.s * life * life * Math.exp(-d / (gap * 2.2)) * RING_AMP; // stays near the cursor
        var prof = -(off / w) * Math.exp(-(off * off) / (2 * w * w)) * 1.65; // one smooth crest
        tx += (dx / d) * prof * amp; ty += (dy / d) * prof * amp;
      }
      c.gx += (tx - c.gx) * ease; c.gy += (ty - c.gy) * ease;
    }
  }

  // Idle show: when nobody is hovering, a rotating set of color-only effects plays across the
  // grid, a new one every few seconds, overlapping softly. All use the current scheme's ripple
  // colors and pass through clean() like everything else, and they fade out when you hover.
  //   sweep   a broad band of color rolls across the whole screen at a random angle
  //   ring    a ring of color expands from a random spot across the entire grid
  //   sparkle random spots bloom one after another and fade
  //   rain    many small quick drops of color land and fade
  var fx = [], nextFx = 0, lastKind = '', idleMix = 0, idleStart = 0;
  var KINDS = ['sweep', 'ring', 'sparkle', 'rain'];
  function startFx(t) {
    var kinds = KINDS.filter(function (k) { return k !== lastKind; });
    var kind = kinds[Math.floor(Math.random() * kinds.length)]; lastKind = kind;
    var R = function (a, b) { return a + Math.random() * (b - a); };
    if (kind === 'sweep') {
      var ang = R(0, Math.PI * 2);
      fx.push({ k: 'sweep', t: t, life: 5200, cx: Math.cos(ang), cy: Math.sin(ang), w: gap * 3.2, amp: 0.95 });
    } else if (kind === 'ring') {
      fx.push({ k: 'ring', t: t, life: 6500, x: R(0.15, 0.95) * W, y: R(0.1, 0.9) * H, v: 0.22, w: gap * 1.8, amp: 1 });
    } else if (kind === 'sparkle') {
      for (var i = 0; i < 11; i++) fx.push({ k: 'bloom', t: t + i * R(140, 260), life: R(1600, 2400), x: R(0.05, 0.98) * W, y: R(0.05, 0.95) * H, r: gap * R(1.1, 2.2), amp: R(0.75, 1) });
    } else { // rain
      for (var j = 0; j < 26; j++) fx.push({ k: 'bloom', t: t + R(0, 3200), life: R(700, 1100), x: R(0, 1) * W, y: R(0, 1) * H, r: gap * R(0.55, 0.9), amp: R(0.6, 0.9) });
    }
    nextFx = t + R(3600, 5200);
  }
  function fxAt(e, c, t) {
    var age = t - e.t;
    if (age < 0 || age > e.life) return 0;
    var life = age / e.life;
    if (e.k === 'bloom') {
      var dx = c.x - e.x, dy = c.y - e.y, d2 = (dx * dx + dy * dy) / (e.r * e.r);
      return Math.exp(-d2) * Math.sin(Math.PI * life) * e.amp;
    }
    var fade = Math.sin(Math.PI * Math.min(1, life * 1.1));      // eases in, then out
    if (e.k === 'sweep') {
      var span = W * Math.abs(e.cx) + H * Math.abs(e.cy);          // grid length along the sweep
      var lo = Math.min(0, W * e.cx) + Math.min(0, H * e.cy);
      var front = lo - e.w * 2 + (span + e.w * 4) * life;
      var off = c.x * e.cx + c.y * e.cy - front;
      return Math.exp(-(off * off) / (2 * e.w * e.w)) * fade * e.amp;
    }
    var rx = c.x - e.x, ry = c.y - e.y, off2 = Math.sqrt(rx * rx + ry * ry) - e.v * age;
    return Math.exp(-(off2 * off2) / (2 * e.w * e.w)) * fade * e.amp;
  }
  function colorRings(t, idle, k) {
    // effects begin after ~1.5s without hovering, ease in over ~2s, and ease out on hover
    if (!idle) idleStart = t;
    var on = idle && t - idleStart > 1500;
    idleMix += ((on ? 1 : 0) - idleMix) * (1 - Math.pow(1 - (on ? 0.008 : 0.04), k));
    if (idleMix > 0.3 && t >= nextFx) startFx(t);
    fx = fx.filter(function (e) { return t - e.t <= e.life; });
    for (var i = 0; i < cells.length; i++) {
      var c = cells[i], sum = 0;
      for (var j = 0; j < fx.length; j++) sum += fxAt(fx[j], c, t);
      c.re = Math.min(1, sum) * idleMix;
    }
  }

  function spread(t, idle, spd, k) {
    var n = cells.length, i, c;
    if (next.length !== n) next = new Array(n);
    // inject under the cursor, or under the wandering "ghost" while idle
    var amt = idle ? idleMix * 0.85 : 1;
    if (amt > 0.02) {
      var RR = gap * 1.6;
      for (i = 0; i < n; i++) {
        c = cells[i];
        var dx = c.x - ptr.x, dy = c.y - ptr.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < RR) { var want = Math.min(1, Math.pow(1 - d / RR, 1.1) * 1.4) * amt; if (want > c.e) c.e += (want - c.e) * (1 - Math.pow(0.5, k)); }
      }
    }
    // diffuse to the four neighbors, then fade
    for (i = 0; i < n; i++) {
      var x = i % cols, y = (i / cols) | 0, e = cells[i].e, sum = 0, cnt = 0;
      if (x > 0) { sum += cells[i - 1].e; cnt++; }
      if (x < cols - 1) { sum += cells[i + 1].e; cnt++; }
      if (y > 0) { sum += cells[i - cols].e; cnt++; }
      if (y < rows - 1) { sum += cells[i + cols].e; cnt++; }
      next[i] = (e + 0.11 * k * (sum - cnt * e)) * Math.pow(0.986, k);
    }
    for (i = 0; i < n; i++) cells[i].e = next[i] < 0.002 ? 0 : next[i];
    ripples(t, idle, spd, k);
  }

  // Tiles sit close with a thin gap. Each one tilts with the slope of the water under it, so the motion rolls
  // outward with the ripple; a gap only opens where a tile is tipped. Light comes from the
  // upper left, so slopes facing it brighten a little and slopes facing away dim.
  var P = 560, MAX_TILT = 0.3, TILT_GAIN = 1.8; // gentle: about 17° at most
  // Never muddy: whatever the mix (two tints, ripple, rings, shading), the final tile keeps its
  // hue and lightness but its saturation can't drop below a clean, candy-pastel level, and it
  // can't get dark. Near-white tiles are left alone.
  function clean(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx - mn < 0.004) return [r * 255, g * 255, b * 255];      // pure white/grey: leave
    var d = mx - mn, sat = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn), h;
    if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (mx === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    if (l > 0.985) return [r * 255, g * 255, b * 255];            // essentially white
    sat = Math.max(sat, 0.82);
    l = Math.max(l, 0.62);
    function hue(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; }
    var q = l < 0.5 ? l * (1 + sat) : l + sat - l * sat, p = 2 * l - q;
    return [hue(p, q, h + 1 / 3) * 255, hue(p, q, h) * 255, hue(p, q, h - 1 / 3) * 255];
  }

  function tile(c) {
    if (c.dim < 0.01) return;
    ctx.globalAlpha = c.dim;
    // mostly white by default; the pinks come up when the grid is playing on its own
    var a = c.a * (0.16 + 0.84 * idleMix), tc = c.tc || c.tint;
    var r = 255 + (tc[0] - 255) * a, g = 255 + (tc[1] - 255) * a, b = 255 + (tc[2] - 255) * a;
    var e = Math.min(1, c.e * 1.3);
    // under the cursor the tile walks down the ramp (pale lavender at the edge, blue-violet at the center);
    // idle effects walk part way down the ramp
    var ring = c.re || 0, mixA = Math.min(0.85, e * 1.3), mixB = ring * 0.62;
    if (mixA >= mixB && mixA > 0) {
      var col = rampColor(e);
      r += (col[0] - r) * mixA; g += (col[1] - g) * mixA; b += (col[2] - b) * mixA;
    } else if (mixB > 0) {
      var col2 = rampColor(0.25 + ring * 0.6);
      r += (col2[0] - r) * mixB; g += (col2[1] - g) * mixB; b += (col2[2] - b) * mixB;
    }
    var h = gap / 2 - 1.25; // a thin, even gap between tiles
    var gx = c.gx || 0, gy = c.gy || 0, mag = Math.sqrt(gx * gx + gy * gy);
    // the ripple only shows around the cursor and its short trail (where the pink has spread)
    var th = Math.min(MAX_TILT, mag * TILT_GAIN);
    var shade = -(gx + gy) * 1.1;
    shade = Math.max(-0.06, Math.min(0.3, shade)); // little darkening, so colors stay clean
    if (shade > 0) { r += (255 - r) * shade; g += (255 - g) * shade; b += (255 - b) * shade; }
    else { r *= 1 + shade * 0.6; g *= 1 + shade; b *= 1 + shade * 0.7; }
    var cl = clean(r, g, b); r = cl[0]; g = cl[1]; b = cl[2];
    ctx.fillStyle = 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
    if (th < 0.015) { ctx.fillRect(c.x - h, c.y - h, h * 2, h * 2); ctx.globalAlpha = 1; return; }
    var dx = gx / mag, dy = gy / mag, cs = Math.cos(th), sn = Math.sin(th);
    var twist = th * 0.06 * (c.spin > 0 ? 1 : -1), rc = Math.cos(twist), rs = Math.sin(twist);
    var k = 1 - 0.03 * th; // tipped tiles shrink a touch, opening a soft gap
    ctx.beginPath();
    var corners = [[-h, -h], [h, -h], [h, h], [-h, h]];
    for (var i = 0; i < 4; i++) {
      var px = corners[i][0] * k, py = corners[i][1] * k, pd = px * dx + py * dy;
      var qx = px - dx * pd + dx * pd * cs, qy = py - dy * pd + dy * pd * cs, z = -pd * sn;
      var f = P / (P - z), ox = qx * f, oy = qy * f;
      ctx[i ? 'lineTo' : 'moveTo'](c.x + ox * rc - oy * rs, c.y + ox * rs + oy * rc);
    }
    ctx.closePath();
    ctx.fill();
    if (sn > 0.12) { ctx.strokeStyle = 'rgba(255,255,255,' + (0.55 * sn).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.globalAlpha = 1;
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
      ptr.tx = W * (0.55 + 0.38 * Math.sin(t * 0.00023) * Math.cos(t * 0.00009));
      ptr.ty = H * (0.5 + 0.36 * Math.sin(t * 0.00031 + 1.3));
    }
    if (!ptr.seen) { ptr.x = ptr.tx; ptr.y = ptr.ty; ptr.seen = true; }
    var follow = idle ? 0.04 : 0.2, pvx = 0, pvy = 0;

    if (SQUARES) {
      // One smooth update per frame, scaled by the real time since the last frame
      var dt = lastT ? Math.min(100, t - lastT) : STEP;
      lastT = t;
      var k = Math.max(0.25, Math.min(2, dt / STEP));
      // the idle "ghost" starts on its own path, never where your cursor was resting
      if (idle && idleMix < 0.02) { ptr.x = ptr.tx; ptr.y = ptr.ty; }
      var f = 1 - Math.pow(1 - follow, k);
      pvx = (ptr.tx - ptr.x) * f; pvy = (ptr.ty - ptr.y) * f;
      ptr.x += pvx; ptr.y += pvy;
      if (!reduce) {
        shiftStep(t);
        colorRings(t, idle, k);
        spread(t, idle, Math.sqrt(pvx * pvx + pvy * pvy) / k, k);
        for (var q = 0; q < cells.length; q++) { if (Math.random() < 0.0004 * k) reroll(cells[q]); easeColor(cells[q], k); }
      }
      for (var k2 = 0; k2 < cells.length; k2++) tile(cells[k2]);
      return;
    }

    pvx = (ptr.tx - ptr.x) * follow; pvy = (ptr.ty - ptr.y) * follow;
    ptr.x += pvx;
    ptr.y += pvy;
    var R = idle ? radius * 0.75 : radius, strength = idle ? (W < 760 ? 0.45 : 0.6) : 1;
    for (var k = 0; k < cells.length; k++) {
      var c = cells[k];
      if (!reduce) {
        var dx = c.x - ptr.x, dy = c.y - ptr.y, d = Math.sqrt(dx * dx + dy * dy);
        var target = d < R ? Math.pow(1 - d / R, 1.4) * strength : 0;
        c.e = target > c.e ? c.e + (target - c.e) * 0.3 : c.e * 0.955;
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
    var was = ptr.inside && performance.now() - ptr.last < 3500;
    ptr.inside = x >= 0 && y >= 0 && x <= W && y <= H;
    if (ptr.inside) {
      if (!was) { ptr.x = x; ptr.y = y; } // jump straight to the real cursor
      ptr.tx = x; ptr.ty = y; ptr.last = performance.now();
    }
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

  useScheme(schemeName());
  window.addEventListener('hashchange', function () { useScheme(schemeName()); });
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  window.addEventListener('load', layout);
  start();
})();
