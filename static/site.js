(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const dialog=document.getElementById('project-detail');
  const links=[...document.querySelectorAll('[data-open-project]')];
  const panels=[...document.querySelectorAll('[data-detail]')];
  let opener=null, pushed=false;
  function show(slug,push=false){
    const panel=panels.find(p=>p.dataset.detail===slug);if(!panel)return false;
    panels.forEach(p=>p.hidden=p!==panel);
    const heading=panel.querySelector('h2');heading.id='heading-'+slug;dialog.setAttribute('aria-labelledby',heading.id);
    if(!dialog.open){dialog.showModal();document.body.classList.add('detail-open');}
    dialog.scrollTop=0;
    if(push){history.pushState({project:slug},'', '#'+slug);pushed=true;}
    return true;
  }
  function dismiss(updateHistory=true){
    if(!dialog?.open)return;dialog.close();document.body.classList.remove('detail-open');
    panels.forEach(p=>p.hidden=true);
    if(updateHistory){if(pushed){pushed=false;history.back();}else history.replaceState(null,'',location.pathname+location.search);}
    opener?.focus({preventScroll:true});
  }
  links.forEach(a=>a.addEventListener('click',event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();opener=a;show(a.dataset.openProject,true);}));
  document.getElementById('close-detail')?.addEventListener('click',()=>dismiss());
  dialog?.addEventListener('cancel',event=>{event.preventDefault();dismiss();});
  dialog?.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dismiss();}});
  window.addEventListener('popstate',()=>{pushed=false;if(!show(location.hash.slice(1)))dismiss(false);});
  if(dialog)show(location.hash.slice(1));
  let seed=0;
  document.getElementById('reseed')?.addEventListener('click',()=>{seed++;document.querySelectorAll('.hero-art .glyph-item path').forEach((p,i)=>{p.style.transform=`rotate(${(i*67+seed*53)%360}deg) scale(${.8+((i+seed)%4)*.1})`;p.style.fill=(i+seed)%5===0?'var(--navy)':'var(--lavender)';});});
})();
