const types = ['members', 'tasks', 'meetings', 'ideas', 'resources'];
const app = document.getElementById('app');
const sidebar = document.getElementById('sidebar');
const state = { data: {}, ideaTag: 'All', resourceType: 'All', search: '' };
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const route = () => (location.hash.slice(1) || '/').replace(/\/$/, '') || '/';
const link = url => /^https?:\/\//i.test(url || '') ? esc(url) : '#';
const label = value => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase());
const heading = (title, subtitle) => `<div class="page-head"><div><div class="eyebrow">CAPSTONE RESEARCH PROJECT · 2026</div><h1 class="page-title">${esc(title)}</h1><p class="page-subtitle">${esc(subtitle)}</p></div><a class="edit-cta" href="/admin/">Edit content ↗</a></div>`;

function dashboard() {
  const { members, tasks, ideas, resources, meetings } = state.data;
  const inProgress = tasks.filter(t => t.status === 'in-progress');
  const topIdeas = [...ideas].sort((a, b) => b.votes - a.votes).slice(0, 3);
  return `<section class="hero"><div class="hero-content"><div class="hero-meta">CAPSTONE RESEARCH PROJECT · 2026</div><h1>Vision Transformer<br><em>on FPGA</em></h1><p>Designing and implementing an efficient hardware accelerator for Vision Transformer inference on reconfigurable FPGA fabric.</p><div class="hero-meta">TEAM RESEARCH WIKI</div></div></section>
    <section class="stats" aria-label="Project statistics">
      <div class="stat"><strong>${members.length}</strong><span>Team members</span></div><div class="stat"><strong>${tasks.filter(t => t.status === 'done').length}/${tasks.length}</strong><span>Tasks done · ${inProgress.length} in progress</span></div><div class="stat"><strong>${ideas.length}</strong><span>Brainstorm ideas · ${ideas.filter(i => i.pinned).length} pinned</span></div><div class="stat"><strong>${resources.length}</strong><span>Research resources</span></div>
    </section><div class="grid-2"><section class="panel"><div class="section-head"><h2>Team Progress</h2><a href="#/members">View all →</a></div>${members.map(m => `<div class="member-mini"><div><strong>${esc(m.name)}</strong><br><small>${esc(m.role)}</small></div><b>${tasks.filter(t => t.memberId === m.id && t.status === 'done').length}/${tasks.filter(t => t.memberId === m.id).length}</b></div>`).join('')}</section>
    <section class="panel"><div class="section-head"><h2>Top Ideas</h2><a href="#/brainstorm">View board →</a></div>${topIdeas.map(i => `<div class="idea-mini"><span class="vote">▲ ${Number(i.votes) || 0}</span> &nbsp;${esc(i.title)}</div>`).join('')}</section>
    <section class="panel"><div class="section-head"><h2>Upcoming Meetings</h2><a href="#/calendar">Calendar →</a></div>${meetings.filter(m => m.date >= new Date().toISOString().slice(0, 10)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3).map(m => `<div class="task-mini">${esc(m.date)} · ${esc(m.title)}</div>`).join('') || '<div class="empty">No upcoming meetings</div>'}</section>
    <section class="panel"><div class="section-head"><h2>Quick Links</h2></div><div class="quick-links"><a href="#/members">Member Progress →</a><a href="#/brainstorm">Brainstorm Board →</a><a href="#/calendar">Meeting Calendar →</a><a href="#/resources">Research Resources →</a></div></section></div>`;
}

function members() {
  const { members, tasks } = state.data;
  return heading('Member Progress', 'Track individual tasks, roles, and research notes for each team member.') + `<div class="cards">${members.map(m => {
    const own = tasks.filter(t => t.memberId === m.id);
    return `<section class="card member-card"><div class="member-head"><div class="avatar">${esc(m.avatar || m.name.slice(0, 2).toUpperCase())}</div><div><h2>${esc(m.name)}</h2><p>${esc(m.role)}</p></div></div><p class="member-note">${esc(m.notes)}</p><div class="task-list"><div class="eyebrow">TASKS (${own.length})</div>${own.map(t => `<div class="task-row"><span>${esc(t.title)}</span><span class="tag">${esc(t.tag)}</span><span class="status ${t.status === 'done' ? 'done' : t.status === 'todo' ? 'todo' : ''}">${esc(t.status === 'in-progress' ? 'In Progress' : t.status === 'done' ? 'Done' : 'To Do')}</span></div>`).join('') || '<div class="empty">No tasks yet</div>'}</div></section>`;
  }).join('')}</div>`;
}

function brainstorm() {
  const ideas = [...state.data.ideas].sort((a, b) => Number(b.pinned) - Number(a.pinned) || Number(b.votes) - Number(a.votes));
  const tags = ['All', ...new Set(ideas.map(i => i.tag).filter(Boolean))];
  const visible = state.ideaTag === 'All' ? ideas : ideas.filter(i => i.tag === state.ideaTag);
  return heading('Brainstorm Board', 'Capture research ideas, hypotheses, and design directions.') + `<div class="toolbar">${tags.map(tag => `<button class="chip ${state.ideaTag === tag ? 'active' : ''}" data-idea-tag="${esc(tag)}" type="button">${esc(tag)}</button>`).join('')}</div><div class="ideas-grid">${visible.map(i => `<article class="card idea-card"><span class="pill">${esc(i.tag)}</span>${i.pinned ? '<span class="pinned">★ PINNED</span>' : ''}<h2>${esc(i.title)}</h2><p>${esc(i.description)}</p><div class="idea-meta"><span>${esc(i.author)} · ${esc((i.createdAt || '').slice(0, 10))}</span><span class="vote">▲ ${Number(i.votes) || 0} votes</span></div></article>`).join('') || '<div class="empty">No ideas in this category.</div>'}</div>`;
}

function calendar() {
  const meetings = [...state.data.meetings].sort((a, b) => a.date.localeCompare(b.date));
  return heading('Meeting Calendar', 'Meeting notes, attendees, and action items.') + `<div class="cards">${meetings.map(m => `<article class="card meeting"><div class="meeting-date">${esc(m.date)}</div><h2>${esc(m.title)}</h2>${m.notes ? `<p>${esc(m.notes)}</p>` : ''}<small>Attendees: ${esc((m.attendees || []).join(', '))}</small>${m.actionItems?.length ? `<h3>Action items</h3><ul>${m.actionItems.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}</article>`).join('') || '<div class="empty">No meetings yet.</div>'}</div>`;
}

function resources() {
  const all = state.data.resources;
  const types = ['All', ...new Set(all.map(r => r.type).filter(Boolean))];
  const visible = all.filter(r => (state.resourceType === 'All' || r.type === state.resourceType) && `${r.title} ${r.authors} ${r.description} ${(r.tags || []).join(' ')}`.toLowerCase().includes(state.search.toLowerCase()));
  return heading('Research Resources', 'Curated papers, videos, and tutorials on Vision Transformers and FPGA acceleration.') + `<input class="search" id="resource-search" type="search" placeholder="Search resources…" aria-label="Search resources" value="${esc(state.search)}"><div class="toolbar">${types.map(type => `<button class="chip ${state.resourceType === type ? 'active' : ''}" data-resource-type="${esc(type)}" type="button">${esc(label(type))} (${type === 'All' ? all.length : all.filter(r => r.type === type).length})</button>`).join('')}</div><div class="resources">${visible.map(r => `<article class="card resource"><span class="pill">${esc(label(r.type))}</span><h2><a href="${link(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)} ↗</a></h2><div class="resource-meta">${[r.authors, r.year, r.venue].filter(Boolean).map(esc).join(' · ')}</div>${r.description ? `<p>${esc(r.description)}</p>` : ''}${r.tags?.length ? `<div class="resource-tags">${r.tags.map(tag => `<span>${esc(tag)}</span>`).join('')}</div>` : ''}</article>`).join('') || '<div class="empty">No resources match your search.</div>'}</div>`;
}

const pages = { '/': ['Dashboard', dashboard], '/members': ['Member Progress', members], '/brainstorm': ['Brainstorm Board', brainstorm], '/calendar': ['Meeting Calendar', calendar], '/resources': ['Research Resources', resources] };
function render() {
  const path = route();
  const [title, component] = pages[path] || pages['/'];
  document.title = `${title} · ViT-FPGA Research Wiki`;
  document.getElementById('breadcrumb').textContent = `~/ ${title}`;
  document.querySelectorAll('[data-route]').forEach(a => a.classList.toggle('active', a.dataset.route === path));
  app.innerHTML = component();
  sidebar.classList.remove('open');
}

document.addEventListener('click', event => {
  const tag = event.target.closest('[data-idea-tag]');
  if (tag) { state.ideaTag = tag.dataset.ideaTag; render(); }
  const type = event.target.closest('[data-resource-type]');
  if (type) { state.resourceType = type.dataset.resourceType; render(); document.getElementById('resource-search')?.focus(); }
});
document.addEventListener('input', event => {
  if (event.target.id !== 'resource-search') return;
  state.search = event.target.value;
  const cursor = event.target.selectionStart;
  render();
  const input = document.getElementById('resource-search');
  input.focus(); input.setSelectionRange(cursor, cursor);
});
document.getElementById('menu-toggle').addEventListener('click', () => sidebar.classList.toggle('open'));
window.addEventListener('hashchange', render);

try {
  const responses = await Promise.all(types.map(type => fetch(`/data/${type}.json`, { cache: 'no-cache' })));
  if (responses.some(response => !response.ok)) throw new Error('A content file could not be loaded.');
  const rows = await Promise.all(responses.map(response => response.json()));
  state.data = Object.fromEntries(types.map((type, index) => [type, rows[index]]));
  render();
} catch (error) {
  app.innerHTML = `<div class="error">Unable to load wiki content. ${esc(error.message)}</div>`;
}
