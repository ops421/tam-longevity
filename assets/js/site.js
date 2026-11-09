// TAM Longevity | small progressive enhancements. The site works without this file.
(function () {
  var doc = document.documentElement;
  var body = document.body;

  // Mobile menu
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  function setMenu(open) {
    body.classList.toggle('nav-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { setMenu(!body.classList.contains('nav-open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); closeDrop(); } });
  }

  // Treatments dropdown
  var dropBtn = document.querySelector('.nav-drop');
  var drop = document.getElementById('drop-treatments');
  function closeDrop() { if (!dropBtn) return; drop.classList.remove('open'); dropBtn.setAttribute('aria-expanded', 'false'); }
  if (dropBtn) {
    dropBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !drop.classList.contains('open');
      drop.classList.toggle('open', open);
      dropBtn.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.nav-group')) closeDrop(); });
  }

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // ISI tray: expandable, hidden while the full ISI section or footer is on screen
  var tray = document.getElementById('isi-tray');
  if (tray) {
    var tBtn = tray.querySelector('.isi-tray-toggle');
    var tBody = document.getElementById('isi-tray-body');
    tBtn.addEventListener('click', function () {
      var open = tBtn.getAttribute('aria-expanded') !== 'true';
      tBtn.setAttribute('aria-expanded', open);
      tBody.hidden = !open;
    });
    var targets = [document.getElementById('isi'), document.querySelector('.site-footer')];
    var visible = new Set();
    if ('IntersectionObserver' in window) {
      var tio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { en.isIntersecting ? visible.add(en.target) : visible.delete(en.target); });
        var hide = visible.size > 0;
        tray.classList.toggle('hide', hide);
        if (hide) { tBtn.setAttribute('aria-expanded', 'false'); tBody.hidden = true; }
      }, { threshold: 0 });
      targets.forEach(function (t) { if (t) tio.observe(t); });
    }
  }

  // Sticky CTA (home, mobile): show after the hero, hide over the closing banner and footer
  var bar = document.getElementById('sticky-cta');
  if (bar && 'IntersectionObserver' in window) {
    var hero = document.querySelector('.prod-cards');
    var ends = [document.querySelector('.cta-band'), document.querySelector('.site-footer')];
    var pastHero = false, atEnd = new Set();
    function update() {
      var show = pastHero && atEnd.size === 0;
      bar.classList.toggle('show', show);
      bar.setAttribute('aria-hidden', !show);
      bar.querySelector('a').tabIndex = show ? 0 : -1;
    }
    new IntersectionObserver(function (en) {
      pastHero = !en[0].isIntersecting && en[0].boundingClientRect.top < 0; update();
    }).observe(hero);
    var eio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.isIntersecting ? atEnd.add(en.target) : atEnd.delete(en.target); });
      update();
    });
    ends.forEach(function (t) { if (t) eio.observe(t); });
  }
})();
