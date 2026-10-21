(()=>{'use strict';
const $=id=>document.getElementById(id),steps=[...document.querySelectorAll('.step')],dialogs=[...document.querySelectorAll('dialog')];
const aliases={'por-etapas':['seu-jeito','hibrido'],'um-pedido':['seu-jeito','plena'],'na-pratica':['seu-jeito','mosaicos']};
let current=0,currentDetail='',detailHistory=[],returnFocus=null;
document.body.classList.add('js');
function pause(){document.querySelectorAll('video').forEach(v=>v.pause())}
function go(target,push=true){
 const alias=aliases[target];if(alias)target=alias[0];
 const n=typeof target==='number'?target:steps.findIndex(s=>s.id===target);if(n<0||n>=steps.length)return;
 pause();dialogs.forEach(d=>{if(d.open)d.close()});detailHistory=[];currentDetail='';
 const changed=n!==current;current=n;steps.forEach((s,i)=>{s.classList.toggle('active',i===n);s.setAttribute('aria-hidden',String(i!==n))});
 if(changed)steps[n].scrollTop=0;
 $('page-count').textContent=`${String(n+1).padStart(2,'0')} / ${String(steps.length).padStart(2,'0')}`;
 $('current-label').textContent=steps[n].getAttribute('aria-label');$('previous').disabled=n===0;$('next').disabled=n===steps.length-1;
 document.querySelectorAll('.progress button').forEach((b,i)=>{b.classList.toggle('active',i===n);b.classList.toggle('visited',i<n);if(i===n)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
 if(push&&location.hash!=='#'+steps[n].id)history.pushState(null,'','#'+steps[n].id);
 document.title=`Reagência — ${steps[n].getAttribute('aria-label')}`;
 $('announcement').textContent=`Página ${n+1} de ${steps.length}. ${steps[n].getAttribute('aria-label')}`;
 if(push)steps[n].focus({preventScroll:true});if(alias)openDetail(alias[1]);
}
function renderDetail(key){
 const t=$('detail-'+key);if(!t)return;
 currentDetail=key;$('detail-title').textContent=t.dataset.title;$('detail-content').replaceChildren(t.content.cloneNode(true));
 $('detail-dialog').dataset.case=String(['manual','hibrido','plena','conversa','mosaicos'].includes(key));
 $('detail-dialog').querySelector('.dialog-return button').textContent=detailHistory.length?'← Voltar ao resumo':'← Continuar a apresentação';
 $('detail-dialog').scrollTop=0;
}
function openDetail(key){
 if(!$('detail-'+key))return;pause();
 if($('detail-dialog').open){detailHistory.push({key:currentDetail,scroll:$('detail-dialog').scrollTop});renderDetail(key);$('detail-dialog').querySelector('.dialog-header>button').focus({preventScroll:true})}
 else{detailHistory=[];returnFocus=document.activeElement;renderDetail(key);$('detail-dialog').showModal()}
}
function backDetail(){
 pause();if(detailHistory.length){const prior=detailHistory.pop();renderDetail(prior.key);$('detail-dialog').scrollTop=prior.scroll;$('detail-dialog').querySelector('.dialog-header>button').focus({preventScroll:true})}
 else $('detail-dialog').close();
}
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-go],[data-detail],[data-close],[data-image],[data-mosaic],#play-mosaic,a[href^="#"]');if(!el)return;
 if(el.dataset.go){e.preventDefault();go(el.dataset.go)}
 else if(el.dataset.detail)openDetail(el.dataset.detail);
 else if(el.hasAttribute('data-close')){const dialog=el.closest('dialog');if(dialog.id==='detail-dialog'&&el.closest('.dialog-return'))backDetail();else dialog.close()}
 else if(el.dataset.image){pause();$('large-image').src=el.dataset.image;$('large-image').alt=el.dataset.caption||'';$('image-caption').textContent=el.dataset.caption||'';$('image-dialog').showModal()}
 else if(el.hasAttribute('data-mosaic'))selectMosaic(el);
 else if(el.id==='play-mosaic'){const v=$('proof-video');v.currentTime=0;v.play().catch(()=>v.focus())}
 else if(el.hash&&steps.some(s=>s.id===el.hash.slice(1))){e.preventDefault();go(el.hash.slice(1))}
});
$('previous').addEventListener('click',()=>go(current-1));$('next').addEventListener('click',()=>go(current+1));
$('open-index').addEventListener('click',()=>{pause();$('index-dialog').showModal()});
$('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{$('announcement').textContent='Use a tela cheia do navegador para ampliar.'}});
document.addEventListener('keydown',e=>{
 const tablist=e.target.closest('[role="tablist"]');
 if(tablist&&['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const tabs=[...tablist.querySelectorAll('[role="tab"]')],i=tabs.indexOf(document.activeElement),next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();tabs[next].click();return}
 if(dialogs.some(d=>d.open)||e.ctrlKey||e.altKey||e.metaKey||e.target.closest('video,input,textarea,[role="tablist"]'))return;
 if(['ArrowRight','PageDown'].includes(e.key)){e.preventDefault();go(current+1)}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(current-1)}
 if(e.key==='Home'){e.preventDefault();go(0)}if(e.key==='End'){e.preventDefault();go(steps.length-1)}
});
window.addEventListener('hashchange',()=>go(location.hash.slice(1),false));
window.addEventListener('popstate',()=>go(location.hash.slice(1)||0,false));
dialogs.forEach(d=>{d.addEventListener('close',()=>d.querySelectorAll('video').forEach(v=>v.pause()));d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom){if(d.id==='detail-dialog')backDetail();else d.close()}})});
$('detail-dialog').addEventListener('cancel',e=>{if(detailHistory.length){e.preventDefault();backDetail()}});
$('detail-dialog').addEventListener('close',()=>{if($('detail-dialog').open)return;detailHistory=[];currentDetail='';if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true})});
document.addEventListener('play',e=>{if(e.target.tagName==='VIDEO')document.querySelectorAll('video').forEach(v=>{if(v!==e.target)v.pause()})},true);
const mosaics=[{title:'Entrar grande.<br>Diminuir e encaixar.',text:'Cada imagem começa ampliada e ocupa seu lugar. As anteriores continuam visíveis.',frame:'070'},{title:'Mudar a ordem.<br>Manter o encaixe.',text:'As cinco imagens entram em outra sequência e por outras direções, até completar o quadro.',frame:'115'},{title:'Abrir pelo centro.<br>Ocupar a tela.',text:'Quatro imagens ficam ao redor. A quinta aparece no centro e se amplia até preencher a tela.',frame:'164'}];
function selectMosaic(button){
 const i=Number(button.dataset.mosaic),m=mosaics[i],v=$('proof-video');v.pause();v.poster=`../assets/caminho-da-luz/frame-${m.frame}.jpg`;v.src=`../assets/caminho-da-luz/mosaico-${i+1}.mp4`;v.load();v.setAttribute('aria-label',`Mosaico ${i+1} de Caminho da Luz`);
 $('request-title').innerHTML=m.title;$('request-copy').textContent=m.text;$('request-panel').setAttribute('aria-labelledby',button.id);
 document.querySelectorAll('[data-mosaic]').forEach(b=>{b.setAttribute('aria-selected',String(b===button));b.tabIndex=b===button?0:-1});
}
const initial=location.hash.slice(1);go(steps.some(s=>s.id===initial)||aliases[initial]?initial:0,false);
})();
