document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  /* ---------- Header scroll state ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 24) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');

    var backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
      if (window.scrollY > 480) backToTop.classList.add('is-visible');
      else backToTop.classList.remove('is-visible');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var navMobile = document.querySelector('.nav-mobile');
  if (navToggle && navMobile) {
    navToggle.addEventListener('click', function () {
      var isOpen = navMobile.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    navMobile.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMobile.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Back to top ---------- */
  var backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('[data-counter]');
  if ('IntersectionObserver' in window && counters.length) {
    var counterIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterIo.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { counterIo.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = el.getAttribute('data-counter') + (el.getAttribute('data-suffix') || '');
    });
  }
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-counter'));
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  /* ---------- Contact form (submits to Formspree) ---------- */
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    var captchaLabel = form.querySelector('[data-captcha-label]');
    var captchaInput = form.querySelector('[data-captcha-input]');
    var captchaAnswer = 0;

    function newCaptcha() {
      var a = 1 + Math.floor(Math.random() * 9);
      var b = 1 + Math.floor(Math.random() * 9);
      captchaAnswer = a + b;
      if (captchaLabel) captchaLabel.textContent = '¿Cuánto es ' + a + ' + ' + b + '?';
      if (captchaInput) captchaInput.value = '';
    }
    newCaptcha();

    var submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        var wrap = field.closest('.field');
        var value = field.value.trim();
        var fieldValid = value.length > 0;
        if (field.type === 'email' && fieldValid) {
          fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }
        if (field === captchaInput) {
          fieldValid = parseInt(value, 10) === captchaAnswer;
        }
        if (wrap) wrap.classList.toggle('has-error', !fieldValid);
        if (!fieldValid) valid = false;
      });
      var success = form.querySelector('.form-success');
      var errorBanner = form.querySelector('.form-error');
      if (!valid) {
        newCaptcha();
        return;
      }

      var formData = new FormData(form);
      formData.delete('captcha');
      if (errorBanner) errorBanner.classList.remove('is-visible');
      if (submitBtn) submitBtn.disabled = true;

      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          if (success) {
            success.classList.add('is-visible');
            setTimeout(function () { success.classList.remove('is-visible'); }, 6000);
          }
          form.reset();
        } else {
          if (errorBanner) errorBanner.classList.add('is-visible');
        }
      }).catch(function () {
        if (errorBanner) errorBanner.classList.add('is-visible');
      }).finally(function () {
        newCaptcha();
        if (submitBtn) submitBtn.disabled = false;
      });
    });
    form.querySelectorAll('input, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        var wrap = field.closest('.field');
        if (wrap) wrap.classList.remove('has-error');
      });
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
