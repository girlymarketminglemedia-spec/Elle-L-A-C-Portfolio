document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.floating-nav nav');
  const modals = [...document.querySelectorAll('.modal')];
  let lastFocusedElement = null;

  menuToggle?.addEventListener('click', () => {
    const open = nav?.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(Boolean(open)));
  });

  nav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.floating-nav nav a')];

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${entry.target.id}`
          );
        });
      });
    }, { threshold: 0.25 });

    sections.forEach(section => observer.observe(section));
  }

  function showModal(modal, trigger = null) {
    if (!modal) return;
    lastFocusedElement = trigger || document.activeElement;
    modals.forEach(item => {
      if (item !== modal) {
        item.classList.remove('open');
        item.setAttribute('aria-hidden', 'true');
      }
    });
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setTimeout(() => modal.querySelector('.modal-card')?.focus(), 0);
  }

  function hideModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    lastFocusedElement?.focus?.();
  }

  function syncModalFromHash() {
    const target = window.location.hash
      ? document.querySelector(window.location.hash)
      : null;

    if (target?.classList.contains('modal')) {
      showModal(target);
    } else {
      modals.forEach(modal => {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
      });
      document.body.classList.remove('modal-open');
    }
  }

  // Anchor links provide the no-JS fallback. JS only enhances focus and state.
  document.addEventListener('click', event => {
    const opener = event.target.closest('a[data-modal]');
    if (opener) {
      const modal = document.getElementById(opener.dataset.modal);
      showModal(modal, opener);
      return;
    }

    const closer = event.target.closest('[data-close]');
    if (closer) {
      const modal = closer.closest('.modal');
      hideModal(modal);
    }
  });

  window.addEventListener('hashchange', syncModalFromHash);
  syncModalFromHash();

  document.addEventListener('keydown', event => {
    const openModal = document.querySelector('.modal.open, .modal:target');

    if (event.key === 'Escape' && openModal) {
      event.preventDefault();
      hideModal(openModal);
      history.replaceState(null, '', '#work');
      document.getElementById('work')?.scrollIntoView();
    }
  });

  // Scroll-triggered reveal animations
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = [...document.querySelectorAll('.reveal')];

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  // Soft cursor trail — desktop with a fine pointer only, and only if motion is welcome
  const canUseCursorTrail = !prefersReducedMotion &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (canUseCursorTrail) {
    const dot = document.createElement('div');
    dot.className = 'cursor-glow';
    const trail = document.createElement('div');
    trail.className = 'cursor-glow trail';
    document.body.append(trail, dot);

    let mouseX = -100, mouseY = -100;
    let dotX = -100, dotY = -100;
    let trailX = -100, trailY = -100;
    let active = false;

    window.addEventListener('mousemove', event => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      active = true;
    });

    function animateCursor() {
      if (active) {
        dotX += (mouseX - dotX) * 0.35;
        dotY += (mouseY - dotY) * 0.35;
        trailX += (mouseX - trailX) * 0.12;
        trailY += (mouseY - trailY) * 0.12;
        dot.style.transform = `translate(${dotX - 11}px, ${dotY - 11}px)`;
        trail.style.transform = `translate(${trailX - 27}px, ${trailY - 27}px)`;
      }
      requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);
  }
});
