(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const tabs = [...document.querySelectorAll('[data-project]')];
  const panels = [...document.querySelectorAll('[data-panel]')];
  function selectProject(slug, updateHash = false) {
    if (!tabs.some(tab => tab.dataset.project === slug)) return;
    tabs.forEach(tab => { const active = tab.dataset.project === slug; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    panels.forEach(panel => { panel.hidden = panel.dataset.panel !== slug; });
    document.querySelectorAll('video').forEach(video => { if (video.closest('[hidden]')) video.pause(); });
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
      if (index !== undefined) { event.preventDefault(); tabs[index].focus(); selectProject(tabs[index].dataset.project, true); }
    });
  });
  const fromHash = () => selectProject(location.hash.slice(1));
  if (tabs.length) { selectProject(tabs[0].dataset.project); fromHash(); window.addEventListener('hashchange', fromHash); }
  const projectIndex = document.querySelector('.project-index');
  const narrow = matchMedia('(max-width: 720px)');
  const orientTabs = () => projectIndex?.setAttribute('aria-orientation', narrow.matches ? 'horizontal' : 'vertical');
  orientTabs(); narrow.addEventListener('change', orientTabs);

  const market = document.querySelector('[data-demo="kalshi"]');
  if (market) {
    const slider = market.querySelector('#market-time');
    const play = market.querySelector('#market-play');
    let time = reducedMotion.matches ? 60 : 0, playing = false, lastFrame = null, inView = false, initialized = false;
    const quote = t => t < 28 ? 42 + Math.floor(t / 5) % 3 * .6 : 68 + Math.floor((t - 28) / 5) % 3 * .5;
    const price = t => t < 21 ? 42 + Math.sin(t * .7) * .7 : 69 + Math.sin(t * .6) * .9;
    const x = t => 40 + t / 60 * 582;
    const y = cents => 189 - (cents - 35) / 45 * 162;
    function path(fn, stepped = false) {
      let result = '';
      for (let t = 0; t <= time + .001; t += .2) {
        const px = x(t).toFixed(2), py = y(fn(t)).toFixed(2);
        result += t === 0 ? `M${px} ${py}` : stepped ? `H${px} V${py}` : `L${px} ${py}`;
      }
      return result;
    }
    function draw() {
      market.querySelector('.bid-path').setAttribute('d', path(t => quote(t) - 2, true));
      market.querySelector('.ask-path').setAttribute('d', path(t => quote(t) + 2, true));
      market.querySelector('.price-path').setAttribute('d', path(price));
      market.querySelector('.news-line').style.visibility = time >= 21 ? 'visible' : 'hidden';
      market.querySelector('.fill-dot').style.visibility = time >= 25 ? 'visible' : 'hidden';
      market.querySelector('.fill-dot').setAttribute('cx', x(25));
      market.querySelector('.fill-dot').setAttribute('cy', y(quote(25) + 2));
      const cursor = market.querySelector('.market-cursor'); cursor.setAttribute('x1', x(time)); cursor.setAttribute('x2', x(time));
      market.querySelector('.market-event').textContent = time < 21 ? 'Waiting for update' : time < 25 ? 'SWIM / DATIS update' : time < 28 ? 'Desk fills stale ask' : 'Market makers reprice';
      market.querySelector('#market-time-value').textContent = time.toFixed(1) + ' s';
      slider.value = String(time); slider.setAttribute('aria-valuetext', time.toFixed(1) + ' seconds');
      const phase = Math.min(1, Math.max(0, (time - 19) / 6));
      const packet = market.querySelector('.flow-packet');
      packet.setAttribute('cx', 125 + phase * 360); packet.setAttribute('cy', phase < .2 ? 39 + phase / .2 * 42 : 81);
      packet.style.visibility = time >= 19 && time <= 25 ? 'visible' : 'hidden';
    }
    function setPlaying(value) { playing = value; lastFrame = null; play.textContent = playing ? 'Pause Ⅱ' : 'Play ▶'; play.setAttribute('aria-label', playing ? 'Pause market animation' : 'Play market animation'); }
    play.addEventListener('click', () => { if (time >= 60) time = 0; setPlaying(!playing); draw(); });
    slider.addEventListener('input', () => { setPlaying(false); time = Number(slider.value); draw(); });
    const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; if (inView && !initialized) { initialized = true; if (!reducedMotion.matches) setPlaying(true); } }, {threshold: .1}); observer.observe(market);
    reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) setPlaying(false); });
    function animate(now) {
      if (playing && inView && !document.hidden && !market.closest('[hidden]')) {
        if (lastFrame !== null) time = Math.min(60, time + Math.min(100, now - lastFrame) / 1000 * 5);
        if (time >= 60) setPlaying(false);
        draw(); lastFrame = now;
      } else lastFrame = null;
      requestAnimationFrame(animate);
    }
    draw(); requestAnimationFrame(animate);
  }

  const esm = document.querySelector('[data-demo="esm"]');
  if (esm) {
    const video = esm.querySelector('video');
    const root = video.querySelector('source').getAttribute('src').replace('t1137s4.mp4', '');
    esm.querySelectorAll('[data-protein]').forEach(button => button.addEventListener('click', () => {
      const name = button.dataset.protein;
      const wasPlaying = !video.paused;
      video.pause();
      video.poster = root + name + '.jpg';
      video.src = root + name + '.mp4';
      video.setAttribute('aria-label', `${name === '8fmi' ? '8FMI' : 'T1137s4'} geometric readouts across ESMFold layers`);
      const download = esm.querySelector('.video-download'); download.href = root + name + '.mp4';
      const fallback = video.querySelector('a'); if (fallback) fallback.href = download.href;
      esm.querySelectorAll('[data-protein]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      video.load(); if (wasPlaying) video.play().catch(() => {});
    }));
  }

  const loops = document.querySelector('[data-demo="loops"]');
  if (loops) {
    let schedule = 'random';
    const probability = loops.querySelector('#stop-prob');
    const steps = loops.querySelector('.loop-steps');
    function drawLoops() {
      const q = Number(probability.value) / 100;
      const distribution = Array.from({length:8}, (_, i) => schedule === 'fixed' ? (i === 7 ? 1 : 0) : (i === 7 ? (1 - q) ** 7 : q * (1 - q) ** i));
      steps.replaceChildren(...distribution.map((p, i) => {
        const step = document.createElement('div'); step.className = 'loop-step';
        const space = document.createElement('div'); space.className = 'loop-bar-space';
        const bar = document.createElement('div'); bar.className = 'loop-bar'; bar.style.setProperty('--prob-height', `${p * 100}%`); space.append(bar);
        const number = document.createElement('div'); number.className = 'loop-step-number'; number.textContent = '↻ ' + (i + 1);
        const label = document.createElement('div'); label.className = 'loop-step-prob'; label.textContent = (p * 100).toFixed(1) + '%'; step.append(space, number, label); return step;
      }));
      steps.setAttribute('aria-label', distribution.map((p, i) => `Step ${i + 1}: ${(p * 100).toFixed(1)} percent`).join('; '));
      loops.querySelector('.expected-steps').textContent = distribution.reduce((sum, p, i) => sum + p * (i + 1), 0).toFixed(2);
      probability.disabled = schedule === 'fixed'; loops.querySelector('#stop-prob-value').textContent = schedule === 'fixed' ? 'Fixed at step 8' : Math.round(q * 100) + '%';
    }
    loops.querySelectorAll('[data-schedule]').forEach(button => button.addEventListener('click', () => { schedule = button.dataset.schedule; loops.querySelectorAll('[data-schedule]').forEach(b => b.setAttribute('aria-pressed', String(b === button))); drawLoops(); }));
    probability.addEventListener('input', drawLoops); drawLoops();
  }
  let glyphSeed = 0;
  document.getElementById('reseed')?.addEventListener('click', () => {
    glyphSeed++;
    document.querySelectorAll('.hero-art .glyph-item path').forEach((path, i) => {
      path.style.transform = `rotate(${(i * 67 + glyphSeed * 53) % 360}deg) scale(${.8 + ((i + glyphSeed) % 4) * .1})`;
      path.style.fill = (i + glyphSeed) % 5 === 0 ? 'var(--navy)' : 'var(--lavender)';
    });
  });
})();
