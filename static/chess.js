(() => {
  'use strict';
  const root=document.querySelector('[data-demo="chess"]'); if(!root)return;
  const board=root.querySelector('#chess-board'), slider=root.querySelector('#chess-time'), play=root.querySelector('#chess-play');
  const seedSelect=root.querySelector('#chess-seed'), positionSelect=root.querySelector('#chess-position');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'), ns='http://www.w3.org/2000/svg';
  let data=null, condition='fixed_depth_audit', seed=43, position=0, rollout=0, progress=0, episode=null, sourceBoard=null;
  let playing=false, visible=false, loading=false, last=null, pieces=[], moving=null, arrow=null, lastStatus='';
  const glyphs={K:'♚',Q:'♛',R:'♜',B:'♝',N:'♞',P:'♟'};
  const square=s=>({x:24+(s.charCodeAt(0)-97)*44+22,y:24+(8-Number(s[1]))*44+22});
  function node(tag,attrs={},text=''){const n=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(text)n.textContent=text;return n;}
  function boardSetup(fen){
    board.replaceChildren();pieces=[];
    const defs=node('defs'),marker=node('marker',{id:'chess-arrow',viewBox:'0 0 10 10',refX:8,refY:5,markerWidth:4,markerHeight:4,orient:'auto'});marker.append(node('path',{d:'M0 0L10 5L0 10Z',fill:'currentColor'}));defs.append(marker);board.append(defs);
    for(let r=0;r<8;r++)for(let f=0;f<8;f++)board.append(node('rect',{x:24+f*44,y:24+r*44,width:44,height:44,fill:(r+f)%2?'#344754':'#b2bdb7'}));
    for(let i=0;i<8;i++){board.append(node('text',{x:46+i*44,y:393,class:'board-label'},String.fromCharCode(97+i)));board.append(node('text',{x:11,y:51+i*44,class:'board-label'},String(8-i)));}
    arrow=node('path',{class:'chess-move-arrow','marker-end':'url(#chess-arrow)',fill:'none','stroke-width':3});board.append(arrow);
    fen.split(' ')[0].split('/').forEach((rank,r)=>{let f=0;for(const ch of rank){if(/\d/.test(ch)){f+=+ch;continue;}const at=String.fromCharCode(97+f)+(8-r),p=square(at);const el=node('text',{x:0,y:0,class:ch===ch.toUpperCase()?'chess-piece white-piece':'chess-piece black-piece',transform:`translate(${p.x} ${p.y})`},glyphs[ch.toUpperCase()]);board.append(el);pieces.push({at,p,el});f++;}});
    board.setAttribute('aria-label',`Saved test position ${position+1}, White to move. ${fen}`);
  }
  function formatBounds(pair){const a=(pair[0]*100).toFixed(2),b=(pair[1]*100).toFixed(2);return a===b?a+'%':a+'–'+b+'%';}
  function setPlaying(value){playing=value&&!!episode;last=null;play.textContent=playing?'Pause Ⅱ':'Play ▶';play.setAttribute('aria-label',playing?'Pause chess replay':'Play chess replay');}
  function choose(){
    if(!data)return;const run=data.runs[`${condition}-s${seed}`];sourceBoard=run.boards[position];episode=sourceBoard.episodes[rollout];progress=0;lastStatus='';setPlaying(false);boardSetup(sourceBoard.fen);
    root.querySelector('#chess-rollout').textContent=String(rollout+1).padStart(2,'0')+' / '+sourceBoard.episodes.length;
    root.querySelector('.chess-source').href=data.provenance.repository+'/blob/main/'+run.source;
    ['opponent','legal','rejected'].forEach(key=>root.querySelector('#chess-'+key).textContent=formatBounds(run.metrics[key]));
    root.querySelector('.chess-schedule').textContent=condition==='fixed_depth_audit'?'Pass 1 is inspected; pass 2 is executed.':condition==='random_audit'?'Each pass may be inspected or executed (p = ½).':'Random stopping, with no inspection penalty.';
    const track=root.querySelector('#chess-pass-track');track.replaceChildren(...episode.events.map(ev=>{const el=document.createElement('span');el.textContent=ev.depth;el.title='Reasoning pass '+ev.depth;return el;}));
    root.querySelectorAll('[data-condition]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.condition===condition)));
    draw();
  }
  async function load(){
    if(loading||data)return;loading=true;
    try{const response=await fetch(root.dataset.replays);if(!response.ok)throw new Error('Replay unavailable');data=await response.json();
      positionSelect.replaceChildren(...data.runs['fixed_depth_audit-s43'].boards.map((b,i)=>{const el=document.createElement('option');el.value=i;el.textContent=String(i+1).padStart(2,'0');return el;}));choose();
    }catch(e){root.querySelector('#chess-route').textContent='Replay could not load.';root.querySelector('#chess-verdict').textContent='Use the source link below, or press Play to retry.';}finally{loading=false;}
  }
  function draw(){
    if(!episode)return;
    const n=episode.events.length, scaled=progress/100*n, index=Math.min(n-1,Math.floor(scaled)), phase=progress===100?1:scaled-index, event=episode.events[index];
    const resolved=phase>=.5;
    root.querySelector('#chess-pass').textContent=`Pass ${event.depth}`;
    root.querySelector('#chess-command').textContent=event.action||'∅';
    const route=event.audit?'INSPECT':event.executed?'EXECUTE':'REJECT';
    root.querySelector('#chess-route').textContent=phase<.3?'PROPOSE → '+route:route;
    let verdict='White is instructed to move its own pieces.';
    if(resolved){
      if(event.audit)verdict=event.caught?'Opponent-piece proposal caught · −'+event.audit_penalty:event.verdict.syntax_valid?'Inspected · no penalty':'Malformed proposal · not flagged';
      else if(event.executed)verdict=(event.verdict.opponent_piece?'Opponent’s piece moved':event.verdict.legal?'Legal move':'Command executed')+' · '+(event.task_reward>=0?'+':'')+event.task_reward;
      else verdict='Command rejected · '+event.task_reward;
    }
    if(lastStatus!==verdict){root.querySelector('#chess-verdict').textContent=verdict;lastStatus=verdict;}
    root.querySelector('.chess-readout').dataset.verdict=resolved&&(event.caught||event.verdict.opponent_piece)?'flagged':resolved&&event.verdict.legal?'legal':'neutral';
    const reward=episode.events.slice(0,index).reduce((sum,e)=>sum+e.task_reward-e.audit_penalty,0)+(resolved?event.task_reward-event.audit_penalty:0);
    root.querySelector('#chess-reward').textContent=(reward>0?'+':'')+Number(reward.toFixed(2));
    root.querySelectorAll('#chess-pass-track span').forEach((el,i)=>el.classList.toggle('active',i===index));
    pieces.forEach(p=>{p.el.setAttribute('transform',`translate(${p.p.x} ${p.p.y})`);p.el.style.visibility='visible';});
    if(/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(event.action)){
      const from=square(event.action.slice(0,2)),to=square(event.action.slice(2,4));
      arrow.setAttribute('d',`M${from.x} ${from.y}L${to.x} ${to.y}`);arrow.style.visibility='visible';arrow.style.color=event.verdict.opponent_piece?'#ad537e':'#45757a';arrow.setAttribute('stroke','currentColor');arrow.setAttribute('stroke-dasharray',event.executed?'':'5 4');
      moving=pieces.find(p=>p.at===event.action.slice(0,2));
      if(event.executed&&moving){const t=Math.max(0,Math.min(1,(phase-.35)/.5)),ease=t*t*(3-2*t);moving.el.setAttribute('transform',`translate(${from.x+(to.x-from.x)*ease} ${from.y+(to.y-from.y)*ease})`);if(t===1)pieces.filter(p=>p!==moving&&p.at===event.action.slice(2,4)).forEach(p=>{p.el.style.visibility='hidden';});}
    }else arrow.style.visibility='hidden';
    slider.value=progress;slider.setAttribute('aria-valuetext',`Pass ${event.depth}, ${resolved?verdict:'proposal '+event.action}`);root.querySelector('#chess-time-value').textContent=Math.round(progress)+'%';
  }
  root.querySelectorAll('[data-condition]').forEach(b=>b.addEventListener('click',()=>{condition=b.dataset.condition;choose();}));
  seedSelect.addEventListener('change',()=>{seed=+seedSelect.value;choose();});positionSelect.addEventListener('change',()=>{position=+positionSelect.value;rollout=0;choose();});
  root.querySelector('#chess-next').addEventListener('click',()=>{if(!sourceBoard)return;rollout=(rollout+1)%sourceBoard.episodes.length;choose();});
  play.addEventListener('click',()=>{if(!data){load();return;}if(progress>=100)progress=0;setPlaying(!playing);draw();});
  slider.addEventListener('input',()=>{setPlaying(false);progress=+slider.value;draw();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)load();},{threshold:.1}).observe(root.querySelector('.chess-stage'));
  reduced.addEventListener('change',()=>{if(reduced.matches)setPlaying(false);});
  function frame(now){if(playing&&visible&&!document.hidden&&!root.closest('[hidden]')){if(last!==null)progress=Math.min(100,progress+Math.min(80,now-last)/1000*100/(episode.events.length*3));if(progress>=100)setPlaying(false);draw();last=now;}else last=null;requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
})();
