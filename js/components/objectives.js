/*
  Five Core Business Objectives: "Read More" opens the detail panel for that card
  (clicking it again, the close button or Escape hides it). The 01-05 stepper switches
  between objectives. Each card carries its detail content in a <template>.
*/
(function (SafeMission) {
  'use strict';

  const { $, $$, scrollBehavior } = SafeMission.utils;

  function init() {
    const section = $('#objectives');
    if (!section) return;

    const cards = $$('.obj-card', section);
    const panel = $('#objective-detail', section);
    const heading = $('.detail-heading', panel);
    const photo = $('.detail-middle-photo', panel);
    const bullets = $('.detail-right-col', panel);
    const steps = $$('.stepper-step', panel);
    const closeBtn = $('.obj-detail-close-btn', panel);
    let activeId = null;

    const cardById = (id) => cards.find((card) => card.dataset.objective === id);

    function render(id) {
      const card = cardById(id);
      const content = $('.obj-detail-template', card).content;
      const cardImg = $('.obj-image', card);

      heading.replaceChildren(...$('[data-slot="heading"]', content).cloneNode(true).childNodes);
      photo.src = cardImg.src;
      photo.alt = $('.obj-card-title', card).textContent;
      bullets.replaceChildren($('[data-slot="bullets"]', content).cloneNode(true));

      cards.forEach((c) => {
        const isActive = c === card;
        const btn = $('.btn-read-more', c);
        c.classList.toggle('card-selected', isActive);
        btn.classList.toggle('active-read', isActive);
        btn.setAttribute('aria-expanded', String(isActive));
      });
      steps.forEach((step) => {
        const isActive = step.dataset.objective === id;
        step.classList.toggle('step-active', isActive);
        step.setAttribute('aria-pressed', String(isActive));
      });
    }

    function open(id, { scroll = true } = {}) {
      activeId = id;
      render(id);
      panel.hidden = false;
      section.classList.add('has-active-detail');
      if (scroll) {
        setTimeout(() => panel.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' }), 60);
      }
    }

    function close({ restoreFocus = false } = {}) {
      if (activeId === null) return;
      const card = cardById(activeId);
      activeId = null;
      panel.hidden = true;
      section.classList.remove('has-active-detail');
      cards.forEach((c) => {
        const btn = $('.btn-read-more', c);
        c.classList.remove('card-selected');
        btn.classList.remove('active-read');
        btn.setAttribute('aria-expanded', 'false');
      });
      if (restoreFocus && card) $('.btn-read-more', card).focus();
    }

    cards.forEach((card) => {
      $('.btn-read-more', card).addEventListener('click', () => {
        if (activeId === card.dataset.objective) close();
        else open(card.dataset.objective);
      });
    });

    steps.forEach((step) => step.addEventListener('click', () => open(step.dataset.objective, { scroll: false })));
    closeBtn.addEventListener('click', () => close({ restoreFocus: true }));
    panel.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close({ restoreFocus: true });
    });
  }

  SafeMission.components = SafeMission.components || {};
  SafeMission.components.objectives = { init };
})(window.SafeMission = window.SafeMission || {});
