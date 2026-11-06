(() => {
  // Mobile navigation
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  const setNav = (open) => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle?.addEventListener('click', () => setNav(!nav.classList.contains('open')));
  nav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setNav(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

  // Header shadow on scroll
  const header = document.querySelector('.site-header');
  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Reveal-on-scroll
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    const els = document.querySelectorAll('.section .container > *, .feature-card, .pillars li, .standards li, .menu-category, .location-card');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) return; // already visible: no flash
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  // Menu: highlight the category tab in view and keep it scrolled into the tab bar
  const tabs = document.querySelectorAll('.menu-tabs a');
  if (tabs.length && 'IntersectionObserver' in window) {
    const byId = new Map([...tabs].map((t) => [t.hash.slice(1), t]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        tabs.forEach((t) => t.classList.remove('active'));
        const tab = byId.get(e.target.id);
        if (tab) {
          tab.classList.add('active');
          const bar = tab.parentElement;
          bar.scrollTo({ left: tab.offsetLeft - bar.clientWidth / 2 + tab.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
        }
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    document.querySelectorAll('.menu-category').forEach((s) => spy.observe(s));
  }

  // Forms: newsletter + contact. Submit to the configured endpoint, or explain they aren't live yet.
  document.querySelectorAll('form[data-form]').forEach((form) => {
    const status = form.querySelector('.form-status');
    const say = (msg, kind) => { status.textContent = msg; status.className = 'form-status ' + (kind || ''); };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('input, textarea').forEach((f) => {
        const bad = !f.checkValidity();
        f.setAttribute('aria-invalid', String(bad));
        if (bad) ok = false;
      });
      if (!ok) return say(form.dataset.form === 'newsletter' ? 'Please enter a valid email address.' : 'Please complete each field with a valid email address.', 'error');

      if (!form.getAttribute('action')) {
        return say(form.dataset.form === 'newsletter'
          ? 'Our email list launches soon. In the meantime, follow @nefrahouse on Instagram for opening news.'
          : 'Our contact form is not connected yet. Please reach out on Instagram @nefrahouse.', 'error');
      }
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      say('Sending…');
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        say(form.dataset.form === 'newsletter' ? "Thank you. You're on the list." : "Thank you. We'll be in touch soon.", 'success');
      } catch {
        say('Something went wrong. Please try again in a moment.', 'error');
      } finally {
        btn.disabled = false;
      }
    });
  });
})();
