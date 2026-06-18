/* =========================================================
   MK DIGITALS — script.js (shared across all pages)
   Handles: mobile nav, sticky header, scroll reveal, form
   ========================================================= */

(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* 1. Year in footer */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* 2. Mobile nav toggle */
  const nav = $('#siteNav');
  const navToggle = $('#navToggle');

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function openNav() {
    if (!nav || !navToggle) return;
    nav.classList.add('is-open');
    navToggle.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.contains('is-open') ? closeNav() : openNav();
    });

    $$('.nav-link, .nav-cta', nav).forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) closeNav();
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768 && nav.classList.contains('is-open')) closeNav();
      }, 150);
    });
  }

  /* 3. Sticky header shadow */
  const header = $('#siteHeader');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* 4. Scroll reveal */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = $$('.reveal');

  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );
      revealEls.forEach((el) => revealObserver.observe(el));
    }
  }

  /* 5. Contact form validation */
  const form = $('#contactForm');
  const status = $('#formStatus');

  if (form) {
    const setError = (field, message) => {
      const wrapper = field.closest('.form-field');
      const errorEl = wrapper && wrapper.querySelector('.form-error');
      if (wrapper) wrapper.classList.toggle('has-error', !!message);
      if (errorEl) errorEl.textContent = message || '';
    };

    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
    const isUrl = (v) => {
      if (!v.trim()) return true;
      try {
        const u = new URL(v.startsWith('http') ? v : `https://${v}`);
        return !!u.hostname.includes('.');
      } catch (_) { return false; }
    };
    const isPhone = (v) => {
      if (!v.trim()) return true;
      return /^[+\d][\d\s\-()]{6,}$/.test(v.trim());
    };

    const validate = () => {
      let valid = true;
      const name = $('#name', form);
      const email = $('#email', form);
      const phone = $('#phone', form);
      const website = $('#website', form);
      const message = $('#message', form);

      if (!name.value.trim() || name.value.trim().length < 2) {
        setError(name, 'Please enter your name.');
        valid = false;
      } else setError(name, '');

      if (!email.value.trim()) {
        setError(email, 'Email is required.');
        valid = false;
      } else if (!isEmail(email.value)) {
        setError(email, 'Enter a valid email address.');
        valid = false;
      } else setError(email, '');

      if (!isPhone(phone.value)) {
        setError(phone, 'Enter a valid phone number.');
        valid = false;
      } else setError(phone, '');

      if (!isUrl(website.value)) {
        setError(website, 'Enter a valid URL (e.g. example.com).');
        valid = false;
      } else setError(website, '');

      if (!message.value.trim() || message.value.trim().length < 10) {
        setError(message, 'Tell us a bit more (at least 10 characters).');
        valid = false;
      } else setError(message, '');

      return valid;
    };

    $$('input, textarea', form).forEach((field) => {
      field.addEventListener('input', () => setError(field, ''));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (status) {
        status.textContent = '';
        status.classList.remove('is-success', 'is-error');
      }

      if (!validate()) {
        if (status) {
          status.textContent = 'Please fix the highlighted fields and try again.';
          status.classList.add('is-error');
        }
        return;
      }

      /* INTEGRATION POINT:
         Wire to Formspree, Web3Forms, or a Vercel serverless function.
         Example:
           await fetch('/api/contact', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(Object.fromEntries(new FormData(form))),
           });
      */

      if (status) {
        status.textContent = "Got it — I'll reply within 24 hours.";
        status.classList.add('is-success');
      }
      form.reset();
    });
  }
})();
