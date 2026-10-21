(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const video = byId('luz-mosaic-video');
  if (!video) return;
  const base = 'assets/caminho-da-luz/';
  const mosaics = [
    { title:'Entrar grande.<br>Diminuir e encaixar.', kicker:'A OPERAÇÃO DESCRITA EM PALAVRAS', text:'Cada imagem começa ampliada e se acomoda no seu lugar. As anteriores permanecem visíveis.', range:'00:46–01:13 do vídeo', frames:['050','057','070'], labels:['A primeira imagem entra','A composição cresce','As cinco cenas se encontram'] },
    { title:'Mudar a ordem.<br>Manter o encaixe.', kicker:'OUTRA ORIENTAÇÃO, OUTRO RESULTADO', text:'As cinco imagens entram em outra sequência e por outras direções, até completar o quadro.', range:'01:34–01:57 do vídeo', frames:['096','104','115'], labels:['Outra direção de entrada','Os painéis se encontram','O quadro fica completo'] },
    { title:'Abrir pelo centro.<br>Ocupar a tela.', kicker:'UMA COMPOSIÇÃO MAIS ELABORADA', text:'Quatro imagens se posicionam ao redor. A quinta surge no centro e se amplia até ocupar a tela inteira.', range:'02:25–02:47 do vídeo', frames:['147','159','164'], labels:['As imagens ocupam os cantos','A quinta aparece no centro','A imagem preenche a tela'] }
  ];
  document.querySelectorAll('[data-mosaic]').forEach(button => button.addEventListener('click', () => {
    const i = Number(button.dataset.mosaic), data = mosaics[i];
    video.pause();
    video.poster = base + `frame-${data.frames[2]}.jpg`;
    video.src = base + `mosaico-${i+1}.mp4`;
    video.load();
    video.setAttribute('aria-label', `Trecho do mosaico ${i+1} de Caminho da Luz`);
    byId('luz-mosaic-title').innerHTML = data.title;
    byId('luz-mosaic-kicker').textContent = data.kicker;
    byId('luz-mosaic-copy').textContent = data.text;
    byId('luz-mosaic-range').textContent = data.range;
    byId('luz-mosaic-panel').setAttribute('aria-labelledby', button.id);
    document.querySelectorAll('[data-mosaic]').forEach(b => {
      const selected = b === button;
      b.setAttribute('aria-selected', String(selected)); b.tabIndex = selected ? 0 : -1;
    });
    data.frames.forEach((frame,n) => {
      const image = byId(`luz-moment-${n+1}`);
      image.src = base + `frame-${frame}.jpg`;
      image.alt = data.labels[n];
      byId(`luz-moment-label-${n+1}`).textContent = `0${n+1} · ${data.labels[n]}`;
    });
  }));
  byId('luz-replay').addEventListener('click', () => {
    video.currentTime = 0;
    video.play().catch(() => { video.focus(); });
  });
})();
