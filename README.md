# Yogesh Hande — Portfolio

Personal portfolio website for **Yogesh Hande**, a final-year B.Tech
(AI & Data Science) student and full-stack developer. Built with plain
HTML/CSS/JS and a lightweight Three.js-powered animated 3D background.

**Live sections:** Hero · About · Skills · Projects · Achievements · Contact

## ✨ Features

- Responsive, single-page layout (mobile → desktop)
- Animated 3D background (drifting wireframe shapes + connected particle
  network) built with [Three.js](https://threejs.org/), paused
  automatically on hidden tabs and reduced for small screens
- Scroll-triggered reveal animations, staggered card entrances, and a
  subtle tilt effect on project cards
- Preloader, back-to-top button, active-section nav highlighting
- Respects `prefers-reduced-motion` throughout
- Project filtering (All / AI / Web / Internship)
- SEO basics: meta description, Open Graph tags, `sitemap.xml`,
  `robots.txt`, `manifest.json`, favicon

## 📁 Project structure

```
portfolio/
├── index.html              # Markup
├── css/
│   └── style.css           # All styling (theme tokens, layout, animation)
├── js/
│   ├── background.js       # Three.js animated 3D background
│   └── main.js              # Nav, reveal, filters, form, tilt, back-to-top
├── assets/
│   ├── favicon.svg
│   ├── images/
│   │   └── profile.jpg      # ← add your headshot here (see README.txt inside)
│   └── resume/
│       └── Yogesh_Hande_Resume.pdf  # ← add your resume here (see README.txt inside)
├── manifest.json
├── robots.txt
├── sitemap.xml
└── README.md
```

## 🚀 Running locally

No build step — it's static HTML/CSS/JS.

```bash
# from the project folder
python3 -m http.server 8000
# then open http://localhost:8000
```

Or just open `index.html` directly in a browser (the 3D background and
fonts need an internet connection since they load from CDNs).

## 🖊️ Before you publish, replace these placeholders

| What | Where | Placeholder value |
|---|---|---|
| Profile photo | `assets/images/profile.jpg` | Falls back to a "YH" monogram if missing |
| Resume PDF | `assets/resume/Yogesh_Hande_Resume.pdf` | Button links here but file isn't included |
| Canonical / OG URL | `index.html` `<head>` | `https://yogeshhande.dev/` |
| Contact form | `js/main.js` → `FORMSPREE_FORM_ID` | Empty by default → uses `mailto:` (works instantly). Add a Formspree ID for silent background sending — see "Making the contact form send silently" below |
| GitHub project links | Each `.proj-card` | Some point to the generic profile — link the exact repo per project |

## ✉️ Making the contact form send silently (Formspree)

By default the form opens the visitor's email app (`mailto:`) — that
already works with zero setup. If you'd rather it send silently in the
background (no email-app popup, feels like a "real" contact form),
switch on Formspree — free, no coding needed:

1. Go to **[formspree.io](https://formspree.io)** → sign up (email or Google), free plan is enough.
2. Click **New Form**, name it anything (e.g. "Portfolio Contact"), and create it.
3. Formspree gives you a **Form ID** — either just a short code like
   `myznkyxz`, or a full endpoint like `https://formspree.io/f/myznkyxz`.
   You only need the short code part.
4. Open `js/main.js`, find this line near the top of the contact-form section:
   ```js
   const FORMSPREE_FORM_ID = ''; // e.g. 'myznkyxz'  — paste your ID here
   ```
   Paste your ID between the quotes, e.g. `const FORMSPREE_FORM_ID = 'myznkyxz';`
5. Save, reload the site, and submit the form once yourself.
6. Formspree emails you a **confirmation link** the first time — click it.
   Until confirmed, that first test submission won't arrive; every
   submission after confirming will land straight in your inbox.

That's it — no server, no API key beyond the form ID. If `FORMSPREE_FORM_ID`
is ever left empty, the site automatically falls back to the `mailto:`
behavior, so nothing breaks either way.



Any static host works out of the box — no build step required:

- **GitHub Pages** — push this folder to a repo, enable Pages on the `main` branch
- **Netlify / Vercel** — drag-and-drop the folder or connect the repo
- **Cloudflare Pages** — same, connect the repo and deploy

## 🎨 Tech

HTML5 · CSS3 · Vanilla JS · [Three.js](https://threejs.org/) r128 ·
[Font Awesome](https://fontawesome.com/) · Google Fonts (Poppins)

## 📄 License

Content and code © 2026 Yogesh Hande. See `LICENSE` for reuse terms.
