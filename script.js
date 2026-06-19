z/* ===================================================================
   SATHISH KUMAR N — PORTFOLIO
   Pure JavaScript — no dependencies
=================================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     1. NEURAL NETWORK CANVAS — Hero signature animation
     Nodes drift slowly; nearby nodes connect; signals occasionally
     pulse along a connection — evoking a live, "thinking" network.
  ============================================================ */
  function initNeuralCanvas() {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height, dpr;
    let nodes = [];
    let pulses = [];
    let mouse = { x: null, y: null, active: false };
    const hero = document.getElementById('hero');

    const NODE_COLOR = '94,234,212';   // teal
    const NODE_COLOR_2 = '167,139,250'; // violet
    const LINK_DIST = 150;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth = hero.offsetWidth;
      height = canvas.clientHeight = hero.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
    }

    function buildNodes() {
      const area = width * height;
      const count = Math.min(70, Math.max(28, Math.floor(area / 18000)));
      nodes = [];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: Math.random() * 1.6 + 1.1,
          c: Math.random() > 0.78 ? NODE_COLOR_2 : NODE_COLOR,
          pulse: Math.random() * Math.PI * 2
        });
      }
    }

    function maybeSpawnPulse() {
      if (Math.random() > 0.025 || nodes.length < 2) return;
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      let nearest = null, nearestDist = Infinity;
      for (const b of nodes) {
        if (b === a) continue;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK_DIST && d < nearestDist) { nearest = b; nearestDist = d; }
      }
      if (nearest) pulses.push({ a, b: nearest, t: 0 });
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      // update + draw nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.02;

        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;

        // gentle attraction toward mouse
        if (mouse.active) {
          const dx = mouse.x - n.x, dy = mouse.y - n.y;
          const d = Math.hypot(dx, dy);
          if (d < 180 && d > 0.01) {
            n.x += (dx / d) * 0.12;
            n.y += (dy / d) * 0.12;
          }
        }
      }

      // draw links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DIST) {
            const op = (1 - d / LINK_DIST) * 0.16;
            ctx.strokeStyle = `rgba(${a.c},${op})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // draw nodes (glow)
      for (const n of nodes) {
        const glow = 0.55 + Math.sin(n.pulse) * 0.25;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.c},${glow * 0.08})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.c},${glow})`;
        ctx.fill();
      }

      // signal pulses traveling along edges
      maybeSpawnPulse();
      pulses = pulses.filter(p => p.t <= 1);
      for (const p of pulses) {
        p.t += 0.018;
        const x = p.a.x + (p.b.x - p.a.x) * p.t;
        const y = p.a.y + (p.b.y - p.a.y) * p.t;
        const fade = Math.sin(p.t * Math.PI);
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.a.c},${fade})`;
        ctx.shadowColor = `rgba(${p.a.c},${fade})`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (!prefersReducedMotion) requestAnimationFrame(step);
    }

    window.addEventListener('resize', debounce(resize, 200));
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });
    hero.addEventListener('mouseleave', () => { mouse.active = false; });

    resize();
    if (prefersReducedMotion) {
      step(); // draw a single static frame
    } else {
      requestAnimationFrame(step);
    }
  }

  /* ============================================================
     2. HEADER — scrolled state + active link highlighting
  ============================================================ */
  function initHeader() {
    const header = document.getElementById('siteHeader');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = Array.from(document.querySelectorAll('main section[id]'));

    function onScroll() {
      if (window.scrollY > 24) header.classList.add('scrolled');
      else header.classList.remove('scrolled');

      let current = '';
      const scrollPos = window.scrollY + 140;
      for (const sec of sections) {
        if (sec.offsetTop <= scrollPos && sec.offsetTop + sec.offsetHeight > scrollPos) {
          current = sec.id;
        }
      }
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
      });

      const backToTop = document.getElementById('backToTop');
      if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 600);
    }

    window.addEventListener('scroll', throttle(onScroll, 80), { passive: true });
    onScroll();
  }

  /* ============================================================
     3. MOBILE NAV TOGGLE
  ============================================================ */
  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ============================================================
     4. ROLE CYCLER — hero subtitle typewriter rotation
  ============================================================ */
  function initRoleCycler() {
    const el = document.getElementById('roleCycle');
    if (!el) return;
    const roles = ['AI Engineer', 'Machine Learning Engineer', 'Data Analyst', 'BI Developer'];
    let roleIndex = 0;

    if (prefersReducedMotion) return;

    function typeRole(text, cb) {
      let i = 0;
      el.textContent = '';
      const t = setInterval(() => {
        el.textContent = text.slice(0, i + 1);
        i++;
        if (i === text.length) { clearInterval(t); cb(); }
      }, 45);
    }

    function eraseRole(cb) {
      let text = el.textContent;
      const t = setInterval(() => {
        text = text.slice(0, -1);
        el.textContent = text;
        if (text.length === 0) { clearInterval(t); cb(); }
      }, 28);
    }

    function cycle() {
      typeRole(roles[roleIndex], () => {
        setTimeout(() => {
          eraseRole(() => {
            roleIndex = (roleIndex + 1) % roles.length;
            setTimeout(cycle, 250);
          });
        }, 1700);
      });
    }

    el.textContent = '';
    setTimeout(cycle, 900);
  }

  /* ============================================================
     5. SCROLL REVEAL — IntersectionObserver for [data-reveal] +
        skill bar fill triggers
  ============================================================ */
  function initScrollReveal() {
    // tag elements for reveal
    const targets = document.querySelectorAll(
      '.about-copy, .about-panel, .skill-card, .project-card, .cert-item, .edu-card, .contact-info, .contact-form, .section-head'
    );
    targets.forEach(el => el.setAttribute('data-reveal', ''));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          if (entry.target.classList.contains('skill-card')) {
            entry.target.classList.add('in-view');
          }
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
  }

  /* ============================================================
     6. CURSOR GLOW — follows pointer on desktop
  ============================================================ */
  function initCursorGlow() {
    const glow = document.querySelector('.cursor-glow');
    if (!glow || window.matchMedia('(pointer: coarse)').matches) return;

    let raf = null;
    document.addEventListener('mousemove', (e) => {
      document.body.classList.add('cursor-active');
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
      });
    });
    document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
  }

  /* ============================================================
     7. CONTACT FORM — client-side validation + simulated send
  ============================================================ */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const note = document.getElementById('formNote');
    const submitBtn = document.getElementById('formSubmit');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const subject = form.subject.value.trim();
      const message = form.message.value.trim();
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!name || !email || !subject || !message) {
        note.textContent = 'Please fill in every field before sending.';
        note.classList.add('error');
        return;
      }
      if (!emailValid) {
        note.textContent = 'Please enter a valid email address.';
        note.classList.add('error');
        return;
      }

      note.classList.remove('error');
      const originalText = submitBtn.querySelector('.btn-text').textContent;
      submitBtn.querySelector('.btn-text').textContent = 'Sending…';
      submitBtn.style.opacity = '0.7';
      submitBtn.disabled = true;

      // Simulated send (no backend wired up) — mailto fallback for real delivery
      setTimeout(() => {
        note.textContent = `Thanks, ${name.split(' ')[0]} — your message is ready. Opening your email client to deliver it.`;
        submitBtn.querySelector('.btn-text').textContent = originalText;
        submitBtn.style.opacity = '1';
        submitBtn.disabled = false;

        const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
        const mailto = `mailto:mr.sathish1412@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
        window.location.href = mailto;

        form.reset();
      }, 900);
    });
  }

  /* ============================================================
     8. BACK TO TOP
  ============================================================ */
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ============================================================
     9. MISC — footer year, smooth anchor offset correction
  ============================================================ */
  function initMisc() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ============================================================
     UTILITIES
  ============================================================ */
  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
  function throttle(fn, wait) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= wait) { last = now; fn.apply(this, args); }
    };
  }

  /* ============================================================
     INIT
  ============================================================ */
  document.addEventListener('DOMContentLoaded', () => {
    initNeuralCanvas();
    initHeader();
    initMobileNav();
    initRoleCycler();
    initScrollReveal();
    initCursorGlow();
    initContactForm();
    initBackToTop();
    initMisc();
  });
})();