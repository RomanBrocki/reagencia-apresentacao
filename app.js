(() => {
  'use strict';
  document.body.classList.remove('no-js');
  const slides = [...document.querySelectorAll('.slide')];
  const progress = [...document.querySelectorAll('.progress-segments button')];
  const dialogs = [...document.querySelectorAll('dialog')];
  let current = 0;
  const byId = id => document.getElementById(id);
  function pauseVideos() { document.querySelectorAll('video').forEach(v => v.pause()); }
  function go(target, writeHash = true) {
    let i = typeof target === 'number' ? target : slides.findIndex(s => s.id === target);
    if (i < 0 || i >= slides.length) return;
    pauseVideos();
    dialogs.forEach(d => d.open && d.close());
    const previous = current;
    current = i;
    slides.forEach((s, n) => { s.hidden = n !== i; s.classList.remove('entering'); });
    slides[i].classList.add('entering');
    if (previous !== i) slides[i].scrollTop = 0;
    byId('slide-number').textContent = `${String(i + 1).padStart(2, '0')} / ${slides.length}`;
    byId('chapter-label').textContent = slides[i].dataset.chapter;
    byId('previous').disabled = i === 0;
    byId('next').disabled = i === slides.length - 1;
    progress.forEach((b, n) => {
      b.classList.toggle('active', n === i);
      b.classList.toggle('visited', n < i);
      if (n === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    document.querySelectorAll('.index-grid [data-go]').forEach(b => b.setAttribute('aria-current', String(b.dataset.go === slides[i].id)));
    if (writeHash && location.hash !== '#' + slides[i].id) history.pushState(null, '', '#' + slides[i].id);
    document.title = `Reagência — ${slides[i].getAttribute('aria-label')}`;
    byId('announcement').textContent = `Página ${i + 1} de ${slides.length}. ${slides[i].getAttribute('aria-label')}`;
    if (writeHash) slides[i].focus({preventScroll:true});
  }
  function openDialog(id) {
    const d = byId(id);
    if (!d) return;
    d.showModal();
  }
  function openImage(src, caption) {
    byId('expanded-image').src = src;
    byId('expanded-image').alt = caption;
    byId('image-caption').textContent = caption;
    document.querySelector('.image-viewport').classList.remove('actual');
    byId('image-size').textContent = 'Tamanho real';
    openDialog('image-dialog');
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    } catch { byId('announcement').textContent = 'Use o modo de tela cheia do navegador para ampliar a apresentação.'; }
  }
  byId('previous').addEventListener('click', () => go(current - 1));
  byId('next').addEventListener('click', () => go(current + 1));
  byId('open-index').addEventListener('click', () => openDialog('index-dialog'));
  byId('chapter-button').addEventListener('click', () => openDialog('index-dialog'));
  byId('fullscreen').addEventListener('click', fullscreen);
  document.addEventListener('fullscreenchange', () => {
    byId('fullscreen').innerHTML = document.fullscreenElement ? 'Sair da tela cheia <span aria-hidden="true">⛶</span>' : 'Tela cheia <span aria-hidden="true">⛶</span>';
    byId('fullscreen').setAttribute('aria-label', document.fullscreenElement ? 'Sair da tela cheia' : 'Entrar em tela cheia');
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-go], [data-image], [data-dialog], [data-video], .close-dialog, a[href^="#"]');
    if (!b) return;
    if (b.dataset.go) { e.preventDefault(); go(b.dataset.go); }
    else if (b.dataset.image) openImage(b.dataset.image, b.dataset.caption || 'Captura do Reagência');
    else if (b.dataset.dialog) openDialog(b.dataset.dialog + '-dialog');
    else if (b.dataset.video) { openDialog('video-dialog'); byId('video-dialog').querySelector('video').play().catch(() => {}); }
    else if (b.classList.contains('close-dialog')) b.closest('dialog').close();
    else if (b.hash && slides.some(s => s.id === b.hash.slice(1))) { e.preventDefault(); go(b.hash.slice(1)); }
  });
  dialogs.forEach(d => {
    d.addEventListener('click', e => { if (e.target === d) { const r = d.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close(); } });
    d.addEventListener('close', () => d.querySelectorAll('video').forEach(v => v.pause()));
  });
  byId('image-size').addEventListener('click', () => {
    const actual = document.querySelector('.image-viewport').classList.toggle('actual');
    byId('image-size').textContent = actual ? 'Ajustar à tela' : 'Tamanho real';
  });
  document.addEventListener('keydown', e => {
    if (dialogs.some(d => d.open) || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest('input,textarea,select,video,[role="tablist"]')) return;
    if (['ArrowRight','PageDown'].includes(e.key)) { e.preventDefault(); go(current + 1); }
    if (['ArrowLeft','PageUp'].includes(e.key)) { e.preventDefault(); go(current - 1); }
    if (e.key === 'Home') { e.preventDefault(); go(0); }
    if (e.key === 'End') { e.preventDefault(); go(slides.length - 1); }
    if (e.key.toLowerCase() === 'f') { e.preventDefault(); fullscreen(); }
    if (e.key.toLowerCase() === 'm') { e.preventDefault(); openDialog('index-dialog'); }
  });
  window.addEventListener('hashchange', () => go(location.hash.slice(1), false));
  document.querySelectorAll('video').forEach(v => v.addEventListener('play', () => document.querySelectorAll('video').forEach(other => { if (other !== v) other.pause(); })));

  function selectTabs(list, chosen) {
    [...list.querySelectorAll('[role="tab"]')].forEach(t => { const selected = t === chosen; t.setAttribute('aria-selected', String(selected)); t.tabIndex = selected ? 0 : -1; });
  }
  document.querySelectorAll('[role="tablist"]').forEach(list => list.addEventListener('keydown', e => {
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key)) return;
    e.preventDefault(); e.stopPropagation();
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    let i = tabs.indexOf(document.activeElement);
    if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = tabs.length - 1;
    else i = (i + (['ArrowRight','ArrowDown'].includes(e.key) ? 1 : -1) + tabs.length) % tabs.length;
    tabs[i].focus(); tabs[i].click();
  }));
  const tools = [
    ['26-painel-transformar','Enquadramento, animação e cor','Recorte e enquadramento definem o quadro. Transformações e keyframes animam zoom, posição, rotação e opacidade. Contraste, saturação e sombras compõem a correção de cor.','Painel Transformar de um clipe selecionado.'],
    ['27-painel-mascaras','O que aparece em cada camada','Máscaras delimitam a área visível de uma camada com formas e recortes. O painel apresenta as opções disponíveis para a imagem selecionada.','Opções de máscaras de uma imagem selecionada.'],
    ['28-painel-efeitos','Opções para o acabamento','Os efeitos oferecem opções como desfoque, cor, distorção e textura. O painel reúne as categorias e os efeitos disponíveis para a imagem selecionada.','Categorias e opções de efeitos de uma imagem selecionada.']
  ];
  function changeEvidence(container, file, caption) {
    const src = 'assets/screenshots/' + file + '.png';
    const button = container.querySelector('[data-image]');
    button.dataset.image = src; button.dataset.caption = caption; button.setAttribute('aria-label', 'Ampliar: ' + caption);
    const img = button.querySelector('img'); img.src = src; img.alt = caption;
    container.querySelector('figcaption').textContent = caption;
  }
  document.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => {
    const [file,title,text,caption] = tools[Number(b.dataset.tool)];
    selectTabs(b.closest('[role="tablist"]'), b);
    byId('tool-panel').setAttribute('aria-labelledby', b.id);
    changeEvidence(byId('tool-panel'), file, caption);
    byId('tool-title').textContent = title; byId('tool-text').textContent = text;
  }));
  const bases = [['06-voz','Narração concluída com a voz Ash. A geração levou 11 segundos.'],['13-legendas','Transcrição concluída em 5 segundos, com 18 segmentos de legenda.']];
  document.querySelectorAll('[data-base]').forEach(b => b.addEventListener('click', () => {
    selectTabs(b.closest('[role="tablist"]'), b);
    byId('base-panel').setAttribute('aria-labelledby', b.id);
    changeEvidence(byId('base-panel'), ...bases[Number(b.dataset.base)]);
  }));
  const scenes = [
    ['02','O ponto de partida','Um homem tenta editar um vídeo, cansado, com uma xícara de café. Desenho animado, humor e quadro horizontal.',53],
    ['12','Recursos no mesmo lugar','O mesmo personagem reúne imagens, vídeo, áudio e legendas no editor. O pedido mantém personagem e estilo da referência.',96],
    ['24','Uma ideia ganha companhia','O homem tem uma ideia. Um pequeno assistente de IA aparece ao lado do editor, no estilo da imagem anterior.',84],
    ['35','Coedição em ação','Homem e assistente organizam as cenas juntos. Ele indica a intenção. A IA ajuda na montagem.',110],
    ['47','Da imaginação à cena','Uma aventura imaginada toma forma na tela com o apoio do assistente. A referência mantém a continuidade visual.',99],
    ['58','O criador rege','O homem segura uma batuta e rege imagens, música e cenas. O assistente acompanha o encerramento alegre e bem-humorado.',98]
  ];
  document.querySelectorAll('[data-scene]').forEach(b => b.addEventListener('click', () => {
    const i = Number(b.dataset.scene), [frame,title,desc,seconds] = scenes[i];
    selectTabs(b.closest('[role="tablist"]'), b);
    byId('scene-panel').setAttribute('aria-labelledby', b.id);
    byId('scene-preview').src = `assets/posters/hibrido-${frame}.jpg`;
    byId('scene-preview').alt = `Frame da cena ${i + 1} da produção híbrida: ${title}`;
    byId('scene-number').textContent = `CENA ${String(i+1).padStart(2,'0')} / 06`;
    byId('scene-title').textContent = title;
    byId('scene-text').textContent = desc;
    byId('scene-time').textContent = `Imagem gerada em ${seconds} segundos`;
    byId('scene-proof').dataset.image = `assets/screenshots/${String(i+7).padStart(2,'0')}-imagem-${i+1}.png`;
    byId('scene-proof').dataset.caption = `Geração da imagem ${i+1}${i ? ' usando a anterior como referência' : ' por texto'}, concluída em ${seconds} segundos.`;
  }));
  go(slides.some(s => s.id === location.hash.slice(1)) ? location.hash.slice(1) : 0, false);
})();
