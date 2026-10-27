/*
  Entry point. Every script is loaded with `defer`, in order (data -> utils -> components ->
  main), so the DOM is parsed and all components are registered by the time this runs.
*/
(function (SafeMission) {
  'use strict';

  const { tabs, objectives, howJourney, joinForm, testimonials } = SafeMission.components;

  [tabs, objectives, howJourney, joinForm, testimonials].forEach((component) => {
    try {
      component.init();
    } catch (error) {
      // One broken component must not stop the others
      console.error(error);
    }
  });
})(window.SafeMission = window.SafeMission || {});
