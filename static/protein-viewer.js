(() => {
  'use strict';
  const root = document.querySelector('[data-demo="esm"]'); if (!root) return;
  const canvas = root.querySelector('canvas'), ctx = canvas.getContext('2d');
  const slider = root.querySelector('#protein-layer'), play = root.querySelector('#protein-play');
  const status = root.querySelector('#protein-loading'), reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const cache = new Map();
  let data = null, selected = 't1137s4', request = 0, layer = 1, yaw = -.8, pitch = -.3, zoom = 1;
  let playing = false, visible = false, started = false, last = null, dirty = true, drag = null, w = 0, h = 0;
  function setPlaying(value) { playing = value && !!data; last = null; play.textContent = playing ? 'Pause Ⅱ' : 'Play ▶'; play.setAttribute('aria-label', playing ? 'Pause protein layers' : 'Play protein layers'); }
  function resize() {
    const box = canvas.getBoundingClientRect(); if (!box.width || !box.height) return;
    w = box.width; h = box.height; const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); dirty = true;
  }
  new ResizeObserver(resize).observe(canvas);
  async function load(name) {
    selected = name; const id = ++request, resume = !started || playing;
    setPlaying(false); data = null; status.hidden = false; status.textContent = 'Loading geometry…';
    slider.disabled = play.disabled = true; dirty = true;
    root.querySelectorAll('[data-protein]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.protein === name)));
    root.querySelector('#protein-name').textContent = name === '8fmi' ? '8FMI' : 'T1137s4';
    root.querySelector('.video-download').href = root.dataset.mediaRoot + name + '.mp4';
    try {
      if (!cache.has(name)) cache.set(name, fetch(root.dataset.mediaRoot + name + '.json').then(r => { if (!r.ok) throw new Error('Geometry unavailable'); return r.json(); }).catch(e => { cache.delete(name); throw e; }));
      const result = await cache.get(name); if (id !== request) return;
      if (!result.coordinates?.length || result.coordinates.length !== result.layers.length || !result.radius) throw new Error('Invalid geometry');
      data = result; layer = data.layers[0]; slider.min = data.layers[0]; slider.max = data.layers.at(-1);
      slider.disabled = play.disabled = false; status.hidden = true;
      root.querySelector('#protein-count').textContent = `${data.layers.length} layers / ${data.residueCount} residues`;
      canvas.setAttribute('aria-label', `${data.name}, ${data.residueCount} residues. Drag or use arrow keys to rotate; plus and minus zoom.`);
      resize(); updateLayer(); if (resume && !reduced.matches) setPlaying(true); started = true;
    } catch (error) { if (id === request) { status.textContent = 'Geometry could not load. Select the protein to retry, or use the original video below.'; } }
  }
  function updateLayer() {
    if (!data) return;
    slider.value = layer; const text = Number(layer.toFixed(1)) + ' / ' + data.layers.at(-1);
    root.querySelector('#protein-layer-value').textContent = text;
    slider.setAttribute('aria-valuetext', `Layer ${layer.toFixed(1)} of ${data.layers.at(-1)}`); dirty = true;
  }
  function project(p) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const a = p[0] * cy + p[2] * sy, b = -p[0] * sy + p[2] * cy;
    const yy = p[1] * cp - b * sp, zz = p[1] * sp + b * cp;
    const scale = Math.min(w, h) * .4 / data.radius * zoom;
    return [w / 2 + a * scale, h / 2 - yy * scale, zz];
  }
  function trace(coords, ghost = false) {
    const points = coords.map(project), segments = points.slice(1).map((p, i) => ({a:points[i], b:p, i, z:(points[i][2]+p[2])/2})).sort((a,b) => a.z-b.z);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const s of segments) {
      const depth = Math.max(0, Math.min(1, .5 + s.z / data.radius / 2));
      ctx.strokeStyle = ghost ? 'rgba(66,44,85,.18)' : `hsl(${210 + s.i / points.length * 70} 35% ${25 + depth * 28}%)`;
      ctx.lineWidth = ghost ? 1 : 1.3 + depth * 1.4;
      ctx.beginPath(); ctx.moveTo(s.a[0],s.a[1]); ctx.lineTo(s.b[0],s.b[1]); ctx.stroke();
    }
    if (!ghost) {
      for (const index of [0, points.length-1]) { const p=points[index]; ctx.fillStyle=index===0?'#364e65':'#76518e';ctx.beginPath();ctx.arc(p[0],p[1],3,0,Math.PI*2);ctx.fill(); }
    }
  }
  function draw() {
    ctx.clearRect(0,0,w,h); if (!data || !w) return;
    const lo = Math.max(0, Math.min(data.layers.length-1, Math.floor(layer-data.layers[0]))), hi=Math.min(lo+1,data.layers.length-1), t=layer-data.layers[lo];
    const a=data.coordinates[lo], b=data.coordinates[hi];
    const points=a.map((p,i)=>p.map((value,k)=>value*(1-t)+b[i][k]*t));
    if (root.querySelector('#protein-ghost').checked) trace(data.coordinates.at(-1),true);
    trace(points);
  }
  root.querySelectorAll('[data-protein]').forEach(b=>b.addEventListener('click',()=>load(b.dataset.protein)));
  play.addEventListener('click',()=>{if(data && layer>=data.layers.at(-1))layer=data.layers[0];setPlaying(!playing);updateLayer();});
  slider.addEventListener('input',()=>{setPlaying(false);layer=+slider.value;updateLayer();});
  root.querySelector('#protein-reset').addEventListener('click',()=>{yaw=-.8;pitch=-.3;zoom=1;dirty=true;});
  root.querySelector('#protein-zoom-in').addEventListener('click',()=>{zoom=Math.min(3,zoom*1.25);dirty=true;});
  root.querySelector('#protein-zoom-out').addEventListener('click',()=>{zoom=Math.max(.45,zoom/1.25);dirty=true;});
  root.querySelector('#protein-ghost').addEventListener('change',()=>{dirty=true;});
  canvas.addEventListener('pointerdown',e=>{if(!data)return;drag={x:e.clientX,y:e.clientY,id:e.pointerId};canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});});
  canvas.addEventListener('pointermove',e=>{if(!drag || e.pointerId!==drag.id)return;yaw+=(e.clientX-drag.x)*.008;pitch+=(e.clientY-drag.y)*.008;drag.x=e.clientX;drag.y=e.clientY;dirty=true;});
  const release=()=>{drag=null;}; canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
  canvas.addEventListener('wheel',e=>{if(!data)return;e.preventDefault();zoom=Math.max(.45,Math.min(3,zoom*Math.exp(-e.deltaY*.0015)));dirty=true;},{passive:false});
  canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','0'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')yaw-=.15;if(e.key==='ArrowRight')yaw+=.15;if(e.key==='ArrowUp')pitch-=.15;if(e.key==='ArrowDown')pitch+=.15;if(e.key==='+'||e.key==='=')zoom=Math.min(3,zoom*1.1);if(e.key==='-')zoom=Math.max(.45,zoom/1.1);if(e.key==='0'){yaw=-.8;pitch=-.3;zoom=1;}dirty=true;});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible&&!started&&!data&&!cache.has(selected))load(selected);if(visible){resize();dirty=true;}},{threshold:.1}).observe(canvas);
  reduced.addEventListener('change',()=>{if(reduced.matches)setPlaying(false);});
  function frame(now){
    if(visible&&!document.hidden&&!root.closest('[hidden]')){
      if(playing&&data){if(last!==null)layer=Math.min(data.layers.at(-1),layer+Math.min(80,now-last)/1000*2);if(layer>=data.layers.at(-1))setPlaying(false);updateLayer();last=now;}
      else last=null;
      if(dirty){draw();dirty=false;}
    }else last=null;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
