/* =========================================================
   main.js — UI interactions for Yogesh Hande's portfolio
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Preloader ---- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader && preloader.classList.add('hide'), 350);
  });
  // Fallback in case 'load' already fired or takes too long
  setTimeout(() => preloader && preloader.classList.add('hide'), 2500);

  /* ---- Mobile nav toggle ---- */
  const navtoggle = document.getElementById('navtoggle');
  const navlinks = document.getElementById('navlinks');
  if (navtoggle && navlinks) {
    navtoggle.addEventListener('click', () => navlinks.classList.toggle('open'));
    navlinks.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => navlinks.classList.remove('open'))
    );
  }

  /* ---- Scroll-reveal ---- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  /* ---- Project filters ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.proj-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      projectCards.forEach(card => {
        const cats = card.dataset.cat.split(' ');
        const match = filter === 'all' || cats.includes(filter);
        card.classList.toggle('hidden', !match);
      });
    });
  });

  /* ---- Subtle 3D tilt on project cards ---- */
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (supportsHover && !reduceMotion) {
    projectCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-8px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* =========================================================
     CONTACT FORM — silent background send via Formspree
     =========================================================
     1. Go to https://formspree.io and sign up free (email/Google).
     2. Create a new Form → it gives you a Form ID that looks like
        "myznkyxz" or a full endpoint like
        "https://formspree.io/f/myznkyxz".
     3. Paste just the ID below in FORMSPREE_FORM_ID (between the quotes).
     4. Save, reload the site, submit the form once yourself, and
        confirm it from the activation email Formspree sends you —
        that one-time confirmation is required before it goes live.

     Until you add a real ID, FORMSPREE_FORM_ID stays empty and the
     form automatically falls back to opening the visitor's email
     app instead (the mailto: behavior from before) — nothing breaks
     either way.
     ========================================================= */
  const FORMSPREE_FORM_ID = 'mzdnvprw'; // e.g. 'myznkyxz'  — paste your ID here
  const YOUR_EMAIL = 'handeyogesh492@gmail.com';

  const form = document.getElementById('contactForm');
  const formMsg = document.getElementById('formMsg');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !message) {
        formMsg.textContent = 'Please fill in your name, email, and message.';
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');

      if (FORMSPREE_FORM_ID) {
        // ---- Silent background send via Formspree ----
        if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = '0.6'; }
        formMsg.textContent = 'Sending…';

        try {
          const res = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: new FormData(form)
          });

          if (res.ok) {
            formMsg.textContent = `Thanks, ${name}! Your message is on its way — Yogesh will get back to you soon.`;
            form.reset();
          } else {
            throw new Error('Formspree returned an error');
          }
        } catch (err) {
          formMsg.textContent = "Couldn't send automatically — opening your email app instead.";
          window.location.href = buildMailto(name, email, subject, message);
          form.reset();
        } finally {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = ''; }
        }
      } else {
        // ---- Fallback: mailto (no Formspree ID configured yet) ----
        window.location.href = buildMailto(name, email, subject, message);
        formMsg.textContent = 'Opening your email app to send this to Yogesh — hit send there to complete it.';
        form.reset();
      }
    });
  }

  function buildMailto(name, email, subject, message) {
    const mailSubject = subject ? subject : `Portfolio message from ${name}`;
    const mailBody = `${message}\n\n---\nFrom: ${name}\nEmail: ${email}`;
    return `mailto:${YOUR_EMAIL}` +
      `?subject=${encodeURIComponent(mailSubject)}` +
      `&body=${encodeURIComponent(mailBody)}`;
  }

  /* ---- Hero CTA scrolls to projects ---- */
  const resumeBtn = document.getElementById('resumeBtn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ---- Back to top button ---- */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('show', window.scrollY > 600);
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---- Active nav link highlight on scroll ---- */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.navlinks a');
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active-link'));
        const active = document.querySelector(`.navlinks a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active-link');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => navObserver.observe(s));

});
