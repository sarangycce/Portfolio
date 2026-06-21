/* ============================================================
   SGEA — Forms JavaScript
   Contact form · Newsletter · Gated resource downloads
   ============================================================ */

(function () {
  'use strict';

  /* ── Validator helpers ──────────────────────────────────── */
  const validate = {
    required : v => v.trim().length > 0,
    email    : v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    phone    : v => v.trim().length === 0 || /^[\d\s\-+().]{7,20}$/.test(v.trim()),
    minLen   : (v, n) => v.trim().length >= n,
  };

  function setFieldState(field, ok, msg = '') {
    field.classList.toggle('error', !ok);
    let errEl = field.parentElement.querySelector('.form-error');
    if (!ok) {
      if (!errEl) {
        errEl = document.createElement('span');
        errEl.className = 'form-error';
        field.parentElement.appendChild(errEl);
      }
      errEl.textContent = msg;
    } else if (errEl) {
      errEl.remove();
    }
    return ok;
  }

  function validateField(field) {
    const v    = field.value;
    const type = field.dataset.validate || '';
    if (field.required && !validate.required(v)) return setFieldState(field, false, 'This field is required.');
    if (type === 'email'  && !validate.email(v))  return setFieldState(field, false, 'Enter a valid email address.');
    if (type === 'phone'  && !validate.phone(v))  return setFieldState(field, false, 'Enter a valid phone number.');
    if (type === 'min6'   && !validate.minLen(v,6))return setFieldState(field, false, 'Please provide more detail (min 6 chars).');
    return setFieldState(field, true);
  }

  /* ── Generic form setup ─────────────────────────────────── */
  function setupForm(formEl, onSuccess) {
    if (!formEl) return;
    const fields = formEl.querySelectorAll('input, textarea, select');

    // Live validation on blur
    fields.forEach(f => {
      f.addEventListener('blur', () => validateField(f));
      f.addEventListener('input', () => {
        if (f.classList.contains('error')) validateField(f);
      });
    });

    formEl.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      fields.forEach(f => { if (!validateField(f)) valid = false; });
      if (!valid) return;

      const btn = formEl.querySelector('[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spinSlow 1s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Sending…`;
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled  = false;
        formEl.reset();
        if (typeof onSuccess === 'function') onSuccess();
      }, 1800);
    });
  }

  /* ── Contact Form ───────────────────────────────────────── */
  setupForm(document.getElementById('contactForm'), () => {
    window.showToast?.('Thank you! Your message has been sent. Sarang will respond within 24 hours.');
    const successMsg = document.getElementById('contactSuccess');
    if (successMsg) successMsg.style.display = 'block';
  });

  /* ── Speaking Form ──────────────────────────────────────── */
  setupForm(document.getElementById('speakingForm'), () => {
    window.showToast?.('Thank you! Your speaking inquiry has been sent. Sarang will respond shortly.');
    const successMsg = document.getElementById('speakingSuccess');
    if (successMsg) successMsg.style.display = 'block';
  });

  /* ── Newsletter Forms ────────────────────────────────────── */
  document.querySelectorAll('.newsletter-form').forEach(form => {
    setupForm(form, () => {
      window.showToast?.('You\'re subscribed! Watch your inbox for engineering insights.');
    });
  });

  /* ── Gated Resource Download ─────────────────────────────── */
  const modal     = document.getElementById('downloadModal');
  const modalClose= document.getElementById('modalClose');
  const downloadForm = document.getElementById('downloadForm');

  function openModal(resourceTitle, resourceFile) {
    if (!modal) return;
    const titleEl = modal.querySelector('.modal-resource-title');
    if (titleEl) titleEl.textContent = resourceTitle;
    modal.dataset.file = resourceFile || '';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (modal) {
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    modalClose?.addEventListener('click', closeModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    setupForm(downloadForm, () => {
      closeModal();
      window.showToast?.('Your resource is ready! Check your email for the download link.');
    });
  }

  // Attach gated download buttons
  document.querySelectorAll('[data-gated-resource]').forEach(btn => {
    btn.addEventListener('click', () => {
      openModal(btn.dataset.gatedResource, btn.dataset.file || '');
    });
  });

  // Free download buttons
  document.querySelectorAll('[data-free-download]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.showToast?.('Your download is starting…');
    });
  });

  /* ── Consultation booking CTA ────────────────────────────── */
  document.querySelectorAll('[data-book-call]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById('booking');
      if (target) {
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      }
    });
  });

})();
