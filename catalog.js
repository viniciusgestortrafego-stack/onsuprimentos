(() => {
  'use strict';
  const products = window.ON_CATALOG || [];
  const byId = new Map(products.map(p => [p.id, p]));
  const selected = new Set();
  const search = document.getElementById('catalog-search');
  const category = document.getElementById('catalog-category');
  const grid = document.getElementById('product-grid');
  const count = document.getElementById('catalog-count');
  const more = document.getElementById('load-products');
  const selectedFilter = document.getElementById('show-selected');
  const pageSize = window.matchMedia('(max-width: 650px)').matches ? 8 : 12;
  let limit = pageSize, onlySelected = false;
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const titleCase = name => name.toLocaleLowerCase('pt-BR').replace(/(^|\s)(epi|pvc|eva|tnt|glp|abs|nrrsf|3m|din)(?=\s|$)/g, (_, space, word) => space + word.toUpperCase()).replace(/^./, ch => ch.toUpperCase());
  const element = (tag, className, text) => { const el = document.createElement(tag); if (className) el.className = className; if (text) el.textContent = text; return el; };
  [...new Set(products.map(p => p.category))].forEach(name => { const option = element('option', '', name); option.value = name; category.append(option); });
  function filtered() {
    const terms = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
    return products.filter(p => (!category.value || p.category === category.value) && (!onlySelected || selected.has(p.id)) && terms.every(term => normalize(p.name + ' ' + p.category).includes(term)));
  }
  function render() {
    const found = filtered();
    count.textContent = `${found.length} ${found.length === 1 ? 'produto encontrado' : 'produtos encontrados'} · ${Math.min(limit, found.length)} em exibição`;
    grid.replaceChildren();
    found.slice(0, limit).forEach(p => {
      const card = element('article', 'product-card');
      const img = document.createElement('img'); img.src = (window.ON_ASSET_BASE || '') + p.image; img.alt = titleCase(p.name); img.loading = 'lazy'; img.width = 340; img.height = 220;
      const body = element('div', 'product-body');
      const badge = element('p', 'product-category', p.category);
      const name = element('h3', '', titleCase(p.name));
      const label = element('label', 'product-select');
      const input = document.createElement('input'); input.type = 'checkbox'; input.checked = selected.has(p.id); input.dataset.productId = p.id; input.setAttribute('aria-label', `Selecionar ${titleCase(p.name)} para cotação`);
      label.append(input, element('span', '', input.checked ? 'Na sua lista' : 'Adicionar à lista'));
      body.append(badge, name, label); card.append(img, body); grid.append(card);
    });
    more.hidden = found.length <= limit;
    document.getElementById('catalog-empty').hidden = found.length > 0;
    selectedFilter.setAttribute('aria-pressed', String(onlySelected));
  }
  function updateList() {
    document.getElementById('selected-count').textContent = selected.size;
    document.getElementById('quote-list').hidden = selected.size === 0;
    const list = document.getElementById('selected-products'); list.replaceChildren();
    [...selected].forEach(id => {
      const p = byId.get(id); const li = element('li');
      const remove = element('button', 'text-button', 'Remover'); remove.type = 'button'; remove.dataset.removeId = id; remove.setAttribute('aria-label', `Remover ${titleCase(p.name)}`);
      li.append(element('span', '', titleCase(p.name)), remove); list.append(li);
    });
    document.getElementById('quote-text').value = 'Olá! Gostaria de uma cotação para os seguintes itens:\n\n' + [...selected].map(id => '• ' + titleCase(byId.get(id).name)).join('\n') + '\n\nQuantidades e tamanhos:\nCidade de entrega:';
    document.getElementById('selection-status').textContent = selected.size ? `${selected.size} ${selected.size === 1 ? 'item selecionado' : 'itens selecionados'}.` : '';
  }
  grid.addEventListener('change', event => {
    const id = event.target.dataset.productId; if (!byId.has(id)) return;
    if (event.target.checked) selected.add(id); else selected.delete(id);
    event.target.nextElementSibling.textContent = event.target.checked ? 'Na sua lista' : 'Adicionar à lista';
    updateList(); if (onlySelected) render();
  });
  document.getElementById('selected-products').addEventListener('click', event => { const id = event.target.dataset.removeId; if (!id) return; selected.delete(id); updateList(); render(); });
  function reset() { search.value = ''; category.value = ''; onlySelected = false; limit = pageSize; render(); }
  document.getElementById('catalog-reset').addEventListener('click', reset);
  document.getElementById('empty-reset').addEventListener('click', reset);
  search.addEventListener('input', () => { limit = pageSize; render(); });
  category.addEventListener('change', () => { limit = pageSize; render(); });
  selectedFilter.addEventListener('click', () => { onlySelected = !onlySelected; limit = pageSize; render(); });
  more.addEventListener('click', () => { const previous = Math.min(limit, filtered().length); limit += pageSize; render(); const next = grid.children[previous]?.querySelector('input'); next?.focus({preventScroll:true}); });
  document.getElementById('clear-selection').addEventListener('click', () => { selected.clear(); onlySelected = false; updateList(); render(); });
  document.getElementById('copy-selection').addEventListener('click', async () => {
    const text = document.getElementById('quote-text'); const status = document.getElementById('selection-status');
    try { await navigator.clipboard.writeText(text.value); status.textContent = 'Lista copiada! Abra o WhatsApp e cole na conversa.'; }
    catch { text.focus(); text.select(); status.textContent = 'Selecione e copie a lista acima, depois cole na conversa do WhatsApp.'; }
  });
  document.querySelectorAll('[data-category]').forEach(link => link.addEventListener('click', () => { search.value = ''; onlySelected = false; category.value = link.dataset.category; limit = pageSize; render(); }));
  render(); updateList();
})();
