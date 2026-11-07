(() => {
  'use strict';
  const root = document.querySelector('[data-demo="kalshi"]');
  if (!root) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const slider = root.querySelector('#market-time'), play = root.querySelector('#market-play');
  let time = reduced.matches ? 65 : 0, playing = false, visible = false, initialized = false, last = null;
  const x = t => 40 + t / 70 * 482, y = p => 175 - p * 1.5;
  const quote = t => t < 46 ? 42 + Math.floor(t / 6) % 3 : 96 + Math.floor(t / 6) % 2;
  function path(fn, stepped = false) {
    let d = '';
    for (let t = 0; t <= Math.min(time, 70) + .001; t += .2) {
      const px = x(t).toFixed(2), py = y(fn(t)).toFixed(2);
      d += t === 0 ? `M${px} ${py}` : stepped ? `H${px}V${py}` : `L${px} ${py}`;
    }
    return d;
  }
  const flows = [...root.querySelectorAll('.flow-graph')].map(svg => ({
    routes: [...svg.querySelectorAll('.packet-route')], packets: [...svg.querySelectorAll('.flow-packet')]
  }));
  function draw() {
    root.querySelector('.bid-path').setAttribute('d', path(t => quote(t) - 2, true));
    root.querySelector('.ask-path').setAttribute('d', path(t => quote(t) + 2, true));
    root.querySelector('.price-path').setAttribute('d', path(t => t < 24 ? 43 + Math.sin(t * .6) : 100, true));
    root.querySelector('.information-window').style.opacity = time >= 24 ? '.08' : '0';
    root.querySelector('.news-line').style.opacity = time >= 24 ? '.7' : '.15';
    const dot = root.querySelector('.fill-dot');
    dot.setAttribute('cx', x(38)); dot.setAttribute('cy', y(quote(38) + 2)); dot.style.visibility = time >= 38 ? 'visible' : 'hidden';
    const cursor = root.querySelector('.market-cursor'); cursor.setAttribute('x1', x(Math.min(time, 70))); cursor.setAttribute('x2', x(Math.min(time, 70)));
    root.querySelector('.market-closed').setAttribute('visibility', time >= 90 ? 'visible' : 'hidden');
    const event = time < 24 ? 'Trading open' : time < 30 ? 'Settlement temperature released' : time < 38 ? 'Parallel workers race' : time < 46 ? 'Desk fills stale quotes' : time < 70 ? 'Market makers reprice' : time < 90 ? 'Trading closes' : 'Markets withdrawn · rules changed';
    const label = root.querySelector('.market-event'); if (label.textContent !== event) label.textContent = event;
    root.querySelectorAll('.worker').forEach(node => node.classList.toggle('active', time >= 27 && time < 44));
    flows.forEach(({routes, packets}) => packets.forEach((packet, i) => {
      const progress = (time - 24 - i * .8) / (14 + i * 1.8);
      packet.style.visibility = progress >= 0 && progress <= 1 ? 'visible' : 'hidden';
      const point = routes[i].getPointAtLength(routes[i].getTotalLength() * Math.min(1, Math.max(0, progress)));
      packet.setAttribute('cx', point.x); packet.setAttribute('cy', point.y);
    }));
    slider.value = String(time); slider.setAttribute('aria-valuetext', event);
    root.querySelector('#market-time-value').textContent = Math.round(time) + '%';
  }
  function setPlaying(value) { playing = value; last = null; play.textContent = value ? 'Pause Ⅱ' : 'Play ▶'; play.setAttribute('aria-label', value ? 'Pause market animation' : 'Play market animation'); }
  play.addEventListener('click', () => { if (time >= 100) time = 0; setPlaying(!playing); draw(); });
  slider.addEventListener('input', () => { setPlaying(false); time = +slider.value; draw(); });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible && !initialized) { initialized = true; if (!reduced.matches) setPlaying(true); } }, {threshold:.15}).observe(root.querySelector('.market-instrument'));
  reduced.addEventListener('change', () => { if (reduced.matches) setPlaying(false); });
  function frame(now) {
    if (playing && visible && !document.hidden && !root.closest('[hidden]')) {
      if (last !== null) time = Math.min(100, time + Math.min(80, now - last) / 1000 * 6);
      if (time >= 100) setPlaying(false);
      draw(); last = now;
    } else last = null;
    requestAnimationFrame(frame);
  }
  draw(); requestAnimationFrame(frame);
})();
