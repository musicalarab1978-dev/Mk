# Alex Morgan — Portfolio

A one-page developer portfolio with a liquid-glass (iOS-style) design, a
hidden admin panel for editing content live, and a small PHP backend so
admin edits and contact-form messages actually work once this is hosted.

## Folder structure

```
index.html                  the whole page (structure only — content is loaded from data/)
assets/
  css/
    variables.css           colors, spacing, blur strength (dark + light theme)
    base.css                reset, typography, buttons, .glass material
    components.css          navbar, forms, project cards, skill rows, testimonial panel
    sections.css            hero/about/skills/projects/contact layout & grids
    animations.css          every keyframe + reveal/parallax/particle styling
    admin.css               the secret login modal + admin panel
  js/
    data.js                 default content + loads/saves data/site-data.json
    animations.js           typewriter, counters, parallax, tilt, particles, etc.
    render.js                turns siteData into HTML for every section
    admin.js                admin panel: unlock, tabs, editing, save/export/import
    main.js                 menu/theme/contact-form wiring + startup sequence
data/
  config.json                the admin access code + how many clicks unlock it
  site-data.json              all editable site content — this is what admin edits overwrite
api/
  save.php                    writes admin edits into data/site-data.json
  contact.php                  emails the contact form to your address
.htaccess                     turns off directory listing
```

## Before you upload: personalize it

Everything in `data/site-data.json` is a placeholder. Change your name,
photo-related initials, bio, skills, real projects, and contact details
either by editing that file directly, or live through the admin panel (see
below) after it's hosted. The current "About" text and stats reflect a
self-taught-developer story as a starting point — edit it to match your own
words and numbers.

## Running it locally (quick look only)

You can double-click `index.html` to preview the design, but two things
won't work without a real server: **saving admin edits** and **the contact
form**, because both need PHP. For a full local test, run PHP's built-in
server from the project folder:

```
php -S localhost:8000
```

then open `http://localhost:8000`.

## Deploying to real hosting

1. Upload the **entire folder** (all files, keeping the folder structure)
   to your host — via FTP, or your host's File Manager.
2. Make sure your hosting plan supports **PHP** (nearly all shared hosting
   does).
3. Make sure the `data/` folder is **writable** by the server. If saving
   from the admin panel fails, set its permissions to `755` (or `775` if
   your host requires it) from your host's File Manager or via FTP.
4. Visit your domain — the site should load with your content from
   `data/site-data.json`.

## The hidden admin panel

- Click the logo/name in the navbar **5 times** within about 2 seconds.
- Enter the access code **2708** when prompted.
- Edit any section, then go to the **Data** tab and press **Save to
  server** — this writes your changes to `data/site-data.json` on the
  server, so *every visitor* sees them, not just your browser.
- **Export/Import JSON** in the same tab is a manual backup — download a
  copy of your content, or load one back in.

### Changing the code or click count

Both live in `data/config.json`:

```json
{ "adminCode": "2708", "requiredClicks": 5 }
```

Edit the numbers/code there directly on the server — there's no in-app UI
for this on purpose, so it can't be changed by anyone who only has the
click-and-code combination.

### A note on security

The admin code is a simple shared-secret check — enough to stop casual
visitors from editing your site, but it is **not** a full authentication
system (no encryption, no rate-limiting, no login sessions). For a
personal portfolio this is a reasonable trade-off, but if you want it
hardened further: serve the site over **HTTPS**, pick a longer/less
guessable code, and consider restricting `api/save.php` by IP in
`.htaccess`.

## The contact form

`api/contact.php` sends form submissions to whatever email is set in the
**Contact** tab of the admin panel (`data/site-data.json` → `contact.email`).
It uses PHP's built-in `mail()` function, which works out of the box on many
shared hosts but not all — deliverability (and spam-folder placement)
depends entirely on your host's mail setup. If messages aren't arriving,
your host's support team can usually tell you whether `mail()` is enabled,
or you can swap in PHPMailer with your host's SMTP details, or a service
like Formspree/EmailJS instead.

## Customizing the look

- Colors and the glass blur strength: `assets/css/variables.css`.
- The accent color and light/dark mode can also be changed live from the
  admin panel's **Theme** tab.
- Fonts: Inter, from Google Fonts. Icons: Font Awesome Free, via cdnjs.

## Performance & accessibility notes

- Blur strength automatically drops on small screens for smoother
  scrolling on weaker phone GPUs.
- Mouse-driven effects (parallax blobs, card tilt, cursor glow, magnetic
  buttons) only run on devices with a precise pointer (mouse/trackpad) —
  they're skipped on touch devices.
- Every continuous animation respects the OS-level "reduce motion"
  accessibility setting.
