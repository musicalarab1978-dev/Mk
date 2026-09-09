/* ==========================================================================
   admin.js
   The hidden panel: unlock flow, tab content, live field editing, add/
   remove rows, and saving/exporting/importing the site's content.
   ========================================================================== */

/* ---------- Secret trigger ---------- */
let secretClicks = 0, secretTimer = null;
function triggerSecretClick() {
  secretClicks++;
  clearTimeout(secretTimer);
  secretTimer = setTimeout(() => { secretClicks = 0; }, 1500);
  if (secretClicks >= REQUIRED_CLICKS) {
    secretClicks = 0;
    setTimeout(openAdminLogin, 250);
  }
}
function openAdminLogin() {
  document.getElementById('secretModalOverlay').classList.add('show');
  document.getElementById('secretCodeInput').value = '';
  document.getElementById('codeError').textContent = '';
  document.getElementById('secretCodeInput').focus();
}
function closeAdminLogin() {
  document.getElementById('secretModalOverlay').classList.remove('show');
}
function checkCode() {
  const val = document.getElementById('secretCodeInput').value.trim();
  if (val === ADMIN_CODE) {
    closeAdminLogin();
    document.getElementById('adminOverlay').classList.add('show');
    renderAdminTab('hero');
    fireConfetti();
  } else {
    document.getElementById('codeError').textContent = 'Incorrect code. Try again.';
    const box = document.getElementById('secretModalBox');
    box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
    document.getElementById('secretCodeInput').value = '';
  }
}

/* ---------- Tabs ---------- */
function renderAdminTab(tab) {
  const el = document.getElementById('adminContent');
  el.style.opacity = 0;
  setTimeout(() => {
    if (tab === 'hero') el.innerHTML = adminHeroHTML();
    else if (tab === 'about') el.innerHTML = adminAboutHTML();
    else if (tab === 'skills') el.innerHTML = adminSkillsHTML();
    else if (tab === 'projects') el.innerHTML = adminProjectsHTML();
    else if (tab === 'contact') el.innerHTML = adminContactHTML();
    else if (tab === 'theme') el.innerHTML = adminThemeHTML();
    else if (tab === 'data') el.innerHTML = adminDataHTML();
    el.style.opacity = 1;
  }, 120);
}

/* ---------- Tab markup ---------- */
function adminHeroHTML() {
  return `
    <div class="admin-field"><label>Availability line</label><input type="text" data-bind="hero.availability" value="${escapeHTML(siteData.hero.availability)}"></div>
    <div class="admin-field"><label>Greeting</label><input type="text" data-bind="hero.greeting" value="${escapeHTML(siteData.hero.greeting)}"></div>
    <div class="admin-field"><label>Full name</label><input type="text" data-bind="hero.name" value="${escapeHTML(siteData.hero.name)}"></div>
    <div class="admin-field"><label>Rotating roles (one per line)</label><textarea id="rolesInput" rows="4">${escapeHTML(siteData.hero.roles.join('\n'))}</textarea></div>
    <div class="admin-field"><label>Subtitle</label><textarea data-bind="hero.subtitle" rows="3">${escapeHTML(siteData.hero.subtitle)}</textarea></div>
  `;
}
function adminAboutHTML() {
  const rows = siteData.about.stats.map((s, i) => `
    <div class="admin-list-item" data-stat-index="${i}">
      <input type="text" data-stat-field="label" value="${escapeHTML(s.label)}" placeholder="Label">
      <input type="number" data-stat-field="value" value="${s.value}" placeholder="Value" style="max-width:90px;">
      <input type="text" data-stat-field="suffix" value="${escapeHTML(s.suffix || '')}" placeholder="Suffix" style="max-width:70px;">
      <button class="icon-btn remove-stat-btn" aria-label="Remove stat"><i class="fa-solid fa-trash"></i></button>
    </div>`).join('');
  return `
    <div class="admin-field"><label>About text</label><textarea data-bind="about.text" rows="5">${escapeHTML(siteData.about.text)}</textarea></div>
    <div class="admin-field"><label>Stats</label>${rows}
      <button class="btn full-width add-stat-btn" style="margin-top:4px;"><i class="fa-solid fa-plus"></i> Add stat</button>
    </div>`;
}
function adminSkillsHTML() {
  const rows = siteData.skills.map((sk, i) => `
    <div class="admin-list-item" data-skill-index="${i}">
      <input type="text" data-skill-field="name" value="${escapeHTML(sk.name)}" placeholder="Skill name">
      <input type="text" data-skill-field="icon" value="${escapeHTML(sk.icon)}" placeholder="fa-brands fa-...">
      <input type="range" min="0" max="100" data-skill-field="level" value="${sk.level}">
      <span class="range-value">${sk.level}%</span>
      <button class="icon-btn remove-skill-btn" aria-label="Remove skill"><i class="fa-solid fa-trash"></i></button>
    </div>`).join('');
  return `${rows}<button class="btn btn-primary full-width add-skill-btn"><i class="fa-solid fa-plus"></i> Add skill</button>
    <p class="admin-hint">Icon classes come from Font Awesome, e.g. <code>fa-brands fa-python</code>.</p>`;
}
function adminProjectsHTML() {
  const rows = siteData.projects.map((p, i) => `
    <div class="admin-list-item" data-project-index="${i}">
      <input type="text" data-project-field="title" value="${escapeHTML(p.title)}" placeholder="Title">
      <select data-project-field="category">
        <option value="web" ${p.category === 'web' ? 'selected' : ''}>Web</option>
        <option value="mobile" ${p.category === 'mobile' ? 'selected' : ''}>Mobile</option>
        <option value="design" ${p.category === 'design' ? 'selected' : ''}>Design</option>
      </select>
      <textarea data-project-field="description" placeholder="Description">${escapeHTML(p.description)}</textarea>
      <input type="text" data-project-field="tags" value="${escapeHTML(p.tags.join(', '))}" placeholder="Tags, comma separated">
      <div class="color-row">
        <input type="color" data-project-field="c1" value="${p.c1}">
        <input type="color" data-project-field="c2" value="${p.c2}">
      </div>
      <button class="icon-btn remove-project-btn" aria-label="Remove project"><i class="fa-solid fa-trash"></i></button>
    </div>`).join('');
  return `${rows}<button class="btn btn-primary full-width add-project-btn"><i class="fa-solid fa-plus"></i> Add project</button>
    <p class="admin-hint">The first project in the list gets the larger "Featured" treatment.</p>`;
}
function adminContactHTML() {
  return `
    <div class="admin-field"><label>Email</label><input type="email" data-bind="contact.email" value="${escapeHTML(siteData.contact.email)}"></div>
    <div class="admin-field"><label>Phone</label><input type="text" data-bind="contact.phone" value="${escapeHTML(siteData.contact.phone)}"></div>
    <div class="admin-field"><label>Location</label><input type="text" data-bind="contact.location" value="${escapeHTML(siteData.contact.location)}"></div>
    <p class="admin-hint">The contact form on the live site sends messages to this email address once the project is hosted with PHP.</p>
  `;
}
function adminThemeHTML() {
  return `
    <div class="admin-field"><label>Accent color</label><input type="color" data-bind="theme.accent" value="${siteData.theme.accent}" style="width:60px;height:38px;padding:2px;"></div>
    <div class="admin-field"><label>Mode</label>
      <div class="admin-toggle-row">
        <button class="btn ${siteData.theme.mode === 'dark' ? 'btn-primary' : ''}" id="setDarkMode">Dark</button>
        <button class="btn ${siteData.theme.mode === 'light' ? 'btn-primary' : ''}" id="setLightMode">Light</button>
      </div>
    </div>`;
}
function adminDataHTML() {
  return `
    <p class="admin-note">Saving writes to <code>data/site-data.json</code> on the server, so it is visible to every visitor, not just this browser. This only works once the project is uploaded to hosting with PHP.</p>
    <button class="btn btn-primary full-width" id="saveToServerBtn"><i class="fa-solid fa-cloud-arrow-up"></i> Save to server</button>
    <p class="admin-hint" id="saveStatus"></p>
    <div class="admin-field" style="margin-top:20px;"><label>Export as JSON (local backup)</label>
      <button class="btn full-width" id="exportDataBtn"><i class="fa-solid fa-download"></i> Download JSON</button>
    </div>
    <div class="admin-field"><label>Import JSON file</label><input type="file" id="importDataInput" accept="application/json"></div>
    <button class="btn full-width" id="resetDataBtn" style="margin-top:10px; border-color:var(--ios-pink); color:var(--ios-pink);"><i class="fa-solid fa-rotate-left"></i> Reset to default content</button>
  `;
}

/* ---------- Field editing (delegated) ---------- */
function handleFieldEdit(e) {
  const bindPath = e.target.getAttribute && e.target.getAttribute('data-bind');
  if (bindPath) {
    setNested(siteData, bindPath, e.target.value);
    if (bindPath === 'theme.accent') applyThemeColor(e.target.value);
    else if (bindPath.startsWith('contact.')) renderContactInfo();
    else renderAll();
    return;
  }
  if (e.target.id === 'rolesInput') {
    siteData.hero.roles = e.target.value.split('\n').map((r) => r.trim()).filter(Boolean);
    restartTyping();
    return;
  }
  if (e.target.matches('[data-stat-field]')) {
    const idx = parseInt(e.target.closest('[data-stat-index]').getAttribute('data-stat-index'), 10);
    const field = e.target.getAttribute('data-stat-field');
    siteData.about.stats[idx][field] = field === 'value' ? (parseInt(e.target.value, 10) || 0) : e.target.value;
    renderAbout();
    return;
  }
  if (e.target.matches('[data-skill-field]')) {
    const idx = parseInt(e.target.closest('[data-skill-index]').getAttribute('data-skill-index'), 10);
    const field = e.target.getAttribute('data-skill-field');
    siteData.skills[idx][field] = field === 'level' ? (parseInt(e.target.value, 10) || 0) : e.target.value;
    if (field === 'level') {
      const row = e.target.closest('.admin-list-item');
      const rv = row.querySelector('.range-value');
      if (rv) rv.textContent = e.target.value + '%';
    }
    renderSkills();
    return;
  }
  if (e.target.matches('[data-project-field]')) {
    const idx = parseInt(e.target.closest('[data-project-index]').getAttribute('data-project-index'), 10);
    const field = e.target.getAttribute('data-project-field');
    if (field === 'tags') siteData.projects[idx].tags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
    else siteData.projects[idx][field] = e.target.value;
    renderProjects();
    return;
  }
}
document.addEventListener('input', handleFieldEdit);
document.addEventListener('change', handleFieldEdit);

/* ---------- Admin click delegation ---------- */
document.addEventListener('click', function (e) {
  if (e.target.closest('#logo')) triggerSecretClick();

  if (e.target.closest('#closeSecretModal') || e.target.id === 'secretModalOverlay') closeAdminLogin();
  if (e.target.closest('#submitCode')) checkCode();

  if (e.target.closest('#closeAdminPanel') || e.target.id === 'adminOverlay') document.getElementById('adminOverlay').classList.remove('show');

  const tabBtn = e.target.closest('.admin-tab');
  if (tabBtn) {
    document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('active'));
    tabBtn.classList.add('active');
    renderAdminTab(tabBtn.getAttribute('data-tab'));
  }

  if (e.target.closest('#setDarkMode')) { siteData.theme.mode = 'dark'; renderAll(); renderAdminTab('theme'); }
  if (e.target.closest('#setLightMode')) { siteData.theme.mode = 'light'; renderAll(); renderAdminTab('theme'); }

  if (e.target.closest('.add-stat-btn')) { siteData.about.stats.push({ label: 'New stat', value: 0, suffix: '' }); renderAdminTab('about'); renderAbout(); }
  if (e.target.closest('.remove-stat-btn')) {
    const idx = parseInt(e.target.closest('[data-stat-index]').getAttribute('data-stat-index'), 10);
    siteData.about.stats.splice(idx, 1); renderAdminTab('about'); renderAbout();
  }
  if (e.target.closest('.add-skill-btn')) { siteData.skills.push({ name: 'New skill', level: 50, icon: 'fa-solid fa-star' }); renderAdminTab('skills'); renderSkills(); }
  if (e.target.closest('.remove-skill-btn')) {
    const idx = parseInt(e.target.closest('[data-skill-index]').getAttribute('data-skill-index'), 10);
    siteData.skills.splice(idx, 1); renderAdminTab('skills'); renderSkills();
  }
  if (e.target.closest('.add-project-btn')) { siteData.projects.push({ title: 'New project', category: 'web', description: '', tags: [], c1: '#0a84ff', c2: '#bf5af2', link: '#' }); renderAdminTab('projects'); renderProjects(); }
  if (e.target.closest('.remove-project-btn')) {
    const idx = parseInt(e.target.closest('[data-project-index]').getAttribute('data-project-index'), 10);
    siteData.projects.splice(idx, 1); renderAdminTab('projects'); renderProjects();
  }

  if (e.target.closest('#exportDataBtn')) {
    const blob = new Blob([JSON.stringify(siteData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'portfolio-data.json'; a.click();
    URL.revokeObjectURL(url);
  }
  if (e.target.closest('#resetDataBtn')) {
    if (confirm('Reset all content to the default demo content? This cannot be undone.')) {
      siteData = JSON.parse(JSON.stringify(defaultData));
      renderAll(); renderAdminTab('data');
    }
  }
  if (e.target.closest('#saveToServerBtn')) {
    const btn = document.getElementById('saveToServerBtn');
    const status = document.getElementById('saveStatus');
    btn.disabled = true;
    status.textContent = 'Saving…';
    status.style.color = '';
    saveSiteDataToServer().then((result) => {
      btn.disabled = false;
      status.textContent = result.message || (result.success ? 'Saved.' : 'Could not save.');
      status.style.color = result.success ? 'var(--ios-green)' : 'var(--ios-pink)';
    });
  }
});

document.addEventListener('change', function (e) {
  if (e.target.id === 'importDataInput') {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        siteData = JSON.parse(ev.target.result);
        renderAll();
        alert('Content imported. Remember to press "Save to server" to make it permanent.');
      } catch (err) {
        alert('That file is not valid JSON.');
      }
    };
    reader.readAsText(file);
  }
});

document.getElementById('secretCodeInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') checkCode();
});
document.getElementById('logo').addEventListener('keydown', function (e) {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerSecretClick(); }
});
