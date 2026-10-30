'use strict';
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.header');
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  const progressBar = document.createElement('span');
  progress.append(progressBar);
  document.body.append(progress);

  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.type = 'button';
  backToTop.setAttribute('aria-label', 'Back to top');
  backToTop.setAttribute('aria-hidden', 'true');
  backToTop.tabIndex = -1;
  backToTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 11 6-6 6 6M12 5v14"/></svg>';
  document.body.append(backToTop);
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
  });

  let queued = false;
  const updateScroll = () => {
    queued = false;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const amount = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
    progressBar.style.transform = `scaleX(${amount})`;
    header?.classList.toggle('is-scrolled', window.scrollY > 12);
    const showBack = window.scrollY > 550;
    backToTop.classList.toggle('is-visible', showBack);
    backToTop.setAttribute('aria-hidden', String(!showBack));
    backToTop.tabIndex = showBack ? 0 : -1;
    if (!showBack && document.activeElement === backToTop) backToTop.blur();
  };
  const queueScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(updateScroll);
  };
  window.addEventListener('scroll', queueScroll, { passive: true });
  window.addEventListener('resize', queueScroll, { passive: true });
  window.addEventListener('load', queueScroll, { once: true });
  document.querySelectorAll('.faq-list details').forEach(item => item.addEventListener('toggle', queueScroll));
  updateScroll();

  let observer;
  const revealAll = () => {
    observer?.disconnect();
    document.querySelectorAll('.reveal-pending').forEach(el => {
      el.classList.remove('reveal-pending');
      el.classList.add('is-visible');
    });
    document.querySelectorAll('.intro-reveal').forEach(el => el.classList.remove('intro-reveal'));
  };
  if (!reduceMotion.matches) {
    try {
      if (window.scrollY < 40 && !location.hash) {
        const intro = document.querySelector('.hero-inner, .page-hero-inner');
        intro?.querySelectorAll(':scope > .eyebrow, :scope > h1, :scope > .hero-copy, :scope > .lede, :scope > .actions').forEach((el, index) => {
          el.style.setProperty('--intro-delay', `${index * 105}ms`);
          el.classList.add('intro-reveal');
        });
      }
      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.remove('reveal-pending');
            entry.target.classList.add('is-visible');
            const target = entry.target;
            setTimeout(() => target.style.setProperty('--reveal-delay', '0ms'), 1000);
            observer.unobserve(entry.target);
          });
        }, { threshold: 0.05, rootMargin: '0px 0px 35px 0px' });
        const selector = '.section-heading, .service-card, .partnership-copy, .values article, .team-photo, .commitment-copy, .quote, .audience, .section-intro, .content-card, .numbered-step, .split-section > div, .editorial-photo, .page-cta, .info-panel, .contact-layout > div, .contact-form, .download-link, .faq-list details, .article-copy > h2, .article-copy > p, .legal-copy > h2, .legal-copy > p';
        const candidates = [...document.querySelectorAll(selector)];
        const targets = new Set(candidates);
        candidates.forEach(el => {
          // Animate a nested content block once, rather than moving parent and child together.
          for (let parent = el.parentElement; parent; parent = parent.parentElement) {
            if (targets.has(parent)) return;
          }
          const siblings = [...el.parentElement.children];
          const stagger = el.matches('.service-card, .content-card, .audience, .numbered-step, .values article');
          el.style.setProperty('--reveal-delay', `${stagger ? Math.min(siblings.indexOf(el), 4) * 65 : 0}ms`);
          el.classList.add('reveal', 'reveal-pending');
          observer.observe(el);
        });
      }
    } catch {
      // Motion is optional: every section stays readable if an enhancement fails.
      revealAll();
    }
  }
  reduceMotion.addEventListener('change', event => { if (event.matches) revealAll(); });
  window.addEventListener('beforeprint', revealAll);
})();
