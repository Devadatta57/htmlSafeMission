/* Small DOM helpers shared by the components. */
(function (SafeMission) {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 'smooth' unless the user asked the OS for less motion
  const scrollBehavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

  // Run `fn` at most once per animation frame
  const rafThrottle = (fn) => {
    let queued = false;
    return (...args) => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        fn(...args);
      });
    };
  };

  SafeMission.utils = { $, $$, prefersReducedMotion, scrollBehavior, rafThrottle };
})(window.SafeMission = window.SafeMission || {});
