// Mobile navigation
const toggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('nav-menu');
toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Reveal sections on scroll
const targets = document.querySelectorAll('.section .container > *, .card, .steps li');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  targets.forEach(t => { t.classList.add('reveal'); io.observe(t); });
}

// Contact form: opens the visitor's email app with the message pre-filled.
// TODO: set the real address, or replace with a form service endpoint.
const CONTACT_EMAIL = 'hello@example.com';
const form = document.getElementById('contact-form');
const status = form.querySelector('.form-status');
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.checkValidity()) {
    status.textContent = 'Please fill in your name, a valid email and a message.';
    return;
  }
  const d = new FormData(form);
  const subject = encodeURIComponent(`Message from ${d.get('name')}`);
  const body = encodeURIComponent(`${d.get('message')}\n\n— ${d.get('name')} (${d.get('email')})`);
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  status.textContent = 'Opening your email app…';
});
