const types = ['members', 'tasks', 'meetings', 'ideas', 'resources', 'updates', 'files', 'schedule'];
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
  const currentTasks = tasks.filter(t => !t.archived);
  const inProgress = currentTasks.filter(t => t.status === 'in-progress');
  const topIdeas = [...ideas].sort((a, b) => b.votes - a.votes).slice(0, 3);
  return `<section class="hero"><div class="hero-content"><div class="hero-meta">CAPSTONE RESEARCH PROJECT · 2026</div><h1>Vision Transformer<br><em>on FPGA</em></h1><p>Designing and implementing an efficient hardware accelerator for Vision Transformer inference on reconfigurable FPGA fabric.</p><div class="hero-meta">TEAM RESEARCH WIKI</div></div></section>
    <section class="stats" aria-label="Project statistics">
      <div class="stat"><strong>${members.length}</strong><span>Team members</span></div><div class="stat"><strong>${currentTasks.filter(t => t.status === 'done').length}/${currentTasks.length}</strong><span>Tasks done · ${inProgress.length} in progress</span></div><div class="stat"><strong>${ideas.length}</strong><span>Brainstorm ideas · ${ideas.filter(i => i.pinned).length} pinned</span></div><div class="stat"><strong>${resources.length}</strong><span>Research resources</span></div>
    </section><div class="grid-2"><section class="panel"><div class="section-head"><h2>Team Progress</h2><a href="#/members">View all →</a></div>${members.map(m => `<div class="member-mini"><div><strong>${esc(m.name)}</strong><br><small>${esc(m.role)}</small></div><b>${tasks.filter(t => !t.archived && t.memberId === m.id && t.status === 'done').length}/${tasks.filter(t => !t.archived && t.memberId === m.id).length}</b></div>`).join('')}</section>
    <section class="panel"><div class="section-head"><h2>Top Ideas</h2><a href="#/brainstorm">View board →</a></div>${topIdeas.map(i => `<div class="idea-mini"><span class="vote">▲ ${Number(i.votes) || 0}</span> &nbsp;${esc(i.title)}</div>`).join('')}</section>
    <section class="panel"><div class="section-head"><h2>Upcoming Meetings</h2><a href="#/calendar">Calendar →</a></div>${meetings.filter(m => m.date >= new Date().toISOString().slice(0, 10)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3).map(m => `<div class="task-mini">${esc(m.date)} · ${esc(m.title)}</div>`).join('') || '<div class="empty">No upcoming meetings</div>'}</section>
    <section class="panel"><div class="section-head"><h2>Quick Links</h2></div><div class="quick-links"><a href="#/members">Member Progress →</a><a href="#/updates">Dated Member Updates →</a><a href="#/files">ECE496 Files & Data →</a><a href="#/brainstorm">Brainstorm Board →</a><a href="#/calendar">Meeting Calendar →</a><a href="#/resources">Research Resources →</a></div></section></div>`;
}

function members() {
  const { members, tasks } = state.data;
  return heading('Member Progress', 'Track individual tasks, roles, and research notes for each team member.') + `<div class="cards">${members.map(m => {
    const own = tasks.filter(t => !t.archived && t.memberId === m.id);
    return `<section class="card member-card"><div class="member-head"><div class="avatar">${esc(m.avatar || m.name.slice(0, 2).toUpperCase())}</div><div><h2>${esc(m.name)}</h2><p>${esc(m.role)}</p></div></div><p class="member-note">${esc(m.notes)}</p><div class="task-list"><div class="eyebrow">TASKS (${own.length})</div>${own.map(t => `<div class="task-row"><span>${esc(t.title)}${t.acceptance ? `<small class="task-acceptance">${esc(t.acceptance)}</small>` : ''}</span><span class="tag">${esc(t.tag)}</span><span class="status ${t.status === 'done' ? 'done' : t.status === 'todo' ? 'todo' : ''}">${esc(t.status === 'in-progress' ? 'In Progress' : t.status === 'done' ? 'Done' : 'To Do')}</span></div>`).join('') || '<div class="empty">No tasks yet</div>'}</div></section>`;
  }).join('')}</div>`;
}

function brainstorm() {
  const ideas = [...state.data.ideas].sort((a, b) => Number(b.pinned) - Number(a.pinned) || Number(b.votes) - Number(a.votes));
  const tags = ['All', ...new Set(ideas.map(i => i.tag).filter(Boolean))];
  const visible = state.ideaTag === 'All' ? ideas : ideas.filter(i => i.tag === state.ideaTag);
  return heading('Brainstorm Board', 'Capture research ideas, hypotheses, and design directions.') + `<div class="toolbar">${tags.map(tag => `<button class="chip ${state.ideaTag === tag ? 'active' : ''}" data-idea-tag="${esc(tag)}" type="button">${esc(tag)}</button>`).join('')}</div><div class="ideas-grid">${visible.map(i => `<article class="card idea-card"><span class="pill">${esc(i.tag)}</span>${i.pinned ? '<span class="pinned">★ PINNED</span>' : ''}<h2>${esc(i.title)}</h2><p>${esc(i.description)}</p><div class="idea-meta"><span>${esc(i.author)} · ${esc((i.createdAt || '').slice(0, 10))}</span><span class="vote">▲ ${Number(i.votes) || 0} votes</span></div></article>`).join('') || '<div class="empty">No ideas in this category.</div>'}</div>`;
}

const meetingDraftKey = id => `vit-fpga:meeting-draft:${id}`;
function readDraft(id) {
  try { return JSON.parse(localStorage.getItem(meetingDraftKey(id)) || 'null'); } catch { return null; }
}
function meetingCard(m) {
  const draft = readDraft(m.id);
  return `<article class="card meeting"><div class="meeting-date">${esc(m.date || 'Date to be agreed')}${m.time ? ' · ' + esc(m.time) + ' ' + esc(m.timezone) : ''}</div><h3>${esc(m.title)}</h3><p class="published-notes">${esc(m.notes || 'No shared notes yet.')}</p><small>Recorded attendees: ${esc((m.attendees || []).join(', ') || 'Not recorded')}</small>${m.actionItems?.length ? `<h4>Shared action items</h4><ul>${m.actionItems.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}<details ${m.id === 'prof-betz-20261103' || m.id === 'internal-planning' ? 'open' : ''}><summary>Take notes</summary><form class="meeting-note-form" data-meeting-id="${esc(m.id)}"><label>Notes and decisions<textarea name="notes" rows="6">${esc(draft?.notes ?? m.notes ?? '')}</textarea></label><label>Action items — include owner and due date<textarea name="actions" rows="3">${esc(draft?.actions ?? (m.actionItems || []).join('\n'))}</textarea></label><div class="note-buttons"><button class="chip" type="button" data-save-meeting="${esc(m.id)}">Save browser draft</button><button class="chip" type="button" data-export-meeting="${esc(m.id)}">Download notes</button><a class="text-link" href="/admin/#/collections/meetings/entries/${encodeURIComponent(m.id)}">Edit shared notes ↗</a></div><p class="draft-status" role="status">${draft ? 'Draft saved in this browser. ' : ''}Shared notes are published through the team editor.</p></form></details></article>`;
}
function calendar() {
  const today = new Intl.DateTimeFormat('en-CA', {timeZone:'America/Toronto'}).format(new Date());
  const meetings = [...state.data.meetings].sort((a,b) => {
    if (!a.date || !b.date) return !a.date ? -1 : 1;
    const upcomingA=a.date>=today, upcomingB=b.date>=today;
    if (upcomingA!==upcomingB) return upcomingA ? -1 : 1;
    return upcomingA ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
  });
  const column = (type,title,subtitle) => `<section class="meeting-column"><div class="section-head"><div><h2>${title}</h2><p>${subtitle}</p></div><a class="text-link" href="/admin/#/collections/meetings/new">Add meeting ↗</a></div><div class="cards">${meetings.filter(m => m.type === type).map(meetingCard).join('') || '<p class="empty">No meetings yet.</p>'}</div></section>`;
  return heading('Meeting Calendar', 'Separate spaces for professor guidance and team coordination. Keep decisions and actions with each meeting.') + `<div class="meeting-columns">${column('professor','With Professor Betz','Every other Tuesday · 4 p.m. Toronto · from Nov 3, 2026')}${column('internal','Internal team meetings','Team-selected dates · integration blockers and next steps')}</div>`;
}
function gantt() {
  const months = ['Sep 2026','Oct','Nov','Dec','Jan 2027','Feb','Mar','Apr'];
  const groups = ['Baseline and profiling','Hardware development','Software and peripherals','System integration and testing','Milestones'];
  return heading('Gantt Chart', 'September 2026–April 2027 · implementation schedule and target milestones.') + `<p class="schedule-source">Transcribed from the supplied <strong>Inplementation Plan.docx</strong>. Bars show planned work windows, not completion. See <a href="#/updates">dated updates</a> for evidence. “Step” and “Tiff” in the source are Stephanie and Tiffany.</p><div class="gantt-scroll" role="region" aria-label="Project schedule" tabindex="0"><div class="gantt-table"><div class="gantt-label gantt-heading">Workstream / owner</div>${months.map((m,i) => `<div class="gantt-month ${i===2 ? 'current-month' : ''}">${m}</div>`).join('')}${groups.map(group => `<div class="gantt-group">${esc(group)}</div>${state.data.schedule.filter(r => r.group === group).sort((a,b) => a.startMonth-b.startMonth || a.title.localeCompare(b.title)).map(r => `<div class="gantt-label"><strong>${esc(r.title)}</strong><small>${esc(r.owner)}</small></div>${months.map((m,i) => `<div class="gantt-cell ${i===2?'current-month':''}">${i+1>=r.startMonth && i+1<=r.endMonth ? `<span class="${r.kind==='milestone'?'gantt-milestone':'gantt-bar'}" title="${esc(r.title)} · ${esc(r.owner)} · ${months[r.startMonth-1]}–${months[r.endMonth-1]}">${r.kind==='milestone'?'◆':'<span class="sr-only">Planned work</span>'}</span>` : ''}</div>`).join('')}`).join('')}`).join('')}</div></div><div class="panel schedule-note"><h2>Progress and planning notes</h2><p>The plan reports a GELU board-test pass; a linked test log is still needed. Standalone softmax passed simulation and timing near 90 MHz. Stephanie’s integrated model uses an 80 MHz full-SoC image and one selected offloaded operation; it does not establish full-model FPGA inference or consistent speedup.</p><p>February: hardware integration target · March: system prototype target · April: final demonstration. Future milestones remain planning targets.</p></div>`;
}

function resources() {
  const all = state.data.resources;
  const types = ['All', ...new Set(all.map(r => r.type).filter(Boolean))];
  const visible = all.filter(r => (state.resourceType === 'All' || r.type === state.resourceType) && `${r.title} ${r.authors} ${r.description} ${(r.tags || []).join(' ')}`.toLowerCase().includes(state.search.toLowerCase()));
  return heading('Research Resources', 'Curated papers, videos, and tutorials on Vision Transformers and FPGA acceleration.') + `<input class="search" id="resource-search" type="search" placeholder="Search resources…" aria-label="Search resources" value="${esc(state.search)}"><div class="toolbar">${types.map(type => `<button class="chip ${state.resourceType === type ? 'active' : ''}" data-resource-type="${esc(type)}" type="button">${esc(label(type))} (${type === 'All' ? all.length : all.filter(r => r.type === type).length})</button>`).join('')}</div><div class="resources">${visible.map(r => `<article class="card resource"><span class="pill">${esc(label(r.type))}</span><h2><a href="${link(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)} ↗</a></h2><div class="resource-meta">${[r.authors, r.year, r.venue].filter(Boolean).map(esc).join(' · ')}</div>${r.description ? `<p>${esc(r.description)}</p>` : ''}${r.tags?.length ? `<div class="resource-tags">${r.tags.map(tag => `<span>${esc(tag)}</span>`).join('')}</div>` : ''}</article>`).join('') || '<div class="empty">No resources match your search.</div>'}</div>`;
}

function updates() {
  return heading('Member Updates', 'Dated progress, blockers, next steps and evidence links for every member.') + state.data.members.map(member => `<section class="card"><h2>${esc(member.name)}</h2>${state.data.updates.filter(u => u.memberId === member.id).sort((a,b) => b.date.localeCompare(a.date) || Number(Boolean(b.evidenceReviewed))-Number(Boolean(a.evidenceReviewed))).map(u => `<article><h3>${esc(u.date)}${u.title ? ' · ' + esc(u.title) : ''}</h3><p>${esc(u.update)}</p>${(u.links || []).map(l => `<a href="${link(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`).join(' · ')}</article>`).join('') || '<p>No dated updates yet. Use Edit content → Member updates to add yours.</p>'}</section>`).join('');
}
function files() {
 return heading('ECE496 Files & Data', 'Deliverables, experiment data and demos. Add a file or shared link through Edit content.') + `<div class="cards">${state.data.files.map(f => `<article class="card"><h2><a href="${/^\/files\//.test(f.url) ? esc(f.url) : link(f.url)}" target="_blank" rel="noopener noreferrer">${esc(f.title)} ↗</a></h2><p>${esc(f.date)} · ${esc(f.owner)} · ${esc(f.status)}</p><p>${esc(f.description)}</p></article>`).join('')}</div>`;
}
const pages = { '/': ['Dashboard', dashboard], '/members': ['Member Progress', members], '/brainstorm': ['Brainstorm Board', brainstorm], '/calendar': ['Meeting Calendar', calendar], '/resources': ['Research Resources', resources], '/updates': ['Member Updates', updates], '/files': ['ECE496 Files & Data', files], '/gantt': ['Gantt Chart', gantt] };
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
document.addEventListener('click', event => {
  const button = event.target.closest('[data-save-meeting]');
  if (!button) return;
  const form = button.closest('form');
  const status = form.querySelector('[role="status"]');
  try {
    localStorage.setItem(meetingDraftKey(form.dataset.meetingId), JSON.stringify({ notes: form.elements.notes.value, actions: form.elements.actions.value, savedAt: new Date().toISOString() }));
    status.textContent = 'Draft saved in this browser. Use Edit shared notes to publish to the team.';
  } catch { status.textContent = 'Browser storage unavailable. Download notes to keep a copy.'; }
});
document.addEventListener('click', event => {
  const button = event.target.closest('[data-export-meeting]');
  if (!button) return;
  const form = button.closest('form');
  const meeting = state.data.meetings.find(m => m.id === button.dataset.exportMeeting);
  const text = `# ${meeting.title}\n\nDate: ${meeting.date || 'Unscheduled'}\n\n## Notes and decisions\n\n${form.elements.notes.value}\n\n## Action items\n\n${form.elements.actions.value}\n`;
  const url = URL.createObjectURL(new Blob([text], {type:'text/markdown'}));
  const a = document.createElement('a'); a.href=url; a.download=`${meeting.id}-notes.md`; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
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
