(() => {
  'use strict';
  const modes = {
    gap: ['30-silencios-limpar', 'Limpar mantendo a duração', 'Silencie os intervalos detectados. Os clipes continuam inteiros e na mesma posição.', 'Limpeza dos silêncios: intervalos marcados na onda, com a duração preservada.'],
    close: ['31-silencios-encurtar', 'Encurtar as pausas', 'Retire os intervalos e aproxime os trechos. As faixas escolhidas acompanham os mesmos cortes; as demais ficam paradas.', 'Pausas encurtadas: o áudio foi dividido e os trechos restantes foram aproximados.']
  };
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-silence-view]');
    if (!button) return;
    const panel = document.getElementById('tool-panel');
    const mode = modes[button.dataset.silenceView];
    if (!panel || !mode) return;
    const [file, title, text, caption] = mode;
    const opener = panel.querySelector('[data-image]');
    const image = opener.querySelector('img');
    const src = `assets/screenshots/${file}.png`;
    opener.dataset.image = src;
    opener.dataset.caption = caption;
    opener.setAttribute('aria-label', `Ampliar: ${caption}`);
    image.src = src;
    image.alt = caption;
    panel.querySelector('figcaption').textContent = caption;
    document.getElementById('tool-title').textContent = title;
    document.getElementById('tool-text').textContent = text;
    panel.querySelectorAll('[data-silence-view]').forEach(el => el.setAttribute('aria-pressed', String(el === button)));
  });
})();
