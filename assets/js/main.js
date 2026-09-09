/* ==========================================================================
   main.js
   General page chrome (menu, theme toggle, filters, testimonial nav), the
   contact form, and the startup sequence that ties every other file
   together. This file loads last, after data.js / animations.js / render.js
   / admin.js.
   ========================================================================== */

document.addEventListener('click', function (e) {
  const filterBtn = e.target.closest('.filter-btn');
  if (filterBtn) {
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    filterBtn.classList.add('active');
    applyProjectFilter(filterBtn.getAttribute('data-filter'));
  }

  if (e.target.closest('#menuToggle')) document.getElementById('mobileMenu').classList.toggle('open');
  if (e.target.closest('.mobile-menu a')) document.getElementById('mobileMenu').classList.remove('open');

  if (e.target.closest('#themeToggle')) {
    siteData.theme.mode = siteData.theme.mode === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', siteData.theme.mode);
    document.querySelector('#themeToggle i').className = siteData.theme.mode === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  }

  if (e.target.closest('#backToTop')) window.scrollTo({ top: 0, behavior: 'smooth' });

  if (e.target.closest('#testiPrev')) {
    clearInterval(testiTimer);
    testiIndex = (testiIndex - 1 + siteData.testimonials.length) % siteData.testimonials.length;
    renderTestimonial(); startTestimonialAutoplay();
  }
  if (e.target.closest('#testiNext')) {
    clearInterval(testiTimer);
    testiIndex = (testiIndex + 1) % siteData.testimonials.length;
    renderTestimonial(); startTestimonialAutoplay();
  }
});

/* ---------- Contact form (real submit to api/contact.php) ---------- */
document.getElementById('contactForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = this;
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = 'Sending…';
  btn.disabled = true;
  const payload = {
    name: document.getElementById('cName').value,
    email: document.getElementById('cEmail').value,
    subject: document.getElementById('cSubject').value,
    message: document.getElementById('cMessage').value
  };
  try {
    const res = await fetch('api/contact.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    showToast(result.message || (result.success ? 'Message sent.' : 'Something went wrong.'));
    if (result.success) form.reset();
  } catch (err) {
    showToast('Could not reach the server. This form needs real PHP hosting to send email.');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
});

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4200);
}

/* ---------- Startup ---------- */
document.addEventListener('DOMContentLoaded', async function () {
  document.getElementById('year').textContent = new Date().getFullYear();
  await loadAdminConfig();
  await loadSiteData();
  renderAll();
  initScrollReveal();
  initParallax();
  initRipple();
  initCursorGlow();
  initParticles();
  initScrollEffects();
  initScrollSpy();
});

window.addEventListener('load', function () {
  const pre = document.getElementById('preloader');
  if (!pre) return;
  setTimeout(() => { pre.classList.add('hide'); setTimeout(() => pre.remove(), 500); }, 350);
});
