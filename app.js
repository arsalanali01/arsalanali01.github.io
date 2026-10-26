(() => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  menu?.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(expanded));
    nav.classList.toggle('open', expanded);
  });
  nav?.addEventListener('click', e => {
    if (e.target.closest('a')) { nav.classList.remove('open'); menu?.setAttribute('aria-expanded', 'false'); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav?.classList.contains('open')) { nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.focus(); }
  });
  const search = document.querySelector('#project-search');
  const filters = [...document.querySelectorAll('.filter-btn')];
  const cards = [...document.querySelectorAll('#project-library .project-card')];
  if (!cards.length) return;
  let category = 'All work';
  const apply = () => {
    const query = (search?.value || '').toLowerCase().trim();
    let count = 0;
    cards.forEach(card => {
      const show = (category === 'All work' || card.dataset.category === category) && (!query || card.dataset.search.includes(query));
      card.hidden = !show; if (show) count++;
    });
    document.querySelector('#result-count').textContent = `${count} project${count === 1 ? '' : 's'}${category === 'All work' ? '' : ' · ' + category}`;
    document.querySelector('#no-results').hidden = count !== 0;
  };
  filters.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.category;
    filters.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    apply();
  }));
  search?.addEventListener('input', apply);
  const params = new URLSearchParams(location.search);
  if (params.get('q') && search) search.value = params.get('q');
  apply();
})();
