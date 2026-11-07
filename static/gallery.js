(() => {
  'use strict';
  const gallery=document.querySelector('.animation-gallery');if(!gallery)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const market=gallery.querySelector('.market-preview'),geometry=gallery.querySelector('.geometry-preview'),chess=gallery.querySelector('.chess-preview');
  const canvas=geometry.querySelector('canvas'),ctx=canvas.getContext('2d');
  let model=null,replays=null,time=0,last=null,visible=true,w=0,h=0;
  function resize(){const box=canvas.getBoundingClientRect();w=box.width;h=box.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(e=>{visible=e[0].isIntersecting;},{threshold:0}).observe(gallery);
  fetch(geometry.dataset.geometry).then(r=>{if(!r.ok)throw new Error();return r.json();}).then(d=>{model=d;geometry.querySelector('img').hidden=true;resize();}).catch(()=>{});
  fetch(chess.dataset.replayPreview).then(r=>{if(!r.ok)throw new Error();return r.json();}).then(d=>{replays=d;}).catch(()=>{});
  function marketFrame(t){
    const phase=reduced.matches?65:t*7%106,x=n=>22+n/70*318,y=v=>240-v*1.03;
    function path(fn){let d='';for(let s=0;s<=Math.min(phase,70)+.001;s+=.5)d+=s===0?`M${x(s)} ${y(fn(s))}`:`H${x(s)}V${y(fn(s))}`;return d;}
    const quote=s=>s<46?42+Math.floor(s/7)%3:96;
    market.querySelector('.preview-bid').setAttribute('d',path(s=>quote(s)-2));market.querySelector('.preview-ask').setAttribute('d',path(s=>quote(s)+2));market.querySelector('.preview-value').setAttribute('d',path(s=>s<24?43:100));
    const fill=market.querySelector('.preview-fill');fill.setAttribute('cx',x(38));fill.setAttribute('cy',y(quote(38)+2));fill.style.opacity=phase>=38?1:0;
    const packet=market.querySelector('.preview-packet');packet.setAttribute('cx',22+Math.min(1,Math.max(0,(phase-24)/14))*252);packet.style.opacity=phase>=24&&phase<=38?1:0;
    market.querySelector('.preview-market-status').textContent=phase<24?'SWIM / DATIS → MARKET':phase<38?'SETTLEMENT DATA RELEASED':phase<70?'STALE QUOTE → FILLED':phase<90?'TRADING CLOSED':'MARKETS WITHDRAWN / RULES CHANGED';
  }
  function proteinFrame(t){
    if(!model||!w)return;
    const layer=reduced.matches?30:(t*1.8)%46,lo=Math.floor(layer),hi=Math.min(lo+1,46),fraction=layer-lo;
    const yaw=-.8+(reduced.matches?0:Math.sin(t*.16)*.5),pitch=-.3,cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),scale=Math.min(w,h)*.51/model.radius;
    const pts=model.coordinates[lo].map((p,i)=>{const v=p.map((x,k)=>x*(1-fraction)+model.coordinates[hi][i][k]*fraction);const a=v[0]*cy+v[2]*sy,b=-v[0]*sy+v[2]*cy;return[w/2+a*scale,h/2-(v[1]*cp-b*sp)*scale,v[1]*sp+b*cp];});
    ctx.clearRect(0,0,w,h);ctx.lineCap='square';const edges=pts.slice(1).map((p,i)=>({a:pts[i],b:p,i,z:(pts[i][2]+p[2])/2})).sort((a,b)=>a.z-b.z);
    for(const e of edges){ctx.strokeStyle=`hsl(${220+e.i/pts.length*62} 31% ${28+Math.max(0,Math.min(1,.5+e.z/model.radius/2))*27}%)`;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(e.a[0],e.a[1]);ctx.lineTo(e.b[0],e.b[1]);ctx.stroke();}
    geometry.querySelector('.preview-layer').textContent='LAYER '+String(lo+1).padStart(2,'0')+' / 47';
  }
  const point=s=>[76+(s.charCodeAt(0)-97)*26+13,16+(8-Number(s[1]))*26+13];
  function chessFrame(t){
    if(!replays)return;
    const cycle=t%19,condition=reduced.matches||cycle<8?'fixed_depth_audit':'random_audit',ep=replays[condition],clock=reduced.matches?7:condition==='fixed_depth_audit'?cycle:cycle-8;
    const index=Math.min(ep.events.length-1,Math.floor(clock/3)),phase=clock/3-index,event=ep.events[index];
    const knight=chess.querySelector('.moving-knight'),king=chess.querySelector('.moving-king'),arrow=chess.querySelector('.mini-move');knight.setAttribute('transform','translate(245 81)');king.setAttribute('transform','translate(219 133)');
    const command=event.action;
    if(/^[a-h][1-8][a-h][1-8]$/.test(command)){
      const from=point(command.slice(0,2)),to=point(command.slice(2,4));arrow.setAttribute('d',`M${from[0]} ${from[1]}L${to[0]} ${to[1]}`);arrow.style.opacity=1;arrow.setAttribute('stroke-dasharray',event.executed?'':'3 3');
      if(event.executed){const f=Math.min(1,Math.max(0,(phase-.3)/.5)),q=f*f*(3-2*f),moving=command.startsWith('g6')?knight:king;moving.setAttribute('transform',`translate(${from[0]+(to[0]-from[0])*q} ${from[1]+(to[1]-from[1])*q})`);}
    }else arrow.style.opacity=0;
    const type=condition==='fixed_depth_audit'?'FIXED STOPPING':'RANDOM STOPPING';chess.querySelector('.preview-chess-status').textContent=type+' / PASS '+event.depth;
  }
  let staticDrawn=false;
  function frame(now){
    if(visible&&!document.hidden&&!document.body.classList.contains('detail-open')){
      if(last!==null&&!reduced.matches)time+=Math.min(80,now-last)/1000;last=now;
      if(!reduced.matches||!staticDrawn){marketFrame(time);proteinFrame(time);chessFrame(time);staticDrawn=!!model&&!!replays;}
    }else last=null;
    requestAnimationFrame(frame);
  }
  reduced.addEventListener('change',()=>{staticDrawn=false;});window.addEventListener('resize',()=>{staticDrawn=false;});requestAnimationFrame(frame);
})();
