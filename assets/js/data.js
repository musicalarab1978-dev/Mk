/* ==========================================================================
   data.js
   Default content, live site state, and loading/saving against the PHP
   backend in /api. If this is opened without PHP (e.g. by double-clicking
   index.html on your own computer) the fetch calls below simply fail and
   the page falls back to the defaults written here.

   NOTE: "Alex Morgan" / the email / phone below are placeholders. Swap them
   for your real name, email, and photo either directly in this file (and in
   data/site-data.json) or live through the admin panel — see README.md.
   ========================================================================== */

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = (str === undefined || str === null) ? '' : String(str);
  return div.innerHTML;
}
function setNested(obj, path, value) {
  const keys = path.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) { cur = cur[keys[i]]; }
  cur[keys[keys.length - 1]] = value;
}

const defaultData = {
  theme: { accent: '#0a84ff', mode: 'dark' },
  hero: {
    availability: 'Available for new projects',
    greeting: "Hello, I'm",
    name: 'Alex Morgan',
    roles: ['Self-Taught Developer', 'Full-Stack Engineer', 'Mobile & Web Developer', 'Problem Solver'],
    subtitle: 'I build web apps, mobile apps, and the systems behind them — no bootcamp, no degree, just years of building things and figuring out why they broke.',
    socials: [
      { icon: 'fa-brands fa-github', link: '#' },
      { icon: 'fa-brands fa-linkedin-in', link: '#' },
      { icon: 'fa-brands fa-x-twitter', link: '#' },
      { icon: 'fa-brands fa-dribbble', link: '#' }
    ]
  },
  about: {
    text: "I'm a self-taught software engineer. Nobody handed me this — no courses, no formal training, no computer science degree. Everything here was learned by building real things, breaking them, and staying up too late figuring out why. It took longer than the traditional path, but it got me somewhere most people only dream about. Today I build web apps, mobile apps, and pretty much everything in between.",
    stats: [
      { label: 'Years of self-teaching', value: 5, suffix: '+' },
      { label: 'Projects shipped', value: 60, suffix: '+' },
      { label: 'Happy clients', value: 32, suffix: '' },
      { label: 'Courses taken', value: 0, suffix: '' }
    ]
  },
  skills: [
    { name: 'HTML & CSS', level: 96, icon: 'fa-brands fa-html5' },
    { name: 'JavaScript', level: 92, icon: 'fa-brands fa-js' },
    { name: 'React', level: 90, icon: 'fa-brands fa-react' },
    { name: 'Mobile Development', level: 84, icon: 'fa-solid fa-mobile-screen-button' },
    { name: 'Node.js', level: 78, icon: 'fa-brands fa-node-js' },
    { name: 'UI / UX Design', level: 85, icon: 'fa-solid fa-pen-nib' },
    { name: 'Figma', level: 88, icon: 'fa-brands fa-figma' }
  ],
  projects: [
    { title: 'Nova Finance App', category: 'mobile', description: 'A personal finance tracker with real-time insights and budgeting tools.', tags: ['React Native', 'Firebase'], c1: '#0a84ff', c2: '#bf5af2', link: '#' },
    { title: 'Orbit Dashboard', category: 'web', description: 'An analytics dashboard for small teams, built for speed on large datasets.', tags: ['React', 'D3.js'], c1: '#30d158', c2: '#0a84ff', link: '#' },
    { title: 'Lumen Branding', category: 'design', description: 'Brand identity and design system for a boutique lighting studio.', tags: ['Figma', 'Illustrator'], c1: '#ff9f0a', c2: '#ff375f', link: '#' },
    { title: 'Pulse Fitness', category: 'mobile', description: 'A workout companion app with adaptive training plans.', tags: ['Flutter', 'GraphQL'], c1: '#ff375f', c2: '#bf5af2', link: '#' },
    { title: 'Nimbus Storage', category: 'web', description: 'Drag-and-drop cloud storage with end-to-end encryption.', tags: ['Vue', 'Node.js'], c1: '#64d2ff', c2: '#0a84ff', link: '#' },
    { title: 'Aurora UI Kit', category: 'design', description: 'A design system and component kit for creative portfolios.', tags: ['Figma', 'Webflow'], c1: '#bf5af2', c2: '#ff375f', link: '#' }
  ],
  testimonials: [
    { text: 'Working with Alex was a pleasure — the attention to detail and speed of delivery exceeded expectations.', name: 'Sarah Chen', role: 'Product Manager, Nova' },
    { text: "One of the most reliable engineers I've worked with. Shipped ahead of schedule with almost no back-and-forth.", name: 'James Okafor', role: 'CEO, Orbit Labs' },
    { text: 'Our conversion rate improved by 40% after the redesign. Rare to find someone this strong in both code and design.', name: 'Mia Torres', role: 'Marketing Lead, Lumen' }
  ],
  contact: { email: 'hello@alexmorgan.dev', phone: '+1 (234) 567-890', location: 'Austin, TX' }
};

let siteData = JSON.parse(JSON.stringify(defaultData));
let ADMIN_CODE = '2708';
let REQUIRED_CLICKS = 5;

/** Loads data/config.json (admin code + click count). Safe to fail. */
async function loadAdminConfig() {
  try {
    const res = await fetch('data/config.json', { cache: 'no-store' });
    if (res.ok) {
      const cfg = await res.json();
      if (cfg.adminCode) ADMIN_CODE = String(cfg.adminCode);
      if (cfg.requiredClicks) REQUIRED_CLICKS = parseInt(cfg.requiredClicks, 10) || 5;
    }
  } catch (err) {
    console.warn('Using default admin settings (data/config.json not reachable yet).');
  }
}

/** Loads data/site-data.json. Falls back to defaultData if unreachable
 *  (for example when the file is opened directly instead of through a server). */
async function loadSiteData() {
  try {
    const res = await fetch('data/site-data.json', { cache: 'no-store' });
    if (res.ok) {
      const loaded = await res.json();
      if (loaded && typeof loaded === 'object') siteData = loaded;
    }
  } catch (err) {
    console.warn('Using built-in default content (data/site-data.json not reachable yet).');
  }
}

/** Sends the current siteData to api/save.php so it is written to
 *  data/site-data.json on the server and persists for every visitor. */
async function saveSiteDataToServer() {
  try {
    const res = await fetch('api/save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: ADMIN_CODE, data: siteData })
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Could not reach the server. Saving needs real PHP hosting, not a local double-click preview.' };
  }
}
