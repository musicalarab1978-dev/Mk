/* ==========================================================================
   render.js
   Turns siteData into DOM. Every function rebuilds one part of the page;
   renderAll() rebuilds everything (used on load and after an admin
   import/reset).
   ========================================================================== */

function renderHero() {
  document.getElementById('heroAvailability').textContent = siteData.hero.availability;
  document.getElementById('heroGreeting').textContent = siteData.hero.greeting;
  document.getElementById('heroName').textContent = siteData.hero.name;
  document.getElementById('heroSubtitle').textContent = siteData.hero.subtitle;
  const socialsHTML = siteData.hero.socials.map((s) =>
    `<a href="${escapeHTML(s.link)}" target="_blank" rel="noopener"><i class="${escapeHTML(s.icon)}"></i></a>`
  ).join('');
  document.getElementById('heroSocials').innerHTML = socialsHTML;
  document.getElementById('footerSocials').innerHTML = socialsHTML;
  document.getElementById('footerName').textContent = siteData.hero.name;
  restartTyping();
}

function renderAbout() {
  document.getElementById('aboutText').textContent = siteData.about.text;
  const initials = siteData.hero.name.split(' ').map((n) => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
  document.getElementById('avatarInitials').textContent = initials;
  document.getElementById('statsRow').innerHTML = siteData.about.stats.map((s) => `
    <div>
      <div class="stat-number" data-value="${s.value}" data-suffix="${escapeHTML(s.suffix || '')}">0</div>
      <div class="stat-label">${escapeHTML(s.label)}</div>
    </div>`).join('');
  observeStats();
}

function renderSkills() {
  const palette = ['var(--ios-blue)', 'var(--ios-violet)', 'var(--ios-pink)'];
  document.getElementById('skillsList').innerHTML = siteData.skills.map((sk, i) => `
    <div class="skill-row">
      <span class="skill-badge" style="background:${palette[i % 3]}"><i class="${escapeHTML(sk.icon)}"></i></span>
      <span class="skill-name">${escapeHTML(sk.name)}</span>
      <span class="skill-track"><span class="skill-fill" data-level="${sk.level}"></span></span>
      <span class="skill-percent">${sk.level}%</span>
    </div>`).join('');
  observeSkillBars();
}

function renderProjects() {
  document.getElementById('projectsGrid').innerHTML = siteData.projects.map((p, i) => `
    <div class="project-card glass ${i === 0 ? 'featured' : ''}" data-category="${escapeHTML(p.category)}">
      <div class="project-image" style="background:linear-gradient(135deg, ${p.c1}, ${p.c2});">
        ${i === 0 ? '<span class="featured-badge">Featured</span>' : ''}
        <i class="fa-solid fa-arrow-up-right-from-square"></i>
      </div>
      <div class="project-info">
        <span class="project-category">${escapeHTML(p.category)}</span>
        <h3>${escapeHTML(p.title)}</h3>
        <p>${escapeHTML(p.description)}</p>
        <div class="project-tags">${p.tags.map((t) => `<span>${escapeHTML(t)}</span>`).join('')}</div>
      </div>
    </div>`).join('');
  const activeFilter = document.querySelector('.filter-btn.active');
  applyProjectFilter(activeFilter ? activeFilter.getAttribute('data-filter') : 'all');
  initTilt(document.getElementById('projectsGrid'));
}
function applyProjectFilter(filter) {
  document.querySelectorAll('.project-card').forEach((card) => {
    const match = filter === 'all' || card.getAttribute('data-category') === filter;
    card.style.display = match ? '' : 'none';
  });
}

let testiIndex = 0, testiTimer = null;
function renderTestimonial() {
  const t = siteData.testimonials[testiIndex];
  if (!t) return;
  const quoteEl = document.getElementById('testimonialQuote');
  const apply = () => {
    quoteEl.textContent = t.text;
    document.getElementById('testimonialName').textContent = t.name;
    document.getElementById('testimonialRole').textContent = t.role;
    document.getElementById('testimonialAvatar').textContent = t.name.split(' ').map((n) => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
    quoteEl.style.opacity = 1;
  };
  if (prefersReducedMotion()) { apply(); }
  else {
    quoteEl.style.opacity = 0;
    setTimeout(apply, 200);
  }
  document.getElementById('testimonialDots').innerHTML = siteData.testimonials.map((_, i) =>
    `<span class="testi-dot ${i === testiIndex ? 'active' : ''}"></span>`).join('');
}
function startTestimonialAutoplay() {
  clearInterval(testiTimer);
  if (siteData.testimonials.length < 2) return;
  testiTimer = setInterval(() => {
    testiIndex = (testiIndex + 1) % siteData.testimonials.length;
    renderTestimonial();
  }, 6000);
}

function renderContactInfo() {
  document.getElementById('contactInfo').innerHTML = `
    <h3>Let's build something</h3>
    <p style="margin-top:6px;">Currently open to freelance work and full-time roles. Email is the fastest way to reach me.</p>
    <div class="contact-item"><i class="fa-solid fa-envelope"></i><span>${escapeHTML(siteData.contact.email)}</span></div>
    <div class="contact-item"><i class="fa-solid fa-phone"></i><span>${escapeHTML(siteData.contact.phone)}</span></div>
    <div class="contact-item"><i class="fa-solid fa-location-dot"></i><span>${escapeHTML(siteData.contact.location)}</span></div>
    <div class="contact-socials">${siteData.hero.socials.map((s) => `<a href="${escapeHTML(s.link)}" target="_blank" rel="noopener"><i class="${escapeHTML(s.icon)}"></i></a>`).join('')}</div>
  `;
}

function applyThemeColor(hex) {
  document.documentElement.style.setProperty('--ios-blue', hex);
}

function renderAll() {
  renderHero(); renderAbout(); renderSkills(); renderProjects();
  renderTestimonial(); startTestimonialAutoplay(); renderContactInfo();
  applyThemeColor(siteData.theme.accent);
  document.documentElement.setAttribute('data-theme', siteData.theme.mode);
  const icon = document.querySelector('#themeToggle i');
  if (icon) icon.className = siteData.theme.mode === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  initMagneticButtons();
}
