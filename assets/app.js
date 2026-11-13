(function () {
  'use strict';
  var d = document, root = d.documentElement;
  root.classList.add('js');

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* noop */ } }

  /* ---------- Tema claro/oscuro ---------- */
  var theme = safeGet('theme') ||
    (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    var m = d.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', t === 'dark' ? '#0f151d' : '#F5F7FA');
  }
  applyTheme(theme);
  d.getElementById('theme').addEventListener('click', function () {
    theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme); safeSet('theme', theme);
  });

  /* ---------- Idioma ES / EN ---------- */
  var nodes = d.querySelectorAll('[data-en]');
  nodes.forEach(function (n) { n.setAttribute('data-es', n.innerHTML); });
  var langBtn = d.getElementById('lang');
  var lang = safeGet('lang') || 'es';
  function applyLang(l) {
    nodes.forEach(function (n) { n.innerHTML = n.getAttribute(l === 'en' ? 'data-en' : 'data-es'); });
    root.lang = l;
    langBtn.textContent = l === 'en' ? 'ES' : 'EN';
    d.title = l === 'en'
      ? 'Felipe Contreras · Industrial Civil Engineer · Data Analysis'
      : 'Felipe Contreras · Ingeniero Civil Industrial · Análisis de Datos';
    updateToggleAll();
  }
  langBtn.addEventListener('click', function () {
    lang = lang === 'en' ? 'es' : 'en';
    applyLang(lang); safeSet('lang', lang);
  });

  /* ---------- Menú móvil ---------- */
  var burger = d.getElementById('burger'), menu = d.getElementById('menu');
  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  });

  /* ---------- Barra de progreso + enlace activo ---------- */
  var progress = d.getElementById('progress');
  function onScroll() {
    var h = root.scrollHeight - root.clientHeight;
    progress.style.width = (h > 0 ? (root.scrollTop / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var links = {};
  menu.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && links[en.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
          links[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = d.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Aparición al hacer scroll, contadores y barras ---------- */
  function countUp(el) {
    var target = +el.getAttribute('data-count'), t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / 1000, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function reveal(el) {
    el.classList.add('in');
    el.querySelectorAll('[data-count]').forEach(countUp);
    el.querySelectorAll('.bar').forEach(function (b) { b.firstElementChild.style.width = b.getAttribute('data-level') + '%'; });
  }
  var items = d.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { reveal(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.15 });
    items.forEach(function (i) { io.observe(i); });
  } else { items.forEach(reveal); }

  /* ---------- Expandir / contraer experiencia ---------- */
  var all = d.querySelectorAll('.timeline details'), toggleAll = d.getElementById('toggleAll');
  function allOpen() { return Array.prototype.every.call(all, function (x) { return x.open; }); }
  function updateToggleAll() {
    var es = allOpen() ? 'Contraer todo' : 'Expandir todo', en = allOpen() ? 'Collapse all' : 'Expand all';
    toggleAll.setAttribute('data-es', es); toggleAll.setAttribute('data-en', en);
    toggleAll.textContent = lang === 'en' ? en : es;
  }
  toggleAll.addEventListener('click', function () {
    var open = !allOpen();
    all.forEach(function (x) { x.open = open; });
    updateToggleAll();
  });
  all.forEach(function (x) { x.addEventListener('toggle', updateToggleAll); });

  /* ---------- Copiar email ---------- */
  var toast = d.getElementById('toast');
  d.getElementById('copy').addEventListener('click', function () {
    var email = 'felipe.contreras.loyola8@gmail.com';
    var ok = lang === 'en' ? 'Email copied ✓' : 'Email copiado ✓';
    function done() { toast.textContent = ok; setTimeout(function () { toast.textContent = ''; }, 2500); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(done, function () { toast.textContent = email; });
    } else { toast.textContent = email; }
  });

  d.getElementById('year').textContent = new Date().getFullYear();
  if (lang === 'en') applyLang('en'); else updateToggleAll();
})();
