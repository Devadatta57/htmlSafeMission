/*
  Testimonials carousel: 3 cards visible on desktop, 2 on tablets, 1 on phones.
  Arrows wrap around; dots jump to a page; swipe and the arrow keys also move it.
*/
(function (SafeMission) {
  'use strict';

  const { $, $$ } = SafeMission.utils;

  const GAP = 20; // px between cards, matches --gap in testimonials.css
  const SWIPE_MIN = 50; // px of horizontal travel that counts as a swipe
  const PHONE = window.matchMedia('(max-width: 640px)');
  const TABLET = window.matchMedia('(max-width: 960px)');

  const visibleCards = () => (PHONE.matches ? 1 : TABLET.matches ? 2 : 3);

  function init() {
    const carousel = $('.testimonials-carousel');
    if (!carousel) return;

    const viewport = $('.testimonials-slider-viewport', carousel);
    const track = $('.testimonials-slider-track', carousel);
    const cards = $$('.testimonial-card', track);
    const dotsEl = $('.testimonials-dots', carousel);
    const prevBtn = $('.testimonials-arrow-left', carousel);
    const nextBtn = $('.testimonials-arrow-right', carousel);
    let index = 0;
    let visible = visibleCards();
    let touchStartX = null;

    const maxIndex = () => Math.max(0, cards.length - visible);

    function renderDots() {
      const pages = maxIndex() + 1;
      dotsEl.replaceChildren(
        ...Array.from({ length: pages }, (_, i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'testimonials-dot';
          dot.setAttribute('aria-label', `Show testimonials page ${i + 1} of ${pages}`);
          dot.addEventListener('click', () => goTo(i));
          return dot;
        })
      );
    }

    function update() {
      carousel.style.setProperty('--visible-cards', visible);
      track.style.transform = `translateX(calc(-${index} * ((100% - ${visible - 1} * ${GAP}px) / ${visible} + ${GAP}px)))`;
      $$('.testimonials-dot', dotsEl).forEach((dot, i) => {
        if (i === index) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      // Cards outside the window are hidden from screen readers and keyboard focus
      cards.forEach((card, i) => {
        const shown = i >= index && i < index + visible;
        card.setAttribute('aria-hidden', String(!shown));
        if ('inert' in card) card.inert = !shown;
      });
    }

    function goTo(i) {
      index = Math.min(Math.max(i, 0), maxIndex());
      update();
    }

    const prev = () => goTo(index > 0 ? index - 1 : maxIndex());
    const next = () => goTo(index < maxIndex() ? index + 1 : 0);

    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    carousel.addEventListener('keydown', (event) => {
      if (event.target.closest('input, textarea, select')) return;
      if (event.key === 'ArrowLeft') prev();
      else if (event.key === 'ArrowRight') next();
    });

    viewport.addEventListener(
      'touchstart',
      (event) => {
        touchStartX = event.touches[0].clientX;
      },
      { passive: true }
    );
    viewport.addEventListener('touchend', (event) => {
      if (touchStartX === null) return;
      const diff = touchStartX - event.changedTouches[0].clientX;
      if (diff > SWIPE_MIN) next();
      else if (diff < -SWIPE_MIN) prev();
      touchStartX = null;
    });

    function onBreakpoint() {
      visible = visibleCards();
      index = Math.min(index, maxIndex());
      renderDots();
      update();
    }
    [PHONE, TABLET].forEach((mq) => mq.addEventListener('change', onBreakpoint));

    onBreakpoint();
  }

  SafeMission.components = SafeMission.components || {};
  SafeMission.components.testimonials = { init };
})(window.SafeMission = window.SafeMission || {});
