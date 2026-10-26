(() => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const closeMenu = () => { nav?.classList.remove('open'); menu?.setAttribute('aria-expanded', 'false'); };
  menu?.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(expanded));
    nav?.classList.toggle('open', expanded);
  });
  nav?.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav?.classList.contains('open')) { closeMenu(); menu.focus(); }
  });
  const sections = [...document.querySelectorAll('#overview, #experience, #projects, #skills, #education, #contact')];
  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        nav?.querySelectorAll('[data-section]').forEach(link => {
          if (link.dataset.section === entry.target.id) link.setAttribute('aria-current','location');
          else link.removeAttribute('aria-current');
        });
      }
    }, {rootMargin:'-15% 0px -60% 0px',threshold:0});
    sections.forEach(section => observer.observe(section));
  }
  const library = document.querySelector('#project-library');
  if (!library) return;
  const search = document.querySelector('#project-search');
  const columns = [...library.querySelectorAll('.project-column')];
  const expanded = new Map();
  const apply = () => {
    const query = (search?.value || '').toLowerCase().trim();
    let total = 0;
    columns.forEach(column => {
      const items = [...column.querySelectorAll('.project-item')];
      const matches = items.filter(item => !query || item.dataset.search.includes(query));
      const isExpanded = expanded.get(column.dataset.group) || false;
      const visible = query || isExpanded ? matches : matches.slice(0,4);
      items.forEach(item => { item.hidden = !visible.includes(item); });
      column.querySelector('.column-count').textContent = `${matches.length} project${matches.length === 1 ? '' : 's'}`;
      column.querySelector('.column-empty').hidden = matches.length !== 0;
      const button = column.querySelector('.project-expand');
      button.hidden = Boolean(query) || matches.length <= 4;
      button.setAttribute('aria-expanded', String(isExpanded));
      button.textContent = isExpanded ? `Show fewer ${column.dataset.group.toLowerCase()} projects` : `Show all ${matches.length} ${column.dataset.group.toLowerCase()} projects`;
      total += matches.length;
    });
    document.querySelector('#result-count').textContent = `${total} project${total === 1 ? '' : 's'} across Work, School, and Personal`;
    document.querySelector('#no-results').hidden = total !== 0;
  };
  library.querySelectorAll('[data-expand]').forEach(button => button.addEventListener('click', () => {
    expanded.set(button.dataset.expand, !expanded.get(button.dataset.expand)); apply();
  }));
  search?.addEventListener('input', apply);
  const params = new URLSearchParams(location.search);
  if (params.get('q') && search) search.value = params.get('q');
  apply();
  const dialog = document.querySelector('#project-overview');
  const source = document.querySelector('#project-overview-data');
  if (!dialog || typeof dialog.showModal !== 'function' || !source) return;
  const projects = new Map(JSON.parse(source.textContent).map(p => [p.id,p]));
  let trigger;
  const fillText = (id, text) => { document.getElementById(id).textContent = text; };
  const openProject = (project, origin) => {
    trigger = origin;
    fillText('project-dialog-group', `${project.group} / Project overview`);
    fillText('project-dialog-title',project.short);
    fillText('project-dialog-meta',`${project.org} · ${project.date} · ${project.status}`);
    fillText('project-dialog-lead',project.lead);
    fillText('project-dialog-outcome',project.outcome);
    const list = document.getElementById('project-dialog-deliverables');
    list.replaceChildren(...project.deliverables.map(text => { const li=document.createElement('li'); li.textContent=text; return li; }));
    const tags=document.getElementById('project-dialog-tools');
    tags.replaceChildren(...project.tools.map(text => { const span=document.createElement('span'); span.className='tag'; span.textContent=text; return span; }));
    const picture=document.getElementById('project-dialog-image'); picture.replaceChildren();
    if(project.id==='iss-mimic') {
      const img=document.createElement('img'); img.src='assets/nbl-pool-panorama.jpg'; img.alt='NASA’s Neutral Buoyancy Laboratory pool';
      const credit=document.createElement('p'); credit.className='image-credit'; credit.textContent='NASA facility image · Reference photo of the NBL pool.';
      picture.append(img,credit);
    }
    document.getElementById('project-dialog-detail').href=`projects/${project.id}.html`;
    const related=document.getElementById('project-dialog-related');
    related.href=project.group==='Work'?'#experience':project.group==='School'?'#education':'#skills';
    related.textContent=project.group==='Work'?'Professional experience ↗':project.group==='School'?'Education & school work ↗':'Related skills ↗';
    document.body.classList.add('dialog-open'); dialog.showModal();
  };
  library.addEventListener('click', e => {
    const link=e.target.closest('[data-project-id]'); if(!link || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const project=projects.get(link.dataset.projectId); if(!project)return;
    e.preventDefault(); openProject(project,link);
  });
  dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{ document.body.classList.remove('dialog-open'); trigger?.focus({preventScroll:true}); });
  dialog.addEventListener('click',e=>{
    if(e.target!==dialog)return; const rect=dialog.getBoundingClientRect();
    if(e.clientX<rect.left || e.clientX>rect.right || e.clientY<rect.top || e.clientY>rect.bottom)dialog.close();
  });
  document.getElementById('project-dialog-related').addEventListener('click',()=>dialog.close());
})();
