/*
  How S.A.F.E. Mission Works - step journey board.

  - "Read more" / "Read less" opens a card in place; the rows below move with it.
  - Collapsed cards all share the tallest collapsed height (--collapsed-min).
  - Arrows from each step to the next are drawn in an SVG over the board, from the real
    card positions: straight across a gap between neighbours in a row, an elbow from the
    last card of a row down to the first card of the next row (straight down on phones).
  - One-time intro: the cards lift one after another the first time the board is seen.
*/
(function (SafeMission) {
  'use strict';

  const { $, $$, prefersReducedMotion } = SafeMission.utils;

  const BOARD_UNITS = 1500; // desktop board width in design units (see how.css)
  const DESKTOP = window.matchMedia('(min-width: 1024px)');
  const CARD_PULSE = 800; // ms a card stays lifted
  const PULSE_STEP = 650; // ms between one card and the next

  const round = (n) => Math.round(n * 100) / 100;

  /*
    Height of a card with one line of text, ignoring its min-height and any open/close
    animation: top border + everything down to the text + Read more + bottom padding/border.
    Uses offset* values, so hover / intro transforms do not affect it.
  */
  function collapsedHeight(card) {
    const cs = getComputedStyle(card);
    const desc = $('.how-card-desc', card);
    const toggle = $('.how-card-toggle', card);
    return (
      card.clientTop +
      desc.offsetTop +
      desc.offsetHeight +
      toggle.offsetHeight +
      parseFloat(cs.paddingBottom) +
      parseFloat(cs.borderBottomWidth)
    );
  }

  // Layout box of each step relative to the board, plus the height of the middle of its photo
  function stepBoxes(steps) {
    return steps.map((step) => {
      const card = $('.how-card', step);
      const img = $('.how-card-img', card);
      return {
        x: step.offsetLeft,
        y: step.offsetTop,
        w: step.offsetWidth,
        h: step.offsetHeight,
        photoMid: card.clientTop + img.offsetTop + img.offsetHeight / 2,
      };
    });
  }

  function buildArrows(boxes, s) {
    const sameLine = (a, b) => Math.abs(a.y - b.y) < 2;
    let markup = '';

    for (let i = 0; i < boxes.length - 1; i++) {
      const a = boxes[i];
      const b = boxes[i + 1];
      let d;
      let head;
      let start;

      if (sameLine(a, b)) {
        // Neighbours in a row: straight across the gap, level with the photos
        const y = a.y + a.photoMid;
        const sx = a.x + a.w + s.offset;
        const ex = b.x - s.offset;
        start = [sx, y];
        d = `M ${round(sx)} ${round(y)} H ${round(ex)}`;
        head = `M ${round(ex - s.head)} ${round(y - s.head)} L ${round(ex)} ${round(y)} L ${round(ex - s.head)} ${round(y + s.head)}`;
      } else {
        // Down to the next row, turning through the middle of the gap between the rows
        const lineBottom = Math.max(...boxes.filter((c) => sameLine(c, a)).map((c) => c.y + c.h));
        const sx = a.x + a.w / 2;
        const sy = a.y + a.h + s.offset;
        const ex = b.x + b.w / 2;
        const ey = b.y - s.offset;
        const gy = (lineBottom + b.y) / 2;
        start = [sx, sy];

        if (Math.abs(ex - sx) < 1) {
          d = `M ${round(sx)} ${round(sy)} V ${round(ey)}`;
        } else {
          const dir = ex < sx ? -1 : 1;
          const r = Math.max(0, Math.min(s.elbow, Math.abs(ex - sx) / 2, gy - sy, ey - gy));
          d = [
            `M ${round(sx)} ${round(sy)}`,
            `V ${round(gy - r)}`,
            `Q ${round(sx)} ${round(gy)} ${round(sx + dir * r)} ${round(gy)}`,
            `H ${round(ex - dir * r)}`,
            `Q ${round(ex)} ${round(gy)} ${round(ex)} ${round(gy + r)}`,
            `V ${round(ey)}`,
          ].join(' ');
        }
        head = `M ${round(ex - s.head)} ${round(ey - s.head)} L ${round(ex)} ${round(ey)} L ${round(ex + s.head)} ${round(ey - s.head)}`;
      }

      markup +=
        `<g class="how-arrow-link">` +
        `<circle cx="${round(start[0])}" cy="${round(start[1])}" r="${round(s.dot)}"/>` +
        `<path d="${d}" stroke-width="${round(s.line)}"/>` +
        `<path class="how-arrow-head" d="${head}" stroke-width="${round(s.headLine)}"/>` +
        `</g>`;
    }
    return markup;
  }

  function init() {
    const board = $('.how-board');
    if (!board) return;

    const svg = $('.how-arrows', board);
    const steps = $$('.how-step', board);
    const cards = steps.map((step) => $('.how-card', step));
    const collapsed = []; // collapsed height per card, px (kept while a card is open)
    let collapsedMin = -1;
    let boardWidth = 0;

    function drawArrows() {
      const width = board.clientWidth;
      const height = board.clientHeight;
      if (!width || !height) return;
      const u = width / BOARD_UNITS;
      // Arrow sizes: in board units on the desktop board, fixed px in the phone column
      const s = DESKTOP.matches
        ? { line: 3.6 * u, headLine: 4 * u, dot: 5 * u, head: 10 * u, offset: 10 * u, elbow: 26 * u }
        : { line: 2.6, headLine: 3, dot: 3.5, head: 7, offset: 6, elbow: 0 };
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.innerHTML = buildArrows(stepBoxes(steps), s);
    }

    function layout() {
      if (board.clientWidth !== boardWidth) {
        boardWidth = board.clientWidth;
        collapsed.length = 0; // new width: cached heights of open cards are out of date
      }
      cards.forEach((card, i) => {
        if (!card.hasAttribute('data-open')) collapsed[i] = collapsedHeight(card);
      });
      const min = Math.ceil(Math.max(0, ...collapsed.filter(Number.isFinite)));
      if (min !== collapsedMin) {
        collapsedMin = min;
        board.style.setProperty('--collapsed-min', `${min}px`);
      }
      drawArrows();
    }

    // Read more / Read less
    cards.forEach((card) => {
      const toggle = $('.how-card-toggle', card);
      const label = $('.how-toggle-label', toggle);
      toggle.addEventListener('click', () => {
        const open = !card.hasAttribute('data-open');
        card.toggleAttribute('data-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        label.textContent = open ? 'Read less' : 'Read more';
      });
    });

    // Re-layout in the same frame a card's text block changes size: board width, font load,
    // open / close animation. Only the text blocks are watched - their size never depends on
    // --collapsed-min, so setting it cannot trigger a ResizeObserver loop.
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(layout);
      cards.forEach((card) => ro.observe($('.how-card-info', card)));
    } else {
      window.addEventListener('resize', layout);
    }
    layout();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

    // Lift the cards one by one, once, the first time the steps scroll into view
    if (!prefersReducedMotion() && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          io.disconnect();
          steps.forEach((step, i) => {
            setTimeout(() => {
              step.classList.add('is-pulse');
              setTimeout(() => step.classList.remove('is-pulse'), CARD_PULSE);
            }, 300 + i * PULSE_STEP);
          });
        },
        { threshold: 0.5 }
      );
      io.observe(steps[0]);
    }
  }

  SafeMission.components = SafeMission.components || {};
  SafeMission.components.howJourney = { init };
})(window.SafeMission = window.SafeMission || {});
