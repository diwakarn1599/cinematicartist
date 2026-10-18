/* =====================================================================
   Dani — the guide.
   A small caricature of the writer-director who walks along the frame's
   tree line, stops at each scene, says one line and reacts.

   Public API (window.Dani):
     Dani.scene(sectionEl)        walk to a section's station and speak its line
     Dani.say(text, ms?)          show a speech bubble
     Dani.mood(name)              happy | excited | scared | thinking | sad | shush
     Dani.pose(name)              idle | wave | point | shush
     Dani.jump() / Dani.shiver()
     Dani.lookAt(clientX, clientY)
     Dani.react(kind)             one-off reactions used by scenes
   Markup lives in index.html (#dani); styles in main.css (DANI section).
   ===================================================================== */
(function () {
  'use strict';
  var root = document.getElementById('dani');
  if (!root) return;
  var svg = document.getElementById('daniSvg');
  var btn = document.getElementById('daniBtn');
  var text = document.getElementById('daniText');
  var html = document.documentElement;

  var reduce = function () { return html.classList.contains('reduce-motion'); };
  var isTouch = html.classList.contains('touch');

  var state = { x: 18, scene: null, talkTimer: 0, walkTimer: 0, lastSaid: '', idleTimer: 0, tipIndex: 0 };

  /* ---------------- position & walking ---------------- */
  function clampX(pct) {
    // keep Dani inside the frame and clear of the edges on small screens
    var w = window.innerWidth, min = Math.max(48, w * 0.06), max = w - min;
    return Math.min(max, Math.max(min, (pct / 100) * w));
  }
  function walkTo(pct) {
    var from = state.px == null ? clampX(state.x) : state.px;
    var to = clampX(pct);
    state.x = pct; state.px = to;
    var dist = Math.abs(to - from);
    if (dist < 2) { root.style.setProperty('--dx', to + 'px'); return; }
    var dur = reduce() ? 0 : Math.min(2.4, 0.5 + dist / 520);
    root.style.setProperty('--walk', dur + 's');
    root.classList.toggle('is-flipped', to < from);
    root.style.setProperty('--dx', to + 'px');
    placeBubble(to);
    if (!dur) return;
    root.classList.add('is-walking');
    clearTimeout(state.walkTimer);
    state.walkTimer = setTimeout(function () {
      root.classList.remove('is-walking');
      root.classList.remove('is-flipped');
    }, dur * 1000);
  }
  var bubble = document.getElementById('daniBubble');
  function placeBubble(px) {
    var W = window.innerWidth, left = px > W * 0.62;
    root.classList.toggle('bubble-left', left);
    // keep the whole bubble on screen
    var bw = bubble.offsetWidth || 240;
    var x = px - bw * (left ? 0.85 : 0.15);
    x = Math.max(10, Math.min(W - bw - 10, x));
    root.style.setProperty('--bx', Math.round(x - px) + 'px');
  }

  /* ---------------- speech ---------------- */
  function say(t, ms) {
    if (!t) return;
    clearTimeout(state.talkTimer);
    text.textContent = t;
    state.lastSaid = t;
    placeBubble(state.px == null ? clampX(state.x) : state.px);
    root.classList.add('is-talking');
    var dur = ms || Math.min(9000, 2600 + t.length * 55);
    if (window.innerWidth < 700) dur = Math.min(dur, 4200); // small screens: get out of the way of the text sooner
    state.talkTimer = setTimeout(function () { root.classList.remove('is-talking'); }, dur);
  }
  function hush() { clearTimeout(state.talkTimer); root.classList.remove('is-talking'); }

  /* ---------------- expression & pose ---------------- */
  function mood(m) { root.setAttribute('data-mood', m || 'happy'); }
  function pose(p) { root.setAttribute('data-pose', p || 'idle'); }
  function retrigger(cls, ms) {
    if (reduce()) return;
    root.classList.remove(cls); void root.offsetWidth; root.classList.add(cls);
    setTimeout(function () { root.classList.remove(cls); }, ms);
  }
  function jump() { retrigger('is-jumping', 650); }
  function shiver() { retrigger('is-shiver', 750); }

  /* ---------------- eyes ---------------- */
  var look = { x: 0, y: 0, raf: 0 };
  function lookAt(cx, cy) {
    look.x = cx; look.y = cy;
    if (!look.raf) look.raf = requestAnimationFrame(applyLook);
  }
  function applyLook() {
    look.raf = 0;
    var r = svg.getBoundingClientRect();
    if (!r.width) return;
    // eye centre ≈ (50, 51) in a 100×150 viewBox
    var ex = r.left + r.width * 0.5, ey = r.top + r.height * (51 / 150);
    var dx = look.x - ex, dy = look.y - ey;
    var d = Math.hypot(dx, dy) || 1;
    var k = Math.min(1, d / 220) * 2.6;
    var flip = root.classList.contains('is-flipped') ? -1 : 1;
    svg.style.setProperty('--px', ((dx / d) * k * flip).toFixed(2));
    svg.style.setProperty('--py', ((dy / d) * k).toFixed(2));
  }
  function blink() {
    root.classList.add('is-blinking');
    setTimeout(function () { root.classList.remove('is-blinking'); }, 200);
    setTimeout(blink, 2200 + Math.random() * 3800);
  }

  /* ---------------- scenes ---------------- */
  function lineFor(sec) {
    if (isTouch && sec.dataset.daniLineTouch) return sec.dataset.daniLineTouch;
    return sec.dataset.daniLine || '';
  }
  function scene(sec) {
    if (!sec || sec === state.scene) return;
    state.scene = sec; state.tipIndex = 0;
    var d = sec.dataset;
    walkTo(parseFloat(d.daniX || '50'));
    mood(d.daniMood); pose(d.daniPose);
    var line = lineFor(sec);
    // speak once the walk is (mostly) done
    setTimeout(function () { if (state.scene === sec && !html.classList.contains('curtain-on')) { say(line); if (d.daniMood === 'scared') shiver(); } }, reduce() ? 0 : 700);
  }

  /* one-off reactions triggered by scene scripts */
  var reactions = {
    'tear': function () { mood('excited'); jump(); say(state.scene && state.scene.dataset.daniLine2 || ''); },
    'seal-hover': function () { mood('scared'); shiver(); },
    'seal-leave': function () { mood('shush'); },
    'seal-open': function () { mood('excited'); pose('idle'); jump(); say(state.scene && state.scene.dataset.daniLine2 || '', 6000); },
    'seal-denied': function () { mood('excited'); pose('wave'); jump(); say('Gotcha! Nice try.', 3200); setTimeout(function () { mood('shush'); pose('shush'); }, 3200); },
    'seal-close': function () { mood('shush'); pose('shush'); say('Sealed. Good.', 2500); },
    'split-red': function () { if (root.getAttribute('data-mood') !== 'scared') { mood('scared'); shiver(); } },
    'split-white': function () { mood('thinking'); },
    'lens': function () { if (root.getAttribute('data-mood') !== 'excited') mood('excited'); },
    'lightbox': function () { mood('excited'); },
    'tally-done': function () { mood('sad'); say('Forty days.', 2600); },
    'end': function () { pose('wave'); mood('happy'); jump(); }
  };
  function react(kind) { if (reactions[kind]) reactions[kind](); }

  /* ---------------- click / tap on Dani ---------------- */
  var generic = ['Keep scrolling — there\'s more.', 'Use Chapters (top right) to jump around.', 'The original deck is one button away, top right.', 'Too much motion? Switch it off with "Motion".'];
  btn.addEventListener('click', function () {
    jump();
    var sec = state.scene, lines = [];
    if (sec) { lines.push(lineFor(sec)); if (sec.dataset.daniLine2 && sec.dataset.daniSaid2) lines.push(sec.dataset.daniLine2); }
    lines = lines.concat(generic);
    var t = lines[state.tipIndex % lines.length]; state.tipIndex++;
    if (root.classList.contains('is-talking') && t === state.lastSaid) t = lines[state.tipIndex++ % lines.length];
    say(t);
  });

  /* ---------------- idle behaviour ---------------- */
  function poke() {
    clearTimeout(state.idleTimer);
    state.idleTimer = setTimeout(function () {
      if (document.hidden || reduce()) return;
      // look around, a little impatient
      var w = window.innerWidth;
      lookAt(w * 0.1, window.innerHeight * 0.4);
      setTimeout(function () { lookAt(w * 0.9, window.innerHeight * 0.4); }, 900);
      setTimeout(function () { jump(); }, 1800);
    }, 14000);
  }

  /* ---------------- wiring ---------------- */
  window.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') { lookAt(e.clientX, e.clientY); poke(); } }, { passive: true });
  window.addEventListener('pointerdown', function (e) { lookAt(e.clientX, e.clientY); poke(); }, { passive: true });
  window.addEventListener('scroll', poke, { passive: true });
  window.addEventListener('resize', function () { state.px = null; walkTo(state.x); });
  document.addEventListener('focusin', function (e) {
    var r = e.target.getBoundingClientRect && e.target.getBoundingClientRect();
    if (r && r.width) lookAt(r.left + r.width / 2, r.top + r.height / 2);
  });

  root.style.setProperty('--dx', clampX(state.x) + 'px');
  setTimeout(blink, 1500);
  poke();

  window.Dani = { scene: scene, say: say, hush: hush, mood: mood, pose: pose, jump: jump, shiver: shiver, lookAt: lookAt, react: react, walkTo: walkTo };
})();
