/*
  Hero tabs: highlight the clicked tab and scroll to its section
  (the tabs are links to #about, #objectives, #why and #how, so they also work without JS).
*/
(function (SafeMission) {
  'use strict';

  const { $$, scrollBehavior } = SafeMission.utils;

  function setActive(tabs, activeTab) {
    tabs.forEach((tab) => {
      const isActive = tab === activeTab;
      tab.classList.toggle('is-active', isActive);
      if (isActive) tab.setAttribute('aria-current', 'true');
      else tab.removeAttribute('aria-current');
    });
  }

  function goToSection(event, tabs, tab) {
    setActive(tabs, tab);
    const section = document.getElementById(tab.hash.slice(1));
    if (!section) return;
    event.preventDefault();
    section.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    // Move keyboard focus with the scroll, without a second jump
    if (!section.hasAttribute('tabindex')) section.setAttribute('tabindex', '-1');
    section.focus({ preventScroll: true });
  }

  function init() {
    const tabs = $$('.tab-btn');
    tabs.forEach((tab) => tab.addEventListener('click', (event) => goToSection(event, tabs, tab)));
  }

  SafeMission.components = SafeMission.components || {};
  SafeMission.components.tabs = { init };
})(window.SafeMission = window.SafeMission || {});
