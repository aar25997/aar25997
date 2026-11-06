(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Mobile navigation (keyboard + screen reader friendly) ----------
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  const label = toggle?.querySelector('.sr-only');
  const setNav = (open, { focusToggle = false } = {}) => {
    if (!nav || !toggle) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Close menu' : 'Menu';
    // Disclosure pattern: focus stays on the button; Tab moves into the menu.
    if (!open && focusToggle) toggle.focus();
  };
  toggle?.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
  nav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setNav(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') setNav(false, { focusToggle: true });
  });
  // Close the mobile menu if focus leaves it (e.g. tabbing past the last link)
  nav?.addEventListener('focusout', (e) => {
    if (toggle?.getAttribute('aria-expanded') === 'true' && !nav.contains(e.relatedTarget) && e.relatedTarget !== toggle) setNav(false);
  });

  // ---------- Header shadow on scroll ----------
  const header = document.querySelector('.site-header');
  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Subtle reveal-on-scroll ----------
  if (!reduce && 'IntersectionObserver' in window) {
    const els = document.querySelectorAll('.section .container > *, .feature-card, .pillars li, .standards li, .menu-category, .location-card, .event-card');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen: no flash
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  // ---------- Hero video: never autoplay for reduced motion; always pausable ----------
  const video = document.querySelector('[data-hero-video]');
  const vToggle = document.querySelector('[data-video-toggle]');
  if (video && vToggle) {
    const vLabel = vToggle.querySelector('.sr-only');
    const sync = () => {
      vToggle.setAttribute('aria-pressed', String(video.paused));
      vLabel.textContent = video.paused ? 'Play background video' : 'Pause background video';
    };
    if (!reduce) video.play().catch(() => {});
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    vToggle.addEventListener('click', () => (video.paused ? video.play() : video.pause()));
    sync();
  }

  // ---------- Menu: highlight the category in view ----------
  const tabs = document.querySelectorAll('.menu-tabs a');
  if (tabs.length && 'IntersectionObserver' in window) {
    const byId = new Map([...tabs].map((t) => [t.hash.slice(1), t]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        tabs.forEach((t) => { t.classList.remove('active'); t.removeAttribute('aria-current'); });
        const tab = byId.get(e.target.id);
        if (!tab) return;
        tab.classList.add('active');
        tab.setAttribute('aria-current', 'true');
        const bar = tab.parentElement;
        bar.scrollTo({ left: tab.offsetLeft - bar.clientWidth / 2 + tab.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    document.querySelectorAll('.menu-category').forEach((s) => spy.observe(s));
  }

  // ---------- Conversion tracking (GA4 when configured; dataLayer otherwise) ----------
  const track = (name, params = {}) => {
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
    else (window.dataLayer = window.dataLayer || []).push({ event: name, ...params });
  };
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-track]');
    if (el) track(el.dataset.track, { link_url: el.href || '', page_path: location.pathname });
  });

  // ---------- Forms: newsletter + contact ----------
  document.querySelectorAll('form[data-form]').forEach((form) => {
    const status = form.querySelector('.form-status');
    const kind = form.dataset.form;
    const say = (msg, cls = '') => { status.textContent = msg; status.className = 'form-status ' + cls; };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let firstBad = null;
      form.querySelectorAll('input:not([type=hidden]), textarea').forEach((f) => {
        const bad = !f.checkValidity();
        f.setAttribute('aria-invalid', String(bad));
        if (bad && !firstBad) firstBad = f;
      });
      if (firstBad) {
        firstBad.focus();
        return say(kind === 'newsletter' ? 'Please enter a valid email address.' : 'Please complete each field with a valid email address.', 'error');
      }
      if (!form.getAttribute('action')) {
        return say(kind === 'newsletter'
          ? 'Our email list launches soon. In the meantime, follow @nefrahouse on Instagram for opening news.'
          : 'Our contact form is not connected yet. Please reach out on Instagram @nefrahouse.', 'error');
      }
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      say('Sending…');
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        track(kind === 'newsletter' ? 'sign_up' : 'generate_lead', { form: kind });
        say(kind === 'newsletter' ? "Thank you. You're on the list." : "Thank you. We'll be in touch soon.", 'success');
      } catch {
        say('Something went wrong. Please try again in a moment.', 'error');
      } finally {
        btn.disabled = false;
      }
    });
  });
})();
