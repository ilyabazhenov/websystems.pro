(function () {
  var root = document.documentElement;

  // дуга дня в первом экране
  var d = '';
  for (var x = 0; x <= 1000; x += 20) {
    var y = 100 - 12 - 76 * Math.sin(Math.PI * x / 1000);
    d += (x ? ' L ' : 'M ') + x + ' ' + y.toFixed(2);
  }
  document.getElementById('arcPath').setAttribute('d', d);

  // звёзды
  var stars = document.querySelector('.stars'), sh = [];
  var W = Math.max(innerWidth, 1400), H = Math.max(innerHeight, 900);
  for (var i = 0; i < 170; i++) {
    var big = Math.random() < 0.08;
    sh.push((Math.random() * W).toFixed(0) + 'px ' + (Math.random() * H).toFixed(0) + 'px 0 ' + (big ? '1px' : '0') +
      ' rgba(255,255,255,' + (0.25 + Math.random() * 0.6).toFixed(2) + ')');
  }
  stars.style.boxShadow = sh.join(',');

  // волна VoiceGrep
  var wave = document.getElementById('wave'), html = '';
  for (var j = 0; j < 64; j++) {
    var h = 18 + Math.abs(Math.sin(j * 0.55) * Math.cos(j * 0.17)) * 70 + Math.random() * 12;
    html += '<i' + (j > 22 && j < 34 ? ' class="me"' : '') + ' style="--h:' + h.toFixed(0) + '"></i>';
  }
  wave.innerHTML = html;

  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  // небо, чернила и часы по прокрутке
  var hex = function (s) { s = s.trim(); return [1, 3, 5].map(function (k) { return parseInt(s.slice(k, k + 2), 16); }); };
  var toMin = function (t) { var p = t.split(':'); return +p[0] * 60 + +p[1]; };
  var sky = function (v) { var c = v.split(','); return { top: hex(c[0]), bot: hex(c[1]) }; };
  var secs = Array.prototype.map.call(document.querySelectorAll('[data-time]'), function (el) {
    return {
      el: el, min: toMin(el.dataset.time), ink: el.dataset.ink, stars: +(el.dataset.stars || 0), phase: el.dataset.phase,
      light: sky(el.dataset.sky), dark: sky(el.dataset.skyDark || el.dataset.sky)
    };
  });
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var mix = function (a, b, t) { return a.map(function (v, k) { return Math.round(lerp(v, b[k], t)); }).join(', '); };
  var clockTime = document.getElementById('clockTime'), clockPhase = document.getElementById('clockPhase'), clockIcon = document.getElementById('clockIcon');
  var SUN = '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
  var MOON = '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>';
  var lastIcon = '';

  function frame() {
    var mid = innerHeight * 0.5, Z = innerHeight * 0.35, n = secs.length;
    var rects = secs.map(function (x) { return x.el.getBoundingClientRect(); });
    var i = 0;
    while (i < n - 1 && rects[i].bottom <= mid) i++;
    // внутри главы цвет держится; меняется только на стыке соседних глав
    var a = i, b = i, t = 0;
    if (i < n - 1 && mid > rects[i].bottom - Z) { b = i + 1; t = (mid - (rects[i].bottom - Z)) / (2 * Z); }
    else if (i > 0 && mid < rects[i].top + Z) { a = i - 1; t = 0.5 + (mid - rects[i].top) / (2 * Z); }
    t = Math.min(1, Math.max(0, t));
    var s = t * t * (3 - 2 * t), A = secs[a], B = secs[b];
    var dark = root.dataset.theme === 'dark', SA = dark ? A.dark : A.light, SB = dark ? B.dark : B.light;
    root.style.setProperty('--sky-top', mix(SA.top, SB.top, s));
    root.style.setProperty('--sky-bot', mix(SA.bot, SB.bot, s));
    root.style.setProperty('--stars', lerp(A.stars, B.stars, s).toFixed(2));
    // в тёмной теме все главы тёмные, чернила всегда светлые
    var ink = dark ? 'light' : s < 0.5 ? A.ink : B.ink;
    if (root.dataset.ink !== ink) root.dataset.ink = ink;
    var mins = Math.round(lerp(A.min, B.min, t));
    clockTime.textContent = pad(Math.floor(mins / 60)) + ':' + pad(mins % 60);
    clockPhase.textContent = s < 0.5 ? A.phase : B.phase;
    var icon = (mins >= 19 * 60 + 15 || mins < 7 * 60 + 50) ? MOON : SUN;
    if (icon !== lastIcon) { clockIcon.innerHTML = icon; lastIcon = icon; }
  }
  var ticking = false;
  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { frame(); ticking = false; }); }
  }, { passive: true });
  addEventListener('resize', frame);
  frame();

  // тема: сама выбирается в <head>, кнопка в шапке переключает её вручную;
  // если ручной выбор совпал с автоматическим, он забывается и тема снова следует за системой и часами
  var themeBtn = document.getElementById('themeBtn'), osDark = matchMedia('(prefers-color-scheme: dark)');
  var autoTheme = function () { var h = new Date().getHours(); return osDark.matches || h >= 20 || h < 7 ? 'dark' : 'light'; };
  var saved = function () { try { return localStorage.getItem('theme'); } catch (e) { return null; } };
  function setTheme(th) {
    if (root.dataset.theme !== th) { root.dataset.theme = th; frame(); }
    themeBtn.setAttribute('aria-pressed', th === 'dark');
  }
  themeBtn.addEventListener('click', function () {
    var th = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { if (th === autoTheme()) localStorage.removeItem('theme'); else localStorage.setItem('theme', th); } catch (e) {}
    setTheme(th);
  });
  var follow = function () { if (!saved()) setTheme(autoTheme()); };
  if (osDark.addEventListener) osDark.addEventListener('change', follow);
  document.addEventListener('visibilitychange', follow);
  setTheme(root.dataset.theme);

  // появление глав
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.18 });
  document.querySelectorAll('section').forEach(function (s) { io.observe(s); });
})();
