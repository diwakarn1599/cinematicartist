/* =====================================================================
   ARTIST — scene controller (vanilla JS, no dependencies)
   ===================================================================== */
(function () {
  'use strict';
  var html = document.documentElement;
  var CFG = window.ARTIST_CONFIG || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = function () { return html.classList.contains('reduce-motion'); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    sget: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  var Dani = window.Dani || { scene: function () {}, react: function () {}, say: function () {}, lookAt: function () {} };

  /* ===================================================== opening sequence */
  // Production → ARTIST → credits → Scroll, one after another (timings in main.css, data-beat).
  var openingPlayed = false;
  function playOpening() {
    var s = $('#opening');
    if (!s || openingPlayed) return; openingPlayed = true;
    s.classList.add('is-playing');
    // Dani greets once "Scroll" has appeared, so the bubble doesn't cover the titles
    setTimeout(function () { Dani.say(s.dataset.daniLine); }, reduce() ? 0 : 5600);
  }
  if (!html.classList.contains('curtain-on')) playOpening();

  /* ===================================================== theatre curtain (intro) */
  // Closed on every visit. Scrolling / swiping drives the curtains open (--p 0→1);
  // the button, Enter, Space or ArrowDown opens them fully. Then the home page starts.
  (function theatre() {
    var el = $('#theatre');
    if (!el || !html.classList.contains('curtain-on')) return;
    var btn = $('#theatreOpen');
    var p = 0, target = 0, speed = .16, raf = 0, idle = 0, done = false, y0 = null;

    // always start at the home page
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    window.scrollTo(0, 0);
    var hint = $('#theatreHint'); // optional — may be removed from the markup
    if (hint && window.matchMedia('(hover: none), (pointer: coarse)').matches) hint.textContent = 'Swipe up to open the curtain';
    btn.focus({ preventScroll: true });

    function render() { el.style.setProperty('--p', p.toFixed(4)); }
    function loop() {
      raf = 0;
      p += (target - p) * speed;
      if (Math.abs(target - p) < .002) p = target;
      render();
      if (p >= 1) { finish(); return; }
      if (p !== target) raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }
    function settleLater() {
      clearTimeout(idle);
      // let go past ~40% and it finishes opening; earlier and it falls closed again
      idle = setTimeout(function () { if (done) return; speed = .07; target = target > .4 ? 1 : 0; kick(); }, 380);
    }
    function push(d) {
      if (done) return;
      el.classList.add('is-touched');
      if (reduce()) { openFully(); return; }
      speed = .16; target = clamp(target + d, 0, 1); kick(); settleLater();
    }
    function openFully() {
      if (done) return;
      el.classList.add('is-touched');
      if (reduce()) { p = target = 1; render(); finish(); return; }
      clearTimeout(idle); speed = .06; target = 1; kick();
    }
    function finish() {
      if (done) return; done = true;
      clearTimeout(idle); cancelAnimationFrame(raf);
      window.removeEventListener('wheel', onWheel, { passive: false });
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove, { passive: false });
      window.removeEventListener('keydown', onKey);
      el.classList.add('is-open');
      window.scrollTo(0, 0);
      setTimeout(function () {
        html.classList.remove('curtain-on');   // unlocks scrolling
        el.setAttribute('aria-hidden', 'true');
        playOpening();
        requestTick();
      }, reduce() ? 0 : 450);
    }

    function onWheel(e) {
      e.preventDefault();
      var d = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1);
      push(d / (window.innerHeight * 1.3));
    }
    function onTouchStart(e) { y0 = e.touches[0].clientY; }
    function onTouchMove(e) {
      if (y0 == null) return;
      e.preventDefault();
      var y = e.touches[0].clientY; push((y0 - y) / (window.innerHeight * .8)); y0 = y;
    }
    function onKey(e) {
      if (['ArrowDown', 'PageDown', ' ', 'Spacebar', 'End'].indexOf(e.key) > -1 || (e.key === 'Enter' && e.target !== btn)) { e.preventDefault(); openFully(); }
    }
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKey);
    btn.addEventListener('click', openFully);
    // the skip link should also get people past the curtain
    $('.skip-link').addEventListener('click', function () { if (!done) { p = target = 1; render(); finish(); } });
  })();

  /* ===================================================== the red frame (veins + trees) */
  var rand = (function (seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; });
  function buildFrame() {
    var W = window.innerWidth, H = window.innerHeight;
    var cs = getComputedStyle(html);
    var px = function (v) { var d = document.createElement('div'); d.style.width = v; document.body.appendChild(d); var w = d.getBoundingClientRect().width; d.remove(); return w; };
    var fx = px(cs.getPropertyValue('--frame-x')), ft = px(cs.getPropertyValue('--frame-top')), fb = px(cs.getPropertyValue('--frame-bottom'));
    var win = $('#frameWindow');
    win.setAttribute('x', fx); win.setAttribute('y', ft);
    win.setAttribute('width', Math.max(0, W - 2 * fx)); win.setAttribute('height', Math.max(0, H - ft - fb));
    win.setAttribute('filter', W < 700 ? 'url(#rough-sm)' : 'url(#rough)');

    // crack-veins in the red border
    var r = rand(11), d = '';
    var n = Math.round((W + H) / 38);
    for (var i = 0; i < n; i++) {
      var side = r() * 4 | 0, x, y, ang;
      if (side === 0) { x = r() * W; y = r() * ft * 1.6; ang = Math.PI / 2; }
      else if (side === 1) { x = W - r() * fx * 1.8; y = r() * H; ang = Math.PI; }
      else if (side === 2) { x = r() * W; y = H - r() * fb * 1.6; ang = -Math.PI / 2; }
      else { x = r() * fx * 1.8; y = r() * H; ang = 0; }
      d += crack(x, y, ang + (r() - .5) * 1.6, 5 + (r() * 6 | 0), r);
    }
    $('#frameVeins').innerHTML = '<path d="' + d + '"/>';

    // thorn trees along the bottom (red ones across, dark ones at the corners)
    var tree = $('#frameTrees');
    var th = tree.getBoundingClientRect().height || 120;
    tree.setAttribute('viewBox', '0 0 ' + W + ' ' + th);
    var rt = rand(5), layers = { red: ['', '', '', ''], dark: ['', '', '', ''] };
    var count = Math.max(6, Math.round(W / 70));
    for (var t = 0; t < count; t++) {
      var tx = (t + .2 + rt() * .6) * (W / count);
      branch(layers.red, tx, th + 2, -Math.PI / 2 + (rt() - .5) * .3, th * (.26 + rt() * .2), 0, rt);
    }
    [[W * .02, 1], [W * .98, -1]].forEach(function (c) {
      branch(layers.dark, c[0], th + 2, -Math.PI / 2 + c[1] * .35, th * .5, 0, rt);
    });
    var widths = [3.2, 2, 1.2, .7], out = '';
    ['red', 'dark'].forEach(function (k) {
      layers[k].forEach(function (p, i) { if (p) out += '<path class="t-' + k + '" stroke-width="' + widths[i] + '" d="' + p + '"/>'; });
    });
    tree.innerHTML = out;
  }
  function crack(x, y, ang, steps, r) {
    var d = 'M' + x.toFixed(1) + ' ' + y.toFixed(1);
    for (var s = 0; s < steps; s++) {
      ang += (r() - .5) * 1.2;
      var len = 6 + r() * 14;
      x += Math.cos(ang) * len; y += Math.sin(ang) * len;
      d += 'L' + x.toFixed(1) + ' ' + y.toFixed(1);
      if (r() < .25 && steps > 2) d += crack(x, y, ang + (r() < .5 ? 1 : -1) * (0.6 + r()), Math.max(1, steps - s - 2), r);
    }
    return d;
  }
  function branch(layer, x, y, ang, len, depth, r) {
    if (depth > 3 || len < 3) return;
    var x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
    // a slight kink makes it thorny
    var mx = (x + x2) / 2 + (r() - .5) * len * .25, my = (y + y2) / 2 + (r() - .5) * len * .1;
    layer[depth] += 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1);
    var kids = depth === 0 ? 3 + (r() * 2 | 0) : 2 + (r() * 2 | 0);
    for (var k = 0; k < kids; k++) {
      branch(layer, x2, y2, ang + (r() - .5) * 1.5, len * (.55 + r() * .25), depth + 1, r);
    }
  }

  /* ===================================================== split words for reading reveals */
  $$('[data-reveal="words"]').forEach(function (p) {
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) { walk(ch); }
      });
    };
    walk(p);
    $$('.w', p).forEach(function (w, i) { w.style.transitionDelay = Math.min(i * 18, 1400) + 'ms'; });
  });

  /* ===================================================== reveal on view */
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      if (el.getAttribute('data-reveal') === 'stagger') {
        Array.prototype.forEach.call(el.children, function (c, i) { c.style.transitionDelay = (i * 90) + 'ms'; });
      }
      el.classList.add('is-in');
      revealIO.unobserve(el);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
  $$('[data-reveal]').forEach(function (el) { revealIO.observe(el); });
  // safety net: after a fast flick or a chapter jump, show anything already scrolled past
  var settle = 0;
  window.addEventListener('scroll', function () {
    clearTimeout(settle);
    settle = setTimeout(function () {
      $$('[data-reveal]:not(.is-in)').forEach(function (el) {
        if (el.getBoundingClientRect().bottom < window.innerHeight) { el.classList.add('is-in'); revealIO.unobserve(el); }
      });
    }, 250);
  }, { passive: true });

  /* ===================================================== chapters + active scene */
  var scenes = $$('main > .scene');
  var list = $('#chaptersList');
  scenes.forEach(function (s) {
    var li = document.createElement('li');
    var a = document.createElement('a'); a.href = '#' + s.id; a.textContent = s.dataset.chapter || s.id;
    a.addEventListener('click', function () { $('#chapters').close(); });
    li.appendChild(a); list.appendChild(li);
  });
  var topbar = $('.topbar');
  var activeIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var s = e.target;
      Dani.scene(s);
      $$('a', list).forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + s.id ? 'true' : 'false'); });
      topbar.classList.toggle('show-logo', s.id !== 'opening');
      if (s.id === 'end') Dani.react('end');
    });
  }, { rootMargin: '-48% 0px -48% 0px', threshold: 0 });
  scenes.forEach(function (s) { activeIO.observe(s); });

  /* ===================================================== scroll loop */
  var progressBar = $('#progressBar');
  var progScenes = $$('[data-progress]');
  var parallax = $$('[data-parallax]');
  var visible = new Set();
  var visIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target); });
    requestTick();
  }, { rootMargin: '10% 0px 10% 0px' });
  parallax.forEach(function (el) { visIO.observe(el); });

  var ticking = false, lastY = window.scrollY;
  function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', function () { layoutStrip(); requestTick(); });

  var hooks = [];
  function update() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    progressBar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0).toFixed(4) + ')';
    // hide the top bar while reading downwards
    if (Math.abs(y - lastY) > 6) { topbar.classList.toggle('is-hidden', y > lastY && y > vh * .6); lastY = y; }

    // only a handful of scroll-driven scenes, so measure them every frame (robust to chapter jumps)
    progScenes.forEach(function (el) {
      var r = el.getBoundingClientRect();
      // 0 when the section top hits the viewport top… 1 when its bottom hits the viewport bottom
      var span = r.height - vh;
      var p = span > 0 ? clamp(-r.top / span, 0, 1) : clamp((vh - r.top) / (vh + r.height), 0, 1);
      if (p !== el._p) { el.style.setProperty('--p', p.toFixed(4)); el._p = p; }
    });
    visible.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (el.hasAttribute('data-parallax') && !reduce()) {
        var k = parseFloat(el.getAttribute('data-parallax'));
        var c = r.top + r.height / 2 - vh / 2;
        el.style.transform = 'translate3d(0,' + (c * k).toFixed(1) + 'px,0)';
      }
    });
    hooks.forEach(function (h) { h(); });
  }

  /* ===================================================== logline tear */
  (function () {
    var s = $('#logline'); if (!s) return;
    var torn = false;
    hooks.push(function () {
      if (s._p == null) return;
      if (!torn && s._p > .5) { torn = true; s.dataset.daniSaid2 = '1'; Dani.react('tear'); }
      if (torn && s._p < .2) torn = false;
    });
  })();

  /* ===================================================== story: 40 Lent days tally */
  (function () {
    var svg = $('#tallyMarks'), num = $('#tallyNum'), s = $('#story');
    if (!svg) return;
    var lines = [], out = '';
    for (var g = 0; g < 8; g++) {
      var gx = (g % 4) * 80 + 6, gy = g < 4 ? 8 : 66;
      for (var m = 0; m < 4; m++) out += '<line pathLength="1" x1="' + (gx + m * 13) + '" y1="' + gy + '" x2="' + (gx + m * 13 + 2) + '" y2="' + (gy + 44) + '"/>';
      out += '<line pathLength="1" class="x" x1="' + (gx - 6) + '" y1="' + (gy + 34) + '" x2="' + (gx + 47) + '" y2="' + (gy + 10) + '"/>';
    }
    svg.innerHTML = out;
    lines = $$('line', svg);
    var shown = -1, done = false;
    function set(n) {
      if (n === shown) return; shown = n;
      num.textContent = n;
      lines.forEach(function (l, i) { l.classList.toggle('on', i < n); });
      if (n === 40 && !done) { done = true; Dani.react('tally-done'); }
    }
    hooks.push(function () {
      if (s._p == null) return;
      set(reduce() ? 40 : Math.round(clamp((s._p - .12) / .6, 0, 1) * 40));
    });
  })();

  /* ===================================================== structure timeline */
  (function () {
    var s = $('#structure'); if (!s) return;
    var nodes = $$('.timeline__node', s);
    hooks.push(function () {
      if (s._p == null) return;
      var p = reduce() ? 1 : clamp((s._p - .05) / .55, 0, 1);
      s.style.setProperty('--p', p.toFixed(3));
      nodes.forEach(function (n, i) { n.classList.toggle('is-on', p >= i / (nodes.length - 1) - .02); });
    });
  })();

  /* ===================================================== red / white split */
  (function () {
    var el = $('#split'), range = $('#splitRange'); if (!el) return;
    var last = 50;
    function set(v) {
      el.style.setProperty('--split', v + '%');
      if (v < 25 && last >= 25) Dani.react('split-white');
      if (v > 75 && last <= 75) Dani.react('split-red');
      last = v;
    }
    range.addEventListener('input', function () { set(+range.value); });
    // gentle hint: the line breathes once when the slider first comes into view
    var hinted = false;
    new IntersectionObserver(function (es, io) {
      es.forEach(function (e) {
        if (!e.isIntersecting || hinted || reduce()) return;
        hinted = true; io.disconnect();
        var t0 = performance.now();
        (function anim(t) {
          var k = (t - t0) / 1600; if (k > 1) { set(50); range.value = 50; return; }
          var v = 50 + Math.sin(k * Math.PI * 2) * 18; set(v); range.value = v;
          requestAnimationFrame(anim);
        })(t0);
      });
    }, { threshold: .6 }).observe(el);
  })();

  /* ===================================================== the world: colour lens */
  (function () {
    var lens = $('#lens'); if (!lens) return;
    var base = $('.lens__base', lens), col = $('.lens__colour', lens);
    var active = false, wander = 0, t0 = 0, touched = false;
    function setPos(x, y) { lens.style.setProperty('--x', x + 'px'); lens.style.setProperty('--y', y + 'px'); }
    function fromEvent(e) { var r = lens.getBoundingClientRect(); setPos(e.clientX - r.left, e.clientY - r.top); }
    lens.addEventListener('pointermove', function (e) { touched = true; fromEvent(e); if (!active) { active = true; Dani.react('lens'); } });
    lens.addEventListener('pointerdown', function (e) { touched = true; fromEvent(e); });
    lens.addEventListener('pointerleave', function () { active = false; });
    lens.addEventListener('keydown', function (e) {
      var r = lens.getBoundingClientRect(), cs = getComputedStyle(lens);
      var x = parseFloat(cs.getPropertyValue('--x')) || r.width / 2, y = parseFloat(cs.getPropertyValue('--y')) || r.height / 2, s = 24;
      var map = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] };
      if (!map[e.key]) return;
      e.preventDefault(); touched = true;
      setPos(clamp(x + map[e.key][0], 0, r.width), clamp(y + map[e.key][1], 0, r.height));
    });
    $$('.lens__thumbs button', lens).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.lens__thumbs button', lens).forEach(function (o) { o.classList.toggle('is-on', o === b); });
        base.src = col.src = b.dataset.lens;
      });
    });
    // idle wander so the effect is visible before anyone touches it
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !reduce()) { t0 = performance.now(); if (!wander) wander = requestAnimationFrame(loop); }
        else { cancelAnimationFrame(wander); wander = 0; }
      });
    }).observe(lens);
    function loop(t) {
      wander = requestAnimationFrame(loop);
      if (touched || active) return;
      var r = lens.getBoundingClientRect(), k = (t - t0) / 1000;
      setPos(r.width * (.5 + .32 * Math.sin(k * .7)), r.height * (.5 + .26 * Math.sin(k * 1.1 + 1)));
    }
    if (reduce()) setPos(lens.clientWidth * .5, lens.clientHeight * .5);
  })();

  /* ===================================================== frames: film strip */
  var stripState = {};
  (function () {
    var track = $('#stripTrack'); if (!track) return;
    var reels = CFG.reels || [], out = '', idx = 0;
    reels.forEach(function (reel) {
      out += '<div class="reel"><p class="reel__label">' + reel.label + ' <small>deck p.' + reel.page + '</small></p>';
      reel.stills.forEach(function (s) {
        var src = 'assets/img/stills/' + s[0] + '.webp';
        out += '<figure class="still"><button type="button" data-lightbox="' + src + '" data-caption="' + s[1].replace(/"/g, '&quot;') + '" data-group="frames">' +
          '<img src="' + src + '" alt="' + s[1].replace(/"/g, '&quot;') + '" width="1021" height="545" loading="lazy" decoding="async"></button>' +
          '<figcaption>' + (++idx < 10 ? '0' : '') + idx + ' / 20</figcaption></figure>';
      });
      out += '</div>';
    });
    track.innerHTML = out;
    stripState.track = track; stripState.section = $('#frames');
    // the strip moves sideways, so native lazy-loading fires late: warm all 20 stills as the section approaches
    new IntersectionObserver(function (es, io) {
      if (!es[0].isIntersecting) return;
      $$('img', track).forEach(function (im) { im.loading = 'eager'; });
      io.disconnect();
    }, { rootMargin: '150% 0px 150% 0px' }).observe(stripState.section);
  })();
  function layoutStrip() {
    var s = stripState.section, track = stripState.track; if (!s) return;
    var native = reduce() || window.innerWidth < 768 || html.classList.contains('touch');
    html.classList.toggle('strip-native', native);
    if (native) { s.style.height = ''; track.style.transform = ''; return; }
    var dist = Math.max(0, track.scrollWidth - window.innerWidth);
    stripState.dist = dist;
    s.style.height = (window.innerHeight + dist) + 'px';
  }
  hooks.push(function () {
    var s = stripState.section; if (!s || html.classList.contains('strip-native') || s._p == null) return;
    stripState.track.style.transform = 'translate3d(' + (-s._p * stripState.dist).toFixed(1) + 'px,0,0)';
  });

  /* ===================================================== posters: tilt */
  if (!html.classList.contains('touch')) {
    $$('.poster__btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        if (reduce()) return;
        var r = b.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        b.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg'); b.style.setProperty('--rx', (-y * 14).toFixed(2) + 'deg');
      });
      b.addEventListener('pointerleave', function () { b.style.setProperty('--ry', '0deg'); b.style.setProperty('--rx', '0deg'); });
    });
  }

  /* ===================================================== sealed truth */
  var spoilerOk = store.sget('artist:spoiler') === '1';
  var TWIST_PASSWORD = 'revealtwist';
  // Checks a password form; on success calls onOk, otherwise shows the "we got you" message.
  function passGate(form, input, msg, onOk) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (input.value.trim().toLowerCase() === TWIST_PASSWORD) {
        msg.hidden = true; input.value = '';
        onOk();
      } else {
        msg.hidden = false;
        msg.classList.remove('is-shake'); void msg.offsetWidth; msg.classList.add('is-shake');
        input.value = ''; input.focus();
        Dani.react('seal-denied');
      }
    });
    input.addEventListener('input', function () { msg.hidden = true; });
  }
  (function () {
    var seal = $('#seal'); if (!seal) return;
    var openBtn = $('#sealOpen'), closeBtn = $('#sealClose'), content = $('#sealContent'), closed = $('.seal__closed', seal);
    var form = $('#sealForm'), pass = $('#sealPass'), msg = $('#sealMsg');
    // step 1: "Break the seal" only reveals the password field
    function askPassword() {
      openBtn.hidden = true; form.hidden = false;
      openBtn.setAttribute('aria-expanded', 'true');
      pass.focus();
    }
    function resetAsk() {
      openBtn.hidden = false; form.hidden = true; msg.hidden = true; pass.value = '';
      openBtn.setAttribute('aria-expanded', 'false');
    }
    function open(focus) {
      seal.dataset.open = 'true'; content.hidden = false; closed.hidden = true;
      spoilerOk = true; store.sset('artist:spoiler', '1');
      if (focus) content.querySelector('h3').setAttribute('tabindex', '-1'), content.querySelector('h3').focus();
    }
    openBtn.addEventListener('click', askPassword);
    // step 2: the password decides
    passGate(form, pass, msg, function () { open(true); Dani.react('seal-open'); });
    openBtn.addEventListener('pointerenter', function () { Dani.react('seal-hover'); });
    openBtn.addEventListener('pointerleave', function () { if (seal.dataset.open !== 'true') Dani.react('seal-leave'); });
    closeBtn.addEventListener('click', function () {
      seal.dataset.open = 'false'; content.hidden = true; closed.hidden = false;
      resetAsk(); openBtn.focus();
      spoilerOk = false; store.sset('artist:spoiler', '0');
      Dani.react('seal-close');
    });
    if (spoilerOk) open(false);
  })();

  /* ===================================================== lightbox */
  (function () {
    var dlg = $('#lightbox'), img = $('#lightboxImg'), cap = $('#lightboxCap');
    var items = [], i = 0;
    function show(k) {
      i = (k + items.length) % items.length;
      img.src = items[i].dataset.lightbox; img.alt = items[i].dataset.caption || '';
      cap.textContent = items[i].dataset.caption || '';
      $('#lbPrev').hidden = $('#lbNext').hidden = items.length < 2;
    }
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-lightbox]'); if (!b) return;
      var g = b.dataset.group;
      items = g ? $$('[data-lightbox][data-group="' + g + '"]') : $$('.poster__btn');
      show(items.indexOf(b)); dlg.showModal(); Dani.react('lightbox');
    });
    $('#lbPrev').addEventListener('click', function () { show(i - 1); });
    $('#lbNext').addEventListener('click', function () { show(i + 1); });
    dlg.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(i - 1); if (e.key === 'ArrowRight') show(i + 1); });
    swipe(dlg, function (dir) { show(i + dir); });
  })();

  /* ===================================================== original deck viewer */
  (function () {
    var dlg = $('#deckview'), img = $('#deckImg'), thumbs = $('#deckThumbs'), count = $('#deckCount'), gate = $('#deckGate');
    var deck = (CFG.deck || []).map(function (d) { return typeof d === 'string' ? { title: d } : d; });
    var cur = 1, built = false;
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function build() {
      if (built) return; built = true;
      thumbs.innerHTML = deck.map(function (d, k) {
        return '<li><button type="button" data-slide="' + (k + 1) + '" aria-label="Slide ' + (k + 1) + ': ' + d.title + '"' + (d.spoiler ? ' class="is-veiled"' : '') + '>' +
          '<img src="assets/img/deck/thumbs/thumb-' + pad(k + 1) + '.webp" alt="" width="480" height="270" loading="lazy" decoding="async"><span>' + (k + 1) + '</span></button></li>';
      }).join('');
      thumbs.addEventListener('click', function (e) { var b = e.target.closest('[data-slide]'); if (b) go(+b.dataset.slide); });
    }
    function go(n) {
      cur = clamp(n, 1, deck.length);
      var d = deck[cur - 1] || { title: '' }, veiled = d.spoiler && !spoilerOk;
      img.src = 'assets/img/deck/slide-' + pad(cur) + '.webp';
      img.alt = veiled ? 'Veiled slide (contains the ending).' : 'Original pitch deck slide ' + cur + ': ' + d.title + '.';
      img.classList.toggle('is-veiled', !!veiled); gate.hidden = !veiled;
      count.textContent = cur + ' / ' + deck.length + ' — ' + d.title;
      $$('button', thumbs).forEach(function (b) {
        var on = +b.dataset.slide === cur; b.setAttribute('aria-current', on ? 'true' : 'false');
        if (on) b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce() ? 'auto' : 'smooth' });
        if (spoilerOk) b.classList.remove('is-veiled');
      });
    }
    passGate($('#deckGateForm'), $('#deckGatePass'), $('#deckGateMsg'), function () { spoilerOk = true; store.sset('artist:spoiler', '1'); go(cur); });
    $('#deckPrev').addEventListener('click', function () { go(cur - 1); });
    $('#deckNext').addEventListener('click', function () { go(cur + 1); });
    dlg.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT') return; // typing the password, not navigating
      if (e.key === 'ArrowLeft') go(cur - 1); if (e.key === 'ArrowRight') go(cur + 1);
      if (e.key === 'Home') go(1); if (e.key === 'End') go(deck.length);
    });
    swipe($('.deckview__stage'), function (dir) { go(cur + dir); });
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-open-deck]'); if (!b) return;
      build(); dlg.showModal(); go(+b.dataset.openDeck || 1);
    });
  })();

  /* ===================================================== dialogs: shared close behaviour */
  $$('dialog').forEach(function (d) {
    d.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) { d.close(); return; }
      if (e.target === d) d.close(); // backdrop
    });
  });
  $('#openChapters').addEventListener('click', function () { $('#chapters').showModal(); });

  function swipe(el, cb) {
    var x0 = null;
    el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) cb(dx < 0 ? 1 : -1);
    });
  }

  /* ===================================================== toggles: guide & motion */
  (function () {
    var g = $('#toggleGuide'), m = $('#toggleMotion');
    function sync() {
      g.setAttribute('aria-pressed', html.classList.contains('guide-off') ? 'false' : 'true');
      m.setAttribute('aria-pressed', reduce() ? 'false' : 'true');
    }
    g.addEventListener('click', function () {
      var off = html.classList.toggle('guide-off'); store.set('artist:guide', off ? 'off' : 'on'); sync();
      if (!off) Dani.say('I\'m back.', 2000);
    });
    m.addEventListener('click', function () {
      var off = html.classList.toggle('reduce-motion'); store.set('artist:motion', off ? 'off' : 'on'); sync();
      layoutStrip(); requestTick(); toggleEmbers();
    });
    sync();
  })();

  /* ===================================================== embers in the opening */
  var toggleEmbers = (function () {
    var c = $('#embers'); if (!c || !c.getContext) return function () {};
    var ctx = c.getContext('2d'), parts = [], raf = 0, onScreen = true, dpr = Math.min(2, window.devicePixelRatio || 1);
    var N = html.classList.contains('lite') ? 0 : (window.innerWidth < 700 ? 26 : 60);
    function size() { c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr; }
    function spawn(p, initial) {
      p.x = Math.random() * c.width; p.y = initial ? Math.random() * c.height : c.height + 10;
      p.r = (Math.random() * 1.6 + .4) * dpr; p.vy = -(Math.random() * .5 + .2) * dpr; p.vx = (Math.random() - .5) * .25 * dpr;
      p.life = Math.random() * .6 + .4; p.ph = Math.random() * 6.28; return p;
    }
    for (var i = 0; i < N; i++) parts.push(spawn({}, true));
    function frame(t) {
      raf = requestAnimationFrame(frame);
      ctx.clearRect(0, 0, c.width, c.height);
      parts.forEach(function (p) {
        p.x += p.vx + Math.sin(t / 900 + p.ph) * .15 * dpr; p.y += p.vy;
        if (p.y < -10) spawn(p);
        var a = (.35 + .35 * Math.sin(t / 300 + p.ph)) * p.life * clamp(p.y / c.height * 1.4, 0, 1);
        ctx.fillStyle = 'rgba(255,' + (150 + (p.ph * 15 | 0)) + ',40,' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      });
    }
    function run() { cancelAnimationFrame(raf); raf = 0; if (onScreen && !reduce() && N && !document.hidden) raf = requestAnimationFrame(frame); else ctx.clearRect(0, 0, c.width, c.height); }
    new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; run(); }).observe(c);
    document.addEventListener('visibilitychange', run);
    window.addEventListener('resize', size);
    size(); run();
    return run;
  })();

  /* ===================================================== trailer, contact, facts, pdf */
  (function () {
    var t = CFG.trailer || {}, player = $('#player');
    if (t.type === 'file' && t.src) {
      var v = document.createElement('video');
      v.controls = true; v.preload = 'none'; v.playsInline = true; if (t.poster) v.poster = t.poster;
      v.innerHTML = '<source src="' + t.src + '" type="video/mp4">' + (t.captions ? '<track kind="captions" src="' + t.captions + '" srclang="en" label="English" default>' : '');
      v.setAttribute('aria-label', 'ARTIST — trailer');
      v.addEventListener('error', function () { v.remove(); }, true);
      player.appendChild(v);
    } else if ((t.type === 'youtube' || t.type === 'vimeo') && t.src) {
      // click-to-load keeps third-party players off the page until wanted
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'btn btn--gold'; b.textContent = 'Play trailer';
      b.style.cssText = 'position:relative;z-index:2';
      $('.player__empty p', player).replaceWith(b);
      b.addEventListener('click', function () {
        var f = document.createElement('iframe');
        f.src = t.type === 'youtube' ? 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(t.src) + '?autoplay=1&rel=0' : 'https://player.vimeo.com/video/' + encodeURIComponent(t.src) + '?autoplay=1';
        f.allow = 'autoplay; fullscreen; picture-in-picture'; f.allowFullscreen = true; f.title = 'ARTIST — trailer';
        player.appendChild(f);
      });
    }
    if (CFG.deckPdf) { $('#deckPdfItem').hidden = false; $('#deckPdfLink').href = CFG.deckPdf; }

    var facts = (CFG.facts || []).filter(function (f) { return f[1]; });
    if (facts.length) {
      $('#factSheet').innerHTML = '<dl class="facts">' + facts.map(function (f) { return '<div><dt>' + f[0] + '</dt><dd>' + f[1] + '</dd></div>'; }).join('') + '</dl>';
    }
    var c = CFG.contact || {}, bits = [];
    if (c.name) bits.push('<span>' + c.name + '</span>');
    if (c.email) bits.push('<a href="mailto:' + c.email + '">' + c.email + '</a>');
    if (c.phone) bits.push('<a href="tel:' + c.phone.replace(/\s+/g, '') + '">' + c.phone + '</a>');
    if (c.instagram) bits.push('<a href="' + c.instagram + '" rel="noopener" target="_blank">Instagram</a>');
    $('#contact').innerHTML = bits.join(' &middot; ');
  })();

  /* ===================================================== boot */
  buildFrame();
  var rz = 0;
  window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(buildFrame, 150); });
  layoutStrip();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layoutStrip(); requestTick(); });
  window.addEventListener('load', function () { layoutStrip(); requestTick(); });
  requestTick();
})();
