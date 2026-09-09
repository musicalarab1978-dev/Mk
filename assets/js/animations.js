/* ==========================================================================
   animations.js
   Every visual effect lives here: typewriter, count-up numbers, skill bars,
   scroll reveals, mouse parallax, card tilt, magnetic buttons, ripple,
   cursor glow, ambient particles, scroll progress, and scrollspy.

   Performance/accessibility: prefersReducedMotion() gates every purely
   decorative continuous effect (particles, parallax, cursor glow, tilt) so
   people who ask their OS for less motion — and lower-powered devices —
   don't pay for animations they didn't want.
   ========================================================================== */

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function hasFinePointer() {
  return window.matchMedia('(pointer: fine)').matches;
}

/* ---------- Typewriter ---------- */
let typingTimeout, typingIndex = 0, charIndex = 0, deleting = false;
function typeLoop() {
  const roles = siteData.hero.roles;
  if (!roles || roles.length === 0) return;
  const el = document.getElementById('typedRole');
  if (!el) return;
  const current = roles[typingIndex % roles.length];
  if (!deleting) {
    charIndex++;
    el.textContent = current.slice(0, charIndex);
    if (charIndex === current.length) { deleting = true; typingTimeout = setTimeout(typeLoop, 1400); return; }
  } else {
    charIndex--;
    el.textContent = current.slice(0, charIndex);
    if (charIndex === 0) { deleting = false; typingIndex++; }
  }
  typingTimeout = setTimeout(typeLoop, deleting ? 40 : 90);
}
function restartTyping() {
  clearTimeout(typingTimeout);
  typingIndex = 0; charIndex = 0; deleting = false;
  const el = document.getElementById('typedRole');
  if (el) el.textContent = '';
  typeLoop();
}

/* ---------- Count-up numbers ---------- */
let statsObserver;
function observeStats() {
  if (statsObserver) statsObserver.disconnect();
  statsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { animateCount(entry.target); statsObserver.unobserve(entry.target); }
    });
  }, { threshold: .5 });
  document.querySelectorAll('.stat-number').forEach((el) => statsObserver.observe(el));
}
function animateCount(el) {
  const target = parseInt(el.getAttribute('data-value'), 10) || 0;
  const suffix = el.getAttribute('data-suffix') || '';
  if (prefersReducedMotion()) { el.textContent = target + suffix; return; }
  const duration = 1400;
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(progress * target) + suffix;
    if (progress < 1) requestAnimationFrame(step); else el.textContent = target + suffix;
  }
  requestAnimationFrame(step);
}

/* ---------- Skill bars ---------- */
let skillsObserver;
function observeSkillBars() {
  if (skillsObserver) skillsObserver.disconnect();
  skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.getAttribute('data-level') + '%';
        skillsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .3 });
  document.querySelectorAll('.skill-fill').forEach((el) => skillsObserver.observe(el));
}

/* ---------- Scroll reveal (sections + staggered children) ---------- */
function initScrollReveal() {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .15, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal-up').forEach((el) => revealObserver.observe(el));

  document.querySelectorAll('[data-stagger]').forEach((group) => {
    Array.from(group.children).forEach((child, i) => { child.style.transitionDelay = (i * 90) + 'ms'; });
    revealObserver.observe(group);
  });
}

/* ---------- Mouse parallax on hero blobs ---------- */
function initParallax() {
  if (!hasFinePointer() || prefersReducedMotion()) return;
  const blobs = document.querySelectorAll('.blob');
  if (!blobs.length) return;
  let mx = 0, my = 0;
  window.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth - .5) * 2;
    my = (e.clientY / window.innerHeight - .5) * 2;
  });
  function loop() {
    blobs.forEach((blob, i) => {
      const strength = (i + 1) * 10;
      blob.style.setProperty('--px', (mx * strength).toFixed(1) + 'px');
      blob.style.setProperty('--py', (my * strength).toFixed(1) + 'px');
    });
    requestAnimationFrame(loop);
  }
  loop();
}

/* ---------- 3D tilt on project cards ---------- */
function initTilt(container) {
  if (!hasFinePointer() || prefersReducedMotion()) return;
  const scope = container || document;
  scope.querySelectorAll('.project-card').forEach((card) => {
    if (card.dataset.tiltBound) return;
    card.dataset.tiltBound = 'true';
    card.addEventListener('mouseenter', () => { card.style.transition = 'none'; });
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - .5;
      const py = (e.clientY - rect.top) / rect.height - .5;
      card.style.transform = `perspective(800px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = '';
      card.style.transform = '';
    });
  });
}

/* ---------- Magnetic pull on primary buttons ---------- */
function initMagneticButtons() {
  if (!hasFinePointer() || prefersReducedMotion()) return;
  document.querySelectorAll('.btn-primary').forEach((btn) => {
    if (btn.dataset.magnetBound) return;
    btn.dataset.magnetBound = 'true';
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${(x * .25).toFixed(1)}px, ${(y * .25).toFixed(1)}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ---------- Button ripple ---------- */
function initRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .filter-btn, .icon-btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const circle = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    circle.className = 'ripple';
    circle.style.width = circle.style.height = size + 'px';
    circle.style.left = (e.clientX - rect.left - size / 2) + 'px';
    circle.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 650);
  });
}

/* ---------- Cursor glow ---------- */
function initCursorGlow() {
  if (!hasFinePointer() || prefersReducedMotion()) return;
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;
  let mx = 0, my = 0, cx = 0, cy = 0;
  window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
  function loop() {
    cx += (mx - cx) * .1; cy += (my - cy) * .1;
    glow.style.transform = `translate(${(cx - 150).toFixed(1)}px, ${(cy - 150).toFixed(1)}px)`;
    requestAnimationFrame(loop);
  }
  loop();
}

/* ---------- Ambient particles (canvas) ---------- */
function initParticles() {
  if (prefersReducedMotion()) return;
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  const colors = ['10,132,255', '191,90,242', '255,55,95'];

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  function spawn() {
    const count = window.innerWidth < 700 ? 20 : 42;
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + .6,
      speed: Math.random() * .35 + .08,
      drift: Math.random() * .6 - .3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * .4 + .15
    }));
  }
  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.y -= p.speed;
      p.x += p.drift * .1;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); spawn(); }, 200);
  });
  resize(); spawn(); tick();
}

/* ---------- Scroll-linked chrome: progress bar, navbar state, back-to-top ----------
   One scroll listener, rAF-throttled, driving all three so scrolling never
   runs more than one update per frame. */
function initScrollEffects() {
  const bar = document.getElementById('scrollProgress');
  const nav = document.querySelector('.navbar');
  const backToTop = document.getElementById('backToTop');
  let ticking = false;
  function update() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const scrolled = max > 0 ? (h.scrollTop / max) * 100 : 0;
    if (bar) bar.style.width = scrolled + '%';
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
    if (backToTop) backToTop.classList.toggle('show', window.scrollY > 400);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  });
  update();
}

/* ---------- Scrollspy (active nav link) ---------- */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id));
      }
    });
  }, { threshold: .4, rootMargin: '-90px 0px -40% 0px' });
  sections.forEach((sec) => obs.observe(sec));
}

/* ---------- Confetti burst (admin unlock) ---------- */
function fireConfetti() {
  if (prefersReducedMotion()) return;
  const colors = ['#0a84ff', '#bf5af2', '#ff375f', '#30d158', '#ff9f0a'];
  for (let i = 0; i < 28; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.background = colors[i % colors.length];
    piece.style.left = '50%';
    piece.style.top = '30%';
    const angle = Math.random() * Math.PI * 2;
    const distance = 120 + Math.random() * 160;
    piece.style.setProperty('--tx', (Math.cos(angle) * distance).toFixed(1) + 'px');
    piece.style.setProperty('--ty', (Math.sin(angle) * distance).toFixed(1) + 'px');
    piece.style.setProperty('--r', (Math.random() * 720 - 360).toFixed(0) + 'deg');
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 1000);
  }
}
