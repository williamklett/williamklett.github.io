/* Progressive enhancement: static project write-ups remain readable without JS. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const tabs = [...document.querySelectorAll('[data-project]')];
  const panels = [...document.querySelectorAll('[data-panel]')];
  function selectProject(slug, updateHash = false) {
    if (!tabs.some(tab => tab.dataset.project === slug)) return;
    tabs.forEach(tab => {
      const active = tab.dataset.project === slug;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => { panel.hidden = panel.dataset.panel !== slug; });
    if (updateHash) history.replaceState(null, '', '#' + slug);
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectProject(tab.dataset.project, true));
    tab.addEventListener('keydown', event => {
      let index;
      if (['ArrowDown', 'ArrowRight'].includes(event.key)) index = (i + 1) % tabs.length;
      else if (['ArrowUp', 'ArrowLeft'].includes(event.key)) index = (i - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = tabs.length - 1;
      if (index !== undefined) {
        event.preventDefault();
        tabs[index].focus();
        selectProject(tabs[index].dataset.project, true);
      }
    });
  });
  const fromHash = () => {
    const slug = location.hash.slice(1);
    if (tabs.some(tab => tab.dataset.project === slug)) selectProject(slug);
  };
  if (tabs.length) {
    selectProject(tabs[0].dataset.project);
    fromHash();
    if (tabs.some(tab => tab.dataset.project === location.hash.slice(1))) document.getElementById('work').scrollIntoView();
    window.addEventListener('hashchange', fromHash);
  }
  const projectIndex = document.querySelector('.project-index');
  const narrow = matchMedia('(max-width: 720px)');
  const orientTabs = () => projectIndex?.setAttribute('aria-orientation', narrow.matches ? 'horizontal' : 'vertical');
  orientTabs(); narrow.addEventListener('change', orientTabs);

  const market = document.querySelector('[data-demo="kalshi"]');
  if (market) {
    let regime = 'temporary';
    const time = market.querySelector('#market-time');
    const price = t => regime === 'temporary'
      ? 50 + 18 * Math.exp(-t / 14) + 0.55 * Math.sin(t * .7) * (1 - Math.exp(-t / 5))
      : 68 + 1.7 * (1 - Math.exp(-t / 20)) + .45 * Math.sin(t * .5);
    const x = t => 44 + t / 60 * 462;
    const y = p => 170 - (p - 50) / 22 * 152;
    function drawMarket() {
      const t = Number(time.value);
      const p = price(t);
      const points = Array.from({length:121}, (_, i) => [x(i / 2), y(price(i / 2))]);
      market.querySelector('.market-path').setAttribute('d', points.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(2)} ${py.toFixed(2)}`).join(' '));
      const cursor = market.querySelector('.market-cursor');
      cursor.setAttribute('x1', x(t)); cursor.setAttribute('x2', x(t));
      const dot = market.querySelector('.market-dot');
      dot.setAttribute('cx', x(t)); dot.setAttribute('cy', y(p));
      market.querySelector('.market-price').textContent = p.toFixed(1) + '¢';
      market.querySelector('#market-time-value').textContent = t + ' s';
      time.setAttribute('aria-valuetext', `${t} seconds after the event; synthetic price ${p.toFixed(1)} cents`);
      market.querySelector('.regime-caption').textContent = regime === 'temporary'
        ? 'Temporary pressure dissipates; the price tends back toward its starting level.'
        : 'New information persists; the price settles around a different level.';
    }
    market.querySelectorAll('[data-regime]').forEach(button => button.addEventListener('click', () => {
      regime = button.dataset.regime;
      market.querySelectorAll('[data-regime]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      drawMarket();
    }));
    time.addEventListener('input', drawMarket); drawMarket();
  }

  const esm = document.querySelector('[data-demo="esm"]');
  if (esm) {
    const results = {
      full: [0.990701, 0.988812, 0.992759, 0.993626],
      human: [0.962287, 0.942236, 0.953230, 0.967168],
      difficult: [0.946360, 0.938072, 0.959428, 0.963647]
    };
    const notes = {
      full: 'Full TEST: 1,046 viral and 1,034 cellular proteins.',
      human: 'Human panel: only 38 negatives. Improvement intervals include zero.',
      difficult: 'Difficult cellular panel: 121 negatives. Improvement intervals include zero.'
    };
    const select = esm.querySelector('select');
    function drawESM() {
      const values = results[select.value];
      esm.querySelectorAll('.bar-row').forEach((row, i) => {
        row.querySelector('.bar-fill').style.width = ((values[i] - .9) / .1 * 100).toFixed(3) + '%';
        row.querySelector('output').textContent = values[i].toFixed(6);
      });
      const names = ['Final layer', '256 features', '1,024 features', 'All 48 layers'];
      esm.querySelector('.bar-chart').setAttribute('aria-label', names.map((name, i) => `${name}: ${values[i].toFixed(6)} AUROC`).join('; '));
      esm.querySelector('.result-note').textContent = notes[select.value];
    }
    select.addEventListener('change', drawESM); drawESM();
  }

  const loops = document.querySelector('[data-demo="loops"]');
  if (loops) {
    let schedule = 'random';
    const probability = loops.querySelector('#stop-prob');
    const steps = loops.querySelector('.loop-steps');
    function drawLoops() {
      const q = Number(probability.value) / 100;
      const distribution = Array.from({length:8}, (_, i) => schedule === 'fixed'
        ? (i === 7 ? 1 : 0)
        : (i === 7 ? (1 - q) ** 7 : q * (1 - q) ** i));
      steps.replaceChildren(...distribution.map((p, i) => {
        const step = document.createElement('div'); step.className = 'loop-step';
        const space = document.createElement('div'); space.className = 'loop-bar-space';
        const bar = document.createElement('div'); bar.className = 'loop-bar';
        bar.style.setProperty('--prob-height', `${p * 100}%`);
        space.append(bar);
        const number = document.createElement('div'); number.className = 'loop-step-number'; number.textContent = '↻ ' + (i + 1);
        const label = document.createElement('div'); label.className = 'loop-step-prob'; label.textContent = (p * 100).toFixed(1) + '%';
        step.append(space, number, label); return step;
      }));
      steps.setAttribute('aria-label', distribution.map((p, i) => `Step ${i + 1}: ${(p * 100).toFixed(1)} percent`).join('; '));
      loops.querySelector('.expected-steps').textContent = distribution.reduce((sum, p, i) => sum + p * (i + 1), 0).toFixed(2);
      probability.disabled = schedule === 'fixed';
      loops.querySelector('#stop-prob-value').textContent = schedule === 'fixed' ? 'Fixed at step 8' : Math.round(q * 100) + '%';
      loops.querySelector('.loop-caption').textContent = schedule === 'fixed'
        ? 'Execution always happens at step 8. Earlier steps never determine the action in this sketch.'
        : 'Each intermediate step can become the action the system executes.';
    }
    loops.querySelectorAll('[data-schedule]').forEach(button => button.addEventListener('click', () => {
      schedule = button.dataset.schedule;
      loops.querySelectorAll('[data-schedule]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      drawLoops();
    }));
    probability.addEventListener('input', drawLoops); drawLoops();
  }

  let glyphSeed = 0;
  document.getElementById('reseed')?.addEventListener('click', () => {
    glyphSeed++;
    document.querySelectorAll('.hero-art .glyph-item path').forEach((path, i) => {
      path.style.transform = `rotate(${((i * 67 + glyphSeed * 53) % 360)}deg) scale(${.8 + ((i + glyphSeed) % 4) * .1})`;
      path.style.fill = (i + glyphSeed) % 5 === 0 ? 'var(--navy)' : 'var(--lavender)';
    });
  });
})();
