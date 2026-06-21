/* ============================================================
   SGEA — Main JavaScript
   Navigation · Particles · Scroll Effects · Counter Animation
   ============================================================ */

(function () {
  'use strict';

  /* ── Navbar scroll behavior ─────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.querySelector('.scroll-progress');

  function onScroll() {
    const scrolled = window.scrollY;
    if (navbar) {
      navbar.classList.toggle('scrolled', scrolled > 20);
    }
    if (scrollProgress) {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.style.width = docH > 0 ? (scrolled / docH * 100) + '%' : '0%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile nav toggle ──────────────────────────────────── */
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });
    // Close when a link is clicked
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
      });
    });
    // Close on outside click
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
      }
    });
  }

  /* ── Active nav link (ScrollSpy) ────────────────────────── */
  (function setActiveNav() {
    const navLinksList = document.querySelectorAll('.nav-links a');
    const sections = [];
    
    // Map of nav links to target elements
    navLinksList.forEach(a => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          sections.push({ link: a, target: target });
        }
      }
    });

    // Also handle Home (#hero) link targeting the hero section
    const heroNav = Array.from(navLinksList).find(a => a.getAttribute('href') === '#hero');
    const heroSec = document.getElementById('hero');
    if (heroNav && heroSec && !sections.some(s => s.target === heroSec)) {
      sections.push({ link: heroNav, target: heroSec });
    }

    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -50% 0px', // Trigger when section occupies the upper-middle part of viewport
      threshold: 0
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const activeLink = sections.find(s => s.target === entry.target)?.link;
          if (activeLink) {
            navLinksList.forEach(a => a.classList.remove('active'));
            activeLink.classList.add('active');
          }
        }
      });
    }, observerOptions);

    sections.forEach(s => observer.observe(s.target));
  })();

  /* ── Scroll Reveal (IntersectionObserver) ───────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ── Animated counter ───────────────────────────────────── */
  function animateCounter(el) {
    const target  = parseFloat(el.dataset.target || el.textContent);
    const suffix  = el.dataset.suffix || '';
    const prefix  = el.dataset.prefix || '';
    const duration = 2000;
    const startTime = performance.now();

    function update(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = target * eased;
      el.textContent = prefix + (Number.isInteger(target) ? Math.round(value) : value.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counterEls = document.querySelectorAll('.stat-number[data-target]');
  if (counterEls.length > 0) {
    const counterObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counterEls.forEach(el => counterObserver.observe(el));
  }

  /* ── Expertise bars fill animation ──────────────────────── */
  const bars = document.querySelectorAll('.expertise-fill[data-width]');
  if (bars.length > 0) {
    const barObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.width = entry.target.dataset.width + '%';
            barObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    bars.forEach(b => barObserver.observe(b));
  }

  /* ── Accordion ──────────────────────────────────────────── */
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.accordion-item.open').forEach(i => i.classList.remove('open'));
      // Toggle current
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ── Smooth scroll for anchor links ─────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      }
    });
  });

  /* ── Particle Canvas ─────────────────────────────────────── */
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], animFrame;

    const CONFIG = {
      count:    90,
      maxDist:  130,
      speed:    0.4,
      radius:   1.8,
      colorA:   '37,99,235',
      colorB:   '6,182,212',
    };

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    class Particle {
      constructor() { this.reset(true); }
      reset(randomY = false) {
        this.x  = Math.random() * W;
        this.y  = randomY ? Math.random() * H : H + 10;
        this.vx = (Math.random() - 0.5) * CONFIG.speed;
        this.vy = (Math.random() - 0.5) * CONFIG.speed;
        this.r  = Math.random() * CONFIG.radius + 0.5;
        this.alpha = Math.random() * 0.6 + 0.2;
        this.color = Math.random() > 0.5 ? CONFIG.colorA : CONFIG.colorB;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > W) this.vx *= -1;
        if (this.y < 0 || this.y > H) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
        ctx.fill();
      }
    }

    function init() {
      resize();
      particles = Array.from({ length: CONFIG.count }, () => new Particle());
    }

    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONFIG.maxDist) {
            const alpha = (1 - dist / CONFIG.maxDist) * 0.25;
            ctx.strokeStyle = `rgba(${CONFIG.colorA},${alpha})`;
            ctx.lineWidth   = 0.7;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      drawLines();
      particles.forEach(p => { p.update(); p.draw(); });
      animFrame = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(() => { resize(); });
    ro.observe(canvas.parentElement);
    init();
    loop();

    // Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(animFrame);
      else loop();
    });
  }

  /* ── Toast notification ─────────────────────────────────── */
  window.showToast = function(message, duration = 4000) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `
        <svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <p></p>`;
      document.body.appendChild(toast);
    }
    toast.querySelector('p').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  };

  /* ── Typewriter effect ──────────────────────────────────── */
  const typeEl = document.getElementById('typewriter');
  if (typeEl) {
    const phrases = typeEl.dataset.phrases ? JSON.parse(typeEl.dataset.phrases) : [];
    if (phrases.length) {
      let phraseIndex = 0, charIndex = 0, deleting = false;
      function type() {
        const current = phrases[phraseIndex];
        if (deleting) {
          typeEl.textContent = current.substring(0, --charIndex);
          if (charIndex === 0) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; }
        } else {
          typeEl.textContent = current.substring(0, ++charIndex);
          if (charIndex === current.length) { deleting = true; setTimeout(type, 2000); return; }
        }
        setTimeout(type, deleting ? 50 : 85);
      }
      type();
    }
  }

  /* ── Filter buttons (insights/resources) ────────────────── */
  document.querySelectorAll('[data-filter-group]').forEach(group => {
    const btns  = group.querySelectorAll('[data-filter]');
    const items = document.querySelectorAll('[data-category]');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        items.forEach(item => {
          const show = filter === 'all' || item.dataset.category === filter;
          item.style.display = show ? '' : 'none';
        });
      });
    });
  });

})();
