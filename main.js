/**
 * main.js — Portfolio interactions, animations, and logic
 * ═══════════════════════════════════════════════════════
 */

'use strict';

/* ═══════════════════════════════════════════════════════
   1. DEVICE DETECTION
═══════════════════════════════════════════════════════ */
const isTouchDevice = () =>
  ('ontouchstart' in window) ||
  (navigator.maxTouchPoints > 0) ||
  window.matchMedia('(hover: none)').matches;

if (isTouchDevice()) {
  document.body.classList.add('touch-device');
}

/* ═══════════════════════════════════════════════════════
   2. LOADING SEQUENCE
═══════════════════════════════════════════════════════ */
(function initLoader() {
  const loader   = document.getElementById('loader');
  const line     = document.getElementById('loaderLine');
  const steps    = [
    document.getElementById('ls1'),
    document.getElementById('ls2'),
    document.getElementById('ls3'),
    document.getElementById('ls4'),
  ];
  const name    = document.getElementById('loaderName');
  const sub     = document.getElementById('loaderSub');

  // If user has already seen it this session, skip
  if (sessionStorage.getItem('loaderSeen')) {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    return;
  }

  document.body.style.overflow = 'hidden';

  const delays = [100, 380, 660, 920];
  delays.forEach((d, i) => {
    setTimeout(() => {
      if (steps[i]) steps[i].classList.add('visible');
    }, d);
  });

  setTimeout(() => {
    if (name) name.classList.add('visible');
    if (sub)  sub.classList.add('visible');
  }, 1100);

  setTimeout(() => {
    if (loader) loader.classList.add('hidden');
    document.body.style.overflow = '';
    sessionStorage.setItem('loaderSeen', '1');
    // Trigger hero reveal after loader
    triggerHeroReveal();
  }, 2000);
})();

/* ═══════════════════════════════════════════════════════
   3. CUSTOM CURSOR
═══════════════════════════════════════════════════════ */
(function initCursor() {
  if (isTouchDevice()) return;

  const cursor     = document.getElementById('cursor');
  const cursorDot  = cursor?.querySelector('.cursor-dot');
  const cursorRing = cursor?.querySelector('.cursor-ring');
  const cursorText = document.getElementById('cursorText');
  if (!cursor) return;

  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;
  let raf;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorDot) {
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top  = mouseY + 'px';
    }
  });

  function animateRing() {
    const speed = 0.12;
    ringX += (mouseX - ringX) * speed;
    ringY += (mouseY - ringY) * speed;
    if (cursorRing) {
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top  = ringY + 'px';
    }
    if (cursorText) {
      cursorText.style.left = ringX + 'px';
      cursorText.style.top  = ringY + 'px';
    }
    raf = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effect on interactive elements
  const hoverEls = document.querySelectorAll(
    'a, button, [tabindex="0"], .magnetic, input, textarea, select, .project-card, .service-card, .cert-card'
  );

  hoverEls.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor-hover');
      const label = el.dataset.cursor;
      if (label && cursorText) {
        cursorText.textContent = label;
        cursor.classList.add('cursor-active');
      }
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor-hover', 'cursor-active');
      if (cursorText) cursorText.textContent = '';
    });
  });
})();

/* ═══════════════════════════════════════════════════════
   4. NAVBAR
═══════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const toggle    = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta');

  // Scroll → add .scrolled class
  const onScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveLink();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu toggle
  toggle?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open');
    toggle.classList.toggle('open');
    mobileMenu.setAttribute('aria-hidden', String(isOpen));
    toggle.setAttribute('aria-expanded', String(!isOpen));
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  // Close mobile menu on link click
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      toggle.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      mobileMenu.classList.remove('open');
      toggle.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Active nav link on scroll
  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollY = window.scrollY + 120;

    sections.forEach((section) => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }
})();

/* ═══════════════════════════════════════════════════════
   5. SCROLL REVEAL
═══════════════════════════════════════════════════════ */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal-up, .reveal-fade');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach((el) => observer.observe(el));
}

/* ═══════════════════════════════════════════════════════
   6. HERO CANVAS PARTICLES
═══════════════════════════════════════════════════════ */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];
  const COUNT  = 60;

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.r  = Math.random() * 1.5 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.a  = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${this.a})`;
      ctx.fill();
    }
  }

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    particles = Array.from({ length: COUNT }, () => new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,212,255,${(1 - dist / 120) * 0.15})`;
          ctx.lineWidth   = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }

  resize();
  animate();
  window.addEventListener('resize', resize, { passive: true });
})();

/* ═══════════════════════════════════════════════════════
   7. HERO REVEAL (after loader)
═══════════════════════════════════════════════════════ */
function triggerHeroReveal() {
  const heroEls = document.querySelectorAll(
    '.hero-section .reveal-up, .hero-section .reveal-fade'
  );
  heroEls.forEach((el, i) => {
    setTimeout(() => el.classList.add('revealed'), i * 80);
  });
}

// If loader was already seen (session), reveal hero immediately
if (sessionStorage.getItem('loaderSeen')) {
  document.addEventListener('DOMContentLoaded', triggerHeroReveal);
}

/* ═══════════════════════════════════════════════════════
   8. MAGNETIC BUTTON EFFECT
═══════════════════════════════════════════════════════ */
(function initMagnetic() {
  if (isTouchDevice()) return;

  const magnetics = document.querySelectorAll('.magnetic');

  magnetics.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect   = el.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) * 0.35;
      const dy     = (e.clientY - cy) * 0.35;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
})();

/* ═══════════════════════════════════════════════════════
   9. PROJECT MODAL
═══════════════════════════════════════════════════════ */
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
const modalClose   = document.getElementById('modalClose');

function openModal(projectId) {
  const p = PROJECTS[projectId];
  if (!p || !modalContent) return;

  modalContent.innerHTML = `
    <div class="modal-num">${p.num}</div>
    <span class="modal-cat">${p.category}</span>
    <h2 class="modal-title">${p.title}</h2>

    <div class="modal-section">
      <div class="modal-section-label">Overview</div>
      <p>${p.shortDesc}</p>
    </div>

    <div class="modal-section">
      <div class="modal-section-label">Problem</div>
      <p>${p.problem}</p>
    </div>

    <div class="modal-section">
      <div class="modal-section-label">Solution</div>
      <p>${p.solution}</p>
    </div>

    <div class="modal-section">
      <div class="modal-section-label">Key Features</div>
      <ul class="modal-features">
        ${p.features.map(f => `<li>${f}</li>`).join('')}
      </ul>
    </div>

    <div class="modal-section">
      <div class="modal-section-label">Architecture</div>
      <p>${p.architecture}</p>
    </div>

    <div class="modal-section">
      <div class="modal-section-label">Technologies</div>
      <div class="modal-tech">
        ${p.technologies.map(t => `<span>${t}</span>`).join('')}
      </div>
    </div>

    <div class="modal-actions">
      ${p.github
        ? `<a href="${p.github}" target="_blank" rel="noopener" class="modal-btn-gh">
             <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 1.667C5.4 1.667 1.667 5.4 1.667 10c0 3.683 2.39 6.81 5.7 7.913.417.077.57-.18.57-.4v-1.553c-2.32.503-2.81-1.097-2.81-1.097-.38-.96-.93-1.213-.93-1.213-.76-.52.057-.51.057-.51.84.06 1.283.863 1.283.863.747 1.28 1.96.91 2.44.696.077-.54.293-.91.533-1.12C6.5 14.2 4.753 13.56 4.753 10.7c0-.91.327-1.657.86-2.24-.087-.213-.373-1.06.083-2.21 0 0 .7-.224 2.29.853a7.96 7.96 0 012.083-.28c.707 0 1.42.096 2.083.28 1.59-1.077 2.287-.853 2.287-.853.457 1.15.17 2 .083 2.21.537.583.86 1.33.86 2.24 0 3.21-1.753 3.917-3.423 4.123.27.233.513.693.513 1.397v2.07c0 .22.147.477.563.397A8.337 8.337 0 0018.333 10c0-4.6-3.733-8.333-8.333-8.333z"/></svg>
             View on GitHub
           </a>`
        : ''}
      ${p.demo
        ? `<a href="${p.demo}" target="_blank" rel="noopener" class="btn-primary" style="font-size:12px;padding:11px 22px;">
             Live Demo ↗
           </a>`
        : ''}
      <p class="modal-placeholder-note">
        ${p.status === 'concept'
          ? '✦ This is a portfolio concept project. GitHub and live demo links will be added when the project is published.'
          : ''}
      </p>
    </div>
  `;

  modalOverlay.classList.add('open');
  modalOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}

function closeModal() {
  modalOverlay.classList.remove('open');
  modalOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

modalClose?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
});

// Also allow keyboard open on project cards
document.querySelectorAll('.project-card').forEach((card) => {
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const id = parseInt(card.dataset.project, 10);
      openModal(id);
    }
  });
});

/* ═══════════════════════════════════════════════════════
   10. CONTACT FORM VALIDATION
═══════════════════════════════════════════════════════ */
(function initContactForm() {
  const form        = document.getElementById('contactForm');
  const successMsg  = document.getElementById('formSuccess');
  if (!form) return;

  const fields = {
    name:    { input: document.getElementById('contactName'),    error: document.getElementById('nameError') },
    email:   { input: document.getElementById('contactEmail'),   error: document.getElementById('emailError') },
    type:    { input: document.getElementById('contactType'),    error: document.getElementById('typeError') },
    message: { input: document.getElementById('contactMessage'), error: document.getElementById('messageError') },
  };

  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function setError(field, msg) {
    fields[field].error.textContent = msg;
    fields[field].input.style.borderColor = msg ? '#ff6b6b' : '';
  }

  function clearError(field) {
    setError(field, '');
  }

  // Real-time validation
  Object.keys(fields).forEach((key) => {
    fields[key].input.addEventListener('input', () => clearError(key));
    fields[key].input.addEventListener('change', () => clearError(key));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const name    = fields.name.input.value.trim();
    const email   = fields.email.input.value.trim();
    const type    = fields.type.input.value;
    const message = fields.message.input.value.trim();

    if (!name || name.length < 2) {
      setError('name', 'Please enter your full name.'); valid = false;
    }
    if (!email || !validateEmail(email)) {
      setError('email', 'Please enter a valid email address.'); valid = false;
    }
    if (!type) {
      setError('type', 'Please select a project type.'); valid = false;
    }
    if (!message || message.length < 10) {
      setError('message', 'Please write a brief message (at least 10 characters).'); valid = false;
    }

    if (!valid) return;

    // ─── Connect your email service here ───
    // Option A: EmailJS  → emailjs.send(serviceId, templateId, { name, email, type, message })
    // Option B: Formspree → fetch('https://formspree.io/f/YOUR_ID', { method:'POST', body: new FormData(form) })
    // Option C: Custom backend → fetch('/api/contact', { method:'POST', body: JSON.stringify(...) })
    // ───────────────────────────────────────

    // For now, show success message
    form.style.display = 'none';
    if (successMsg) successMsg.classList.add('show');
  });
})();

/* ═══════════════════════════════════════════════════════
   11. SMOOTH ANCHOR SCROLLING
═══════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ═══════════════════════════════════════════════════════
   12. INIT
═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();

  // ── Portrait parallax on mouse move (desktop only) ──
  if (!isTouchDevice()) {
    const parallaxEl = document.getElementById('portraitParallax');
    if (parallaxEl) {
      const section = document.getElementById('home');
      let ticking = false;

      document.addEventListener('mousemove', (e) => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          // Only apply when hero section is in view
          const rect = section ? section.getBoundingClientRect() : null;
          if (rect && rect.top < window.innerHeight && rect.bottom > 0) {
            const cx = window.innerWidth  / 2;
            const cy = window.innerHeight / 2;
            const dx = (e.clientX - cx) / cx; // -1 to 1
            const dy = (e.clientY - cy) / cy; // -1 to 1
            // Subtle 8px max movement
            const moveX =  dx * 8;
            const moveY =  dy * 6;
            parallaxEl.style.transform = `translate(${moveX}px, ${moveY}px)`;
          }
          ticking = false;
        });
      });

      // Reset on mouse leave
      document.addEventListener('mouseleave', () => {
        parallaxEl.style.transform = '';
      });
    }
  }

  // profileImage is now hardcoded in HTML — no JS injection needed
});


/* ═══════════════════════════════════════════════════════
   13. EXPOSE openModal globally (called from inline HTML)
═══════════════════════════════════════════════════════ */
window.openModal = openModal;
