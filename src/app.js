import { prepareProjectUpdate, updateCategories } from './project-updates.js';
import { validateMeeting, publishMeeting } from './meeting-publishing.js';
import { validateUpdate, publishUpdate, signInWithGitHub } from './member-publishing.js';
const types = ['members', 'tasks', 'meetings', 'ideas', 'resources', 'updates', 'files', 'schedule'];
const app = document.getElementById('app');
const sidebar = document.getElementById('sidebar');
const state = { data: {}, ideaTag: 'All', resourceType: 'All', search: '', memberId: 'member-jc', githubToken: null, updateCategory: 'All' };
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const route = () => { const path = (location.hash.slice(1) || '/').replace(/\/$/, '') || '/'; return path; };
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
    <section class="panel"><div class="section-head"><h2>Quick Links</h2></div><div class="quick-links"><a href="#/members">Member Progress & Updates →</a><a href="#/updates">Results & Issues →</a><a href="#/files">ECE496 Files & Data →</a><a href="#/brainstorm">Brainstorm Board →</a><a href="#/calendar">Meeting Calendar →</a><a href="#/resources">Research Resources →</a></div></section></div>`;
}

const updateDraftKey = id => `vit-fpga:member-update:${id}`;
function readUpdateDraft(id) {
  try { return JSON.parse(localStorage.getItem(updateDraftKey(id)) || 'null'); } catch { return null; }
}
const torontoDate = () => new Intl.DateTimeFormat('en-CA', {timeZone:'America/Toronto'}).format(new Date());
function updateInput(form) {
  return {memberId:form.dataset.memberId, date:form.elements.date.value, title:form.elements.title.value, update:form.elements.update.value, links:form.elements.links.value.split('\n').map(s=>s.trim()).filter(Boolean).map(url=>({label:url,url}))};
}
function keepUpdateDraft(form, extra = {}) {
  const draft = {...updateInput(form), linkText:form.elements.links.value, ...extra};
  localStorage.setItem(updateDraftKey(form.dataset.memberId),JSON.stringify(draft));
  return draft;
}
function members() {
  const member = state.data.members.find(m => m.id === state.memberId) || state.data.members[0];
  const own = state.data.tasks.filter(t => !t.archived && t.memberId === member.id);
  const history = state.data.updates.filter(u => u.memberId === member.id).sort((a,b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || '') || Number(Boolean(b.evidenceReviewed))-Number(Boolean(a.evidenceReviewed)));
  const draft = readUpdateDraft(member.id);
  return heading('Member Progress & Updates', 'Current work and a dated changelog for every team member.') + `<div class="member-tabs" aria-label="Choose a member">${state.data.members.map(m => `<button class="chip ${m.id === member.id ? 'active' : ''}" data-member-id="${esc(m.id)}" aria-pressed="${m.id===member.id}">${esc(m.name)}</button>`).join('')}</div><section class="card member-card"><div class="member-head"><div class="avatar">${esc(member.avatar)}</div><div><h2>${esc(member.name)}</h2><p>${esc(member.role)}</p></div><span class="member-count">${own.filter(t=>t.status==='done').length}/${own.length} tasks complete · ${history.length} ${history.length===1?'update':'updates'}</span></div><p class="member-note">${esc(member.notes)}</p><details class="current-work"><summary>Current tasks (${own.length})</summary><div class="task-list">${own.map(t => `<div class="task-row"><span>${esc(t.title)}<small class="task-acceptance">${esc(t.acceptance)}</small></span><span class="tag">${esc(t.tag)}</span><span class="status ${t.status === 'done' ? 'done' : t.status === 'todo' ? 'todo' : ''}">${esc(label(t.status.replaceAll('-',' ')))}</span></div>`).join('')}</div></details></section><section class="card update-composer"><div class="section-head"><h2>Post an update</h2><span class="pill">${esc(member.name)}</span></div><form class="member-update-form" data-member-id="${esc(member.id)}"><div class="update-fields"><label>Date<input name="date" type="date" required value="${esc(draft?.date || torontoDate())}"></label><label>Update title<input name="title" required maxlength="160" placeholder="What changed?" value="${esc(draft?.title || '')}"></label></div><label>Update, blockers and next step<textarea name="update" rows="5" required maxlength="20000" placeholder="Describe progress, results, blockers and what comes next.">${esc(draft?.update || '')}</textarea></label><label>Evidence links — one URL per line<textarea name="links" rows="2" placeholder="https://github.com/…">${esc(draft?.linkText || '')}</textarea></label><div class="note-buttons"><button type="button" class="edit-cta" data-publish-update>${state.githubToken ? 'Publish update to GitHub' : 'Sign in & publish update'}</button><button type="button" class="chip" data-save-update>Save draft</button><button type="button" class="chip" data-discard-update>Discard draft</button>${state.githubToken ? '<button type="button" class="chip" data-signout-update>Sign out</button>' : ''}</div><p class="publish-hint">Publishing adds a new entry to the team’s Git history. Earlier updates stay in the history below.</p><p class="update-status" role="status">${draft ? 'Draft restored from this browser.' : 'Use your GitHub account with repository write access to publish.'}</p></form></section><section class="update-history"><div class="section-head"><h2>Update history</h2><a class="text-link" href="https://github.com/PlutoPuppy/vit-fpga-wiki/commits/main/content/updates" target="_blank" rel="noopener noreferrer">Git history ↗</a></div><ol class="update-timeline">${history.map((u,i) => `<li><article class="card update-entry"><div class="update-meta"><time datetime="${esc(u.date)}">${esc(u.date)}</time><span class="pill">${i===0?'Latest update':'Past update'}</span></div><h3>${esc(u.title || 'Progress update')}</h3>${u.measurement ? `<p class="result-value">${esc(u.measurement)}</p>` : ''}<p>${esc(u.update)}</p>${u.context ? `<details class="measurement-context"><summary>Measurement context / follow-up</summary><p>${esc(u.context)}</p></details>` : ''}${u.links?.length ? `<div class="evidence-links">${u.links.map(l => `<a href="${link(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)} ↗</a>`).join('')}</div>` : ''}<a class="text-link" href="${u.commitUrl ? link(u.commitUrl) : 'https://github.com/PlutoPuppy/vit-fpga-wiki/commits/main/content/updates/'+encodeURIComponent(u.id)+'.json'}" target="_blank" rel="noopener noreferrer">${u.commitSha ? esc(u.commitSha.slice(0,7)) : 'View Git history'} ↗</a></article></li>`).join('') || '<li class="empty">No updates yet. Post the first dated entry above.</li>'}</ol></section>`;
}

function localProjectUpdates() {
  try {return JSON.parse(localStorage.getItem('vit-fpga:local-project-updates') || '[]');} catch {return [];}
}
function projectUpdates() {
  const all=[...state.data.updates.filter(u=>u.scope==='project'),...localProjectUpdates()].sort((a,b)=>b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''));
  const visible=all.filter(u=>state.updateCategory==='All' || u.category===state.updateCategory);
  return heading('Project Updates', 'Results, issues and decisions from across the team.') + `<div class="project-updates-toolbar"><div class="toolbar">${['All',...updateCategories].map(category=>`<button class="chip ${state.updateCategory===category?'active':''}" data-project-category="${category}">${category}</button>`).join('')}</div><button class="edit-cta" type="button" data-add-project-update>+ Add update</button></div><div class="cards">${visible.map(u=>`<article class="card project-update"><div class="update-meta"><span class="pill">${esc(u.category)}</span><time datetime="${esc(u.date)}">${esc(u.date)}</time><span>${esc(state.data.members.find(m=>m.id===u.memberId)?.name || u.memberId)}</span>${u.localOnly?'<span class="pill">This browser only</span>':''}</div><h2>${esc(u.title)}</h2>${u.measurement?`<p class="result-value">${esc(u.measurement)}</p>`:''}<p class="project-update-body">${esc(u.update)}</p>${u.context?`<details class="measurement-context"><summary>Measurement context / follow-up</summary><p>${esc(u.context)}</p></details>`:''}<div class="evidence-links">${(u.links || []).map(l=>`<a href="${link(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)} ↗</a>`).join('')}</div>${u.localOnly?`<button type="button" class="chip" data-resume-project-update="${esc(u.id)}">Edit / publish</button> <button type="button" class="chip" data-remove-project-update="${esc(u.id)}">Remove local copy</button>`:`<a class="text-link" href="https://github.com/PlutoPuppy/vit-fpga-wiki/commits/main/content/updates/${encodeURIComponent(u.id)}.json" target="_blank" rel="noopener noreferrer">Git history ↗</a>`}</article>`).join('') || '<p class="empty">No updates in this category yet.</p>'}</div>`;
}
let projectPopupState=null;
function projectPopupInput(form) {
  const values=new FormData(form);
  return {memberId:values.get('memberId'),date:values.get('date'),category:values.get('category'),title:values.get('title'),measurement:values.get('measurement'),update:values.get('update'),context:values.get('context'),links:String(values.get('links')).split('\n').map(v=>v.trim()).filter(Boolean).map(url=>({label:url,url}))};
}
function openProjectUpdate(id) {
  document.getElementById('project-update-dialog')?.remove();
  let saved;try{saved=JSON.parse(localStorage.getItem('vit-fpga:project-update-popup') || 'null');}catch{}
  const initial=(id?localProjectUpdates().find(u=>u.id===id):saved) || {date:torontoDate(),memberId:'member-wn',category:'Result'};
  const dialog=document.createElement('dialog');dialog.id='project-update-dialog';dialog.className='meeting-dialog';dialog.setAttribute('aria-labelledby','project-update-title');
  dialog.innerHTML=`<div class="section-head"><h2 id="project-update-title">Add project update</h2><button class="chip" type="button" data-close-project-update aria-label="Close update popup">✕</button></div><form id="project-update-form"><div class="update-fields"><label>Reported by<select name="memberId">${state.data.members.map(m=>`<option value="${esc(m.id)}" ${initial.memberId===m.id?'selected':''}>${esc(m.name)}</option>`).join('')}</select></label><label>Date<input type="date" name="date" required value="${esc(initial.date)}"></label><label>Category<select name="category">${updateCategories.map(c=>`<option ${c===initial.category?'selected':''}>${c}</option>`).join('')}</select></label></div><label>Title<input name="title" required maxlength="160" value="${esc(initial.title || '')}" placeholder="e.g. NEON benchmark result"></label><label>Key result or value (optional)<input name="measurement" maxlength="200" value="${esc(initial.measurement || '')}" placeholder="e.g. 692 million arithmetic operations per second"></label><label>Update / what happened<textarea name="update" required maxlength="20000" rows="4">${esc(initial.update || '')}</textarea></label><label>Setup, limitations or next step (optional)<textarea name="context" maxlength="5000" rows="3" placeholder="Workload, precision, threads, clock, repeated runs, or what needs fixing">${esc(initial.context || '')}</textarea></label><label>Evidence links — one URL per line<textarea name="links" rows="2">${esc((initial.links || []).map(l=>l.url).join('\n'))}</textarea></label><div class="note-buttons"><button type="button" class="edit-cta" data-publish-project-update>Publish to team</button><button type="button" class="chip" data-local-project-update>Save in this browser</button><button type="button" class="chip" data-close-project-update>Cancel</button></div><p class="publish-hint">Team updates are saved to GitHub and also appear in the author’s member history. Browser-only updates stay on this device.</p><p class="update-status" role="status">${saved && !id?'Draft restored.':''}</p></form>`;
  projectPopupState={id:initial.id || `update-project-${crypto.randomUUID()}`,createdAt:initial.createdAt || new Date().toISOString(),busy:false};
  document.body.append(dialog);dialog.addEventListener('cancel',event=>{if(projectPopupState?.busy)event.preventDefault();});dialog.addEventListener('close',()=>{dialog.remove();projectPopupState=null;});dialog.showModal();
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
  return `<article class="card meeting"><div class="meeting-date">${esc(m.date || 'Date to be agreed')}${m.time ? ' · ' + esc(m.time) + ' ' + esc(m.timezone) : ''}</div><h3>${esc(m.title)}</h3>${m.localOnly ? `<span class="pill">This browser only</span> <button class="chip" type="button" data-remove-local-meeting="${esc(m.id)}">Remove local copy</button>` : ''}${m.location ? `<p>${esc(m.location)}</p>` : ''}<p class="published-notes">${esc(m.notes || 'No shared notes yet.')}</p><small>Recorded attendees: ${esc((m.attendees || []).join(', ') || 'Not recorded')}</small>${m.actionItems?.length ? `<h4>Shared action items</h4><ul>${m.actionItems.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}<details ${m.id === 'prof-betz-20261103' || m.id === 'internal-planning' ? 'open' : ''}><summary>Take notes</summary><form class="meeting-note-form" data-meeting-id="${esc(m.id)}"><label>Notes and decisions<textarea name="notes" rows="6">${esc(draft?.notes ?? m.notes ?? '')}</textarea></label><label>Action items — include owner and due date<textarea name="actions" rows="3">${esc(draft?.actions ?? (m.actionItems || []).join('\n'))}</textarea></label><div class="note-buttons"><button class="chip" type="button" data-save-meeting="${esc(m.id)}">Save browser draft</button><button class="chip" type="button" data-export-meeting="${esc(m.id)}">Download notes</button><button class="chip" type="button" data-edit-meeting="${esc(m.id)}">Edit meeting / shared notes</button></div><p class="draft-status" role="status">${draft ? 'Draft saved in this browser. ' : ''}Use Edit meeting / shared notes to publish to the team.</p></form></details></article>`;
}
function readLocalMeetings() {
  try { return JSON.parse(localStorage.getItem('vit-fpga:local-meetings') || '[]'); } catch { return []; }
}
let meetingDialogState = null;
function meetingFormValue(form) {
  const values=new FormData(form);
  return {title:values.get('title'),type:values.get('type'),date:values.get('date'),time:values.get('time'),location:values.get('location'),notes:values.get('notes'),attendees:String(values.get('attendees')).split('\n').map(s=>s.trim()).filter(Boolean),actionItems:String(values.get('actions')).split('\n').map(s=>s.trim()).filter(Boolean),timezone:'America/Toronto'};
}
function openMeetingDialog(type, id) {
  document.getElementById('meeting-dialog')?.remove();
  const original=id ? state.data.meetings.find(m=>m.id===id) : null;
  const local=id ? readLocalMeetings().find(m=>m.id===id) : null;
  const key=`vit-fpga:meeting-popup:${id || type}`;
  let saved; try { saved=JSON.parse(localStorage.getItem(key) || 'null'); } catch {}
  const noteDraft=id ? readDraft(id) : null;
  const initial=saved || {...(local || original || {title:type==='professor'?'Meeting with Professor Vaughn Betz':'Internal team meeting',type,date:torontoDate(),time:type==='professor'?'16:00':'',notes:'',attendees:[],actionItems:[]}),...(noteDraft?{notes:noteDraft.notes,actionItems:noteDraft.actions.split('\n').filter(Boolean)}:{})};
  const dialog=document.createElement('dialog');dialog.id='meeting-dialog';dialog.className='meeting-dialog';dialog.setAttribute('aria-labelledby','meeting-dialog-title');
  dialog.innerHTML=`<div class="section-head"><h2 id="meeting-dialog-title">${id?'Edit meeting':'Add meeting'}</h2><button class="chip" type="button" data-close-meeting aria-label="Close meeting popup">✕</button></div><form id="meeting-popup-form"><label>Meeting title<input name="title" required maxlength="160" value="${esc(initial.title)}"></label><div class="update-fields"><label>Meeting type<select name="type"><option value="professor" ${initial.type==='professor'?'selected':''}>With Professor Betz</option><option value="internal" ${initial.type==='internal'?'selected':''}>Internal team</option></select></label><label>Date<input name="date" type="date" required value="${esc(initial.date)}"></label><label>Time (Toronto)<input name="time" type="time" value="${esc(initial.time || '')}"></label><label>Location or call link<input name="location" value="${esc(initial.location || '')}" placeholder="Optional"></label></div><label>Agenda, notes and decisions<textarea name="notes" rows="4" maxlength="20000">${esc(initial.notes || '')}</textarea></label><label>Attendees — one per line<textarea name="attendees" rows="2">${esc((initial.attendees || []).join('\n'))}</textarea></label><label>Action items — one per line, with owner and due date<textarea name="actions" rows="2">${esc((initial.actionItems || []).join('\n'))}</textarea></label><div class="note-buttons"><button class="edit-cta" type="button" data-publish-meeting>Save to shared wiki</button><button class="chip" type="button" data-local-meeting>Save in this browser</button><button class="chip" type="button" data-close-meeting>Cancel</button></div><p class="publish-hint">Shared saves use GitHub sign-in. Browser-only meetings stay on this device.</p><p role="status" class="update-status">${saved?'Popup draft restored.':''}</p></form>`;
  meetingDialogState={original,id:id || saved?.id || `meeting-${crypto.randomUUID()}`,key,busy:false};
  document.body.append(dialog);
  dialog.addEventListener('cancel',event=>{if(meetingDialogState?.busy)event.preventDefault();});
  dialog.addEventListener('close',()=>{if(!meetingDialogState?.busy){dialog.remove();meetingDialogState=null;}});
  dialog.showModal();
}
function calendar() {
  const today = new Intl.DateTimeFormat('en-CA', {timeZone:'America/Toronto'}).format(new Date());
  const savedLocal = readLocalMeetings();
  const meetings = [...state.data.meetings.filter(m=>!savedLocal.some(l=>l.id===m.id)),...savedLocal].sort((a,b) => {
    if (!a.date || !b.date) return !a.date ? -1 : 1;
    const upcomingA=a.date>=today, upcomingB=b.date>=today;
    if (upcomingA!==upcomingB) return upcomingA ? -1 : 1;
    return upcomingA ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
  });
  const column = (type,title,subtitle) => `<section class="meeting-column"><div class="section-head"><div><h2>${title}</h2><p>${subtitle}</p></div><button class="chip" type="button" data-add-meeting="${type}">+ Add meeting</button></div><div class="cards">${meetings.filter(m => m.type === type).map(meetingCard).join('') || '<p class="empty">No meetings yet.</p>'}</div></section>`;
  return heading('Meeting Calendar', 'Separate spaces for professor guidance and team coordination. Keep decisions and actions with each meeting.') + `<div class="meeting-columns">${column('professor','With Professor Betz','Every other Tuesday · 4 p.m. Toronto · from Nov 3, 2026')}${column('internal','Internal team meetings','Team-selected dates · integration blockers and next steps')}</div>`;
}
function gantt() {
  const months = ['Sep 2026','Oct','Nov','Dec','Jan 2027','Feb','Mar','Apr'];
  const groups = ['Baseline and profiling','Hardware development','Software and peripherals','System integration and testing','Milestones'];
  return heading('Gantt Chart', 'September 2026–April 2027 · implementation schedule and target milestones.') + `<p class="schedule-source">Transcribed from the supplied <strong>Inplementation Plan.docx</strong>. Bars show planned work windows, not completion. See <a href="#/members">dated updates</a> for evidence. “Step” and “Tiff” in the source are Stephanie and Tiffany.</p><div class="gantt-scroll" role="region" aria-label="Project schedule" tabindex="0"><div class="gantt-table"><div class="gantt-label gantt-heading">Workstream / owner</div>${months.map((m,i) => `<div class="gantt-month ${i===2 ? 'current-month' : ''}">${m}</div>`).join('')}${groups.map(group => `<div class="gantt-group">${esc(group)}</div>${state.data.schedule.filter(r => r.group === group).sort((a,b) => a.startMonth-b.startMonth || a.title.localeCompare(b.title)).map(r => `<div class="gantt-label"><strong>${esc(r.title)}</strong><small>${esc(r.owner)}</small></div>${months.map((m,i) => `<div class="gantt-cell ${i===2?'current-month':''}">${i+1>=r.startMonth && i+1<=r.endMonth ? `<span class="${r.kind==='milestone'?'gantt-milestone':'gantt-bar'}" title="${esc(r.title)} · ${esc(r.owner)} · ${months[r.startMonth-1]}–${months[r.endMonth-1]}">${r.kind==='milestone'?'◆':'<span class="sr-only">Planned work</span>'}</span>` : ''}</div>`).join('')}`).join('')}`).join('')}</div></div><div class="panel schedule-note"><h2>Progress and planning notes</h2><p>The plan reports a GELU board-test pass; a linked test log is still needed. Standalone softmax passed simulation and timing near 90 MHz. Stephanie’s integrated model uses an 80 MHz full-SoC image and one selected offloaded operation; it does not establish full-model FPGA inference or consistent speedup.</p><p>February: hardware integration target · March: system prototype target · April: final demonstration. Future milestones remain planning targets.</p></div>`;
}

function resources() {
  const all = state.data.resources;
  const types = ['All', ...new Set(all.map(r => r.type).filter(Boolean))];
  const visible = all.filter(r => (state.resourceType === 'All' || r.type === state.resourceType) && `${r.title} ${r.authors} ${r.description} ${(r.tags || []).join(' ')}`.toLowerCase().includes(state.search.toLowerCase()));
  return heading('Research Resources', 'Curated papers, videos, and tutorials on Vision Transformers and FPGA acceleration.') + `<input class="search" id="resource-search" type="search" placeholder="Search resources…" aria-label="Search resources" value="${esc(state.search)}"><div class="toolbar">${types.map(type => `<button class="chip ${state.resourceType === type ? 'active' : ''}" data-resource-type="${esc(type)}" type="button">${esc(label(type))} (${type === 'All' ? all.length : all.filter(r => r.type === type).length})</button>`).join('')}</div><div class="resources">${visible.map(r => `<article class="card resource"><span class="pill">${esc(label(r.type))}</span><h2><a href="${link(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)} ↗</a></h2><div class="resource-meta">${[r.authors, r.year, r.venue].filter(Boolean).map(esc).join(' · ')}</div>${r.description ? `<p>${esc(r.description)}</p>` : ''}${r.tags?.length ? `<div class="resource-tags">${r.tags.map(tag => `<span>${esc(tag)}</span>`).join('')}</div>` : ''}</article>`).join('') || '<div class="empty">No resources match your search.</div>'}</div>`;
}


function files() {
 return heading('ECE496 Files & Data', 'Deliverables, experiment data and demos. Add a file or shared link through Edit content.') + `<div class="cards">${state.data.files.map(f => `<article class="card"><h2><a href="${/^\/files\//.test(f.url) ? esc(f.url) : link(f.url)}" target="_blank" rel="noopener noreferrer">${esc(f.title)} ↗</a></h2><p>${esc(f.date)} · ${esc(f.owner)} · ${esc(f.status)}</p><p>${esc(f.description)}</p></article>`).join('')}</div>`;
}
const pages = { '/': ['Dashboard', dashboard], '/members': ['Member Progress & Updates', members], '/updates': ['Project Updates', projectUpdates], '/brainstorm': ['Brainstorm Board', brainstorm], '/calendar': ['Meeting Calendar', calendar], '/resources': ['Research Resources', resources], '/files': ['ECE496 Files & Data', files], '/gantt': ['Gantt Chart', gantt] };
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
    status.textContent = 'Draft saved in this browser. Use Edit meeting / shared notes to publish to the team.';
  } catch { status.textContent = 'Browser storage unavailable. Download notes to keep a copy.'; }
});
document.addEventListener('click', event => {
  const button = event.target.closest('[data-export-meeting]');
  if (!button) return;
  const form = button.closest('form');
  const meeting = readLocalMeetings().find(m => m.id === button.dataset.exportMeeting) || state.data.meetings.find(m => m.id === button.dataset.exportMeeting);
  const text = `# ${meeting.title}\n\nDate: ${meeting.date || 'Unscheduled'}\n\n## Notes and decisions\n\n${form.elements.notes.value}\n\n## Action items\n\n${form.elements.actions.value}\n`;
  const url = URL.createObjectURL(new Blob([text], {type:'text/markdown'}));
  const a = document.createElement('a'); a.href=url; a.download=`${meeting.id}-notes.md`; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
});
let publishingUpdate = false;
document.addEventListener('click', async event => {
  const memberButton = event.target.closest('[data-member-id]');
  if (memberButton && memberButton.tagName === 'BUTTON') {
    if (publishingUpdate) return;
    state.memberId=memberButton.dataset.memberId; render(); return;
  }
  const signout = event.target.closest('[data-signout-update]');
  if (signout && !publishingUpdate) { state.githubToken=null; render(); return; }
  const discard=event.target.closest('[data-discard-update]');
  if (discard && !publishingUpdate) {
    try { localStorage.removeItem(updateDraftKey(discard.closest('form').dataset.memberId)); render(); }
    catch { discard.closest('form').querySelector('[role="status"]').textContent='Could not discard browser draft.'; }
    return;
  }
  const save = event.target.closest('[data-save-update]');
  const publish = event.target.closest('[data-publish-update]');
  if (!save && !publish) return;
  const form = (save || publish).closest('form');
  const status = form.querySelector('[role="status"]');
  if (save) {
    try { keepUpdateDraft(form); status.textContent='Draft saved in this browser. It is not published yet.'; }
    catch { status.textContent='Browser storage is unavailable. Keep this page open and copy your draft before leaving.'; }
    return;
  }
  if (publishingUpdate || !form.reportValidity()) return;
  let record;
  try {
    const input = validateUpdate(updateInput(form),state.data.members.map(m=>m.id));
    const oldDraft = readUpdateDraft(input.memberId);
    const signature = JSON.stringify(input);
    record = oldDraft?.signature === signature && oldDraft?.pendingRecord ? oldDraft.pendingRecord : { ...input, id:`update-${input.memberId}-${crypto.randomUUID()}`, createdAt:new Date().toISOString() };
    keepUpdateDraft(form,{pendingRecord:record,signature});
  } catch(error) { status.textContent=error.message; return; }
  publishingUpdate=true;
  const controls=[...form.querySelectorAll('input,textarea,button')];
  controls.forEach(control=>control.disabled=true);
  try {
    status.textContent=state.githubToken ? 'Publishing update to GitHub…' : 'Complete GitHub sign-in in the popup…';
    state.githubToken ||= await signInWithGitHub();
    const result = await publishUpdate(state.githubToken,record);
    state.data.updates.unshift({...record,commitUrl:result.url,commitSha:result.sha});
    try { localStorage.removeItem(updateDraftKey(record.memberId)); } catch {}
    render();
    const publishedStatus=document.querySelector('.member-update-form [role="status"]');
    if (publishedStatus) publishedStatus.textContent='Published to GitHub and added to the history below. The shared site will refresh after deployment.';
  } catch(error) {
    if (error.message.includes('expired')) state.githubToken=null;
    status.textContent=error.message;
  } finally { publishingUpdate=false; controls.forEach(control=>control.disabled=false); }
});
document.addEventListener('submit', event => {
  if (event.target.matches('.member-update-form')) { event.preventDefault(); event.target.querySelector('[data-publish-update]').click(); }
});
document.addEventListener('click', async event => {
  const remove=event.target.closest('[data-remove-local-meeting]');
  if(remove){localStorage.setItem('vit-fpga:local-meetings',JSON.stringify(readLocalMeetings().filter(m=>m.id!==remove.dataset.removeLocalMeeting)));render();return;}
  const add=event.target.closest('[data-add-meeting]');
  if(add){openMeetingDialog(add.dataset.addMeeting);return;}
  const edit=event.target.closest('[data-edit-meeting]');
  if(edit){const id=edit.dataset.editMeeting;const noteForm=edit.closest('.meeting-note-form');if(noteForm){try{localStorage.setItem(meetingDraftKey(id),JSON.stringify({notes:noteForm.elements.notes.value,actions:noteForm.elements.actions.value}));}catch{}} const m=readLocalMeetings().find(m=>m.id===id) || state.data.meetings.find(m=>m.id===id);openMeetingDialog(m.type,id);return;}
  if(event.target.closest('[data-close-meeting]')){if(!meetingDialogState?.busy)document.getElementById('meeting-dialog')?.close();return;}
  const publish=event.target.closest('[data-publish-meeting]');
  const local=event.target.closest('[data-local-meeting]');
  if(!publish && !local)return;
  const context=meetingDialogState,form=(publish || local).closest('form'),status=form.querySelector('[role="status"]');
  if(context.busy || !form.reportValidity())return;
  let record;
  try {record={...context.original,...validateMeeting(meetingFormValue(form)),id:context.id,updatedAt:new Date().toISOString()};delete record.localOnly;localStorage.setItem(context.key,JSON.stringify(record));}
  catch(error){status.textContent=error.message;return;}
  if(local){
    try {const saved=readLocalMeetings().filter(m=>m.id!==record.id);saved.push({...record,localOnly:true});localStorage.setItem('vit-fpga:local-meetings',JSON.stringify(saved));localStorage.removeItem(context.key);localStorage.removeItem(meetingDraftKey(record.id));document.getElementById('meeting-dialog').close();render();}
    catch{status.textContent='Browser storage is unavailable. Your text is still in this popup.';}
    return;
  }
  context.busy=true;const controls=[...form.querySelectorAll('input,textarea,select,button')];controls.forEach(c=>c.disabled=true);
  try {
    status.textContent=state.githubToken?'Saving meeting…':'Complete GitHub sign-in in the popup…';
    state.githubToken ||= await signInWithGitHub();
    await publishMeeting(state.githubToken,record,context.original);
    state.data.meetings=state.data.meetings.filter(m=>m.id!==record.id);state.data.meetings.push(record);
    try { localStorage.setItem('vit-fpga:local-meetings',JSON.stringify(readLocalMeetings().filter(m=>m.id!==record.id)));localStorage.removeItem(context.key);localStorage.removeItem(meetingDraftKey(record.id)); } catch {}
    context.busy=false;document.getElementById('meeting-dialog').close();render();
  } catch(error) {if(error.message.includes('expired'))state.githubToken=null;status.textContent=error.message;}
  finally {context.busy=false;controls.forEach(c=>c.disabled=false);}
});
document.addEventListener('input',event=>{
  const form=event.target.closest('#meeting-popup-form');if(!form || !meetingDialogState)return;
  try {localStorage.setItem(meetingDialogState.key,JSON.stringify({...meetingFormValue(form),id:meetingDialogState.id}));}
  catch {form.querySelector('[role="status"]').textContent='Browser draft storage is unavailable.';}
});
document.addEventListener('submit',event=>{
  if(event.target.id==='meeting-popup-form'){event.preventDefault();event.target.querySelector('[data-publish-meeting]').click();}
});
document.addEventListener('click',async event=>{
  const category=event.target.closest('[data-project-category]');if(category){state.updateCategory=category.dataset.projectCategory;render();return;}
  if(event.target.closest('[data-add-project-update]')){openProjectUpdate();return;}
  const resume=event.target.closest('[data-resume-project-update]');if(resume){openProjectUpdate(resume.dataset.resumeProjectUpdate);return;}
  const remove=event.target.closest('[data-remove-project-update]');if(remove){localStorage.setItem('vit-fpga:local-project-updates',JSON.stringify(localProjectUpdates().filter(u=>u.id!==remove.dataset.removeProjectUpdate)));render();return;}
  if(event.target.closest('[data-close-project-update]')){if(!projectPopupState?.busy)document.getElementById('project-update-dialog')?.close();return;}
  const publish=event.target.closest('[data-publish-project-update]'),local=event.target.closest('[data-local-project-update]');if(!publish && !local)return;
  const context=projectPopupState,form=(publish || local).closest('form'),status=form.querySelector('[role="status"]');if(context.busy || !form.reportValidity())return;
  let record;try{record=prepareProjectUpdate(projectPopupInput(form),state.data.members.map(m=>m.id),context.id,context.createdAt);localStorage.setItem('vit-fpga:project-update-popup',JSON.stringify(record));}catch(error){status.textContent=error.message;return;}
  if(local){try{localStorage.setItem('vit-fpga:local-project-updates',JSON.stringify([...localProjectUpdates().filter(u=>u.id!==record.id),{...record,localOnly:true}]));localStorage.removeItem('vit-fpga:project-update-popup');state.updateCategory='All';document.getElementById('project-update-dialog').close();render();}catch{status.textContent='Browser storage is unavailable. Keep a copy of your text.';}return;}
  context.busy=true;const controls=[...form.querySelectorAll('input,textarea,select,button')];controls.forEach(c=>c.disabled=true);
  try{status.textContent='Saving update to GitHub…';state.githubToken ||= await signInWithGitHub();await publishUpdate(state.githubToken,record);state.data.updates=state.data.updates.filter(u=>u.id!==record.id);state.data.updates.push(record);try{localStorage.removeItem('vit-fpga:project-update-popup');localStorage.setItem('vit-fpga:local-project-updates',JSON.stringify(localProjectUpdates().filter(u=>u.id!==record.id)));}catch{}context.busy=false;state.updateCategory='All';document.getElementById('project-update-dialog').close();render();}
  catch(error){if(error.message.includes('expired'))state.githubToken=null;status.textContent=error.message;}
  finally{context.busy=false;controls.forEach(c=>c.disabled=false);}
});
document.addEventListener('input',event=>{const form=event.target.closest('#project-update-form');if(!form || !projectPopupState)return;try{localStorage.setItem('vit-fpga:project-update-popup',JSON.stringify({...projectPopupInput(form),id:projectPopupState.id,createdAt:projectPopupState.createdAt}));}catch{form.querySelector('[role="status"]').textContent='Browser draft storage is unavailable.';}});
document.addEventListener('submit',event=>{if(event.target.id==='project-update-form'){event.preventDefault();event.target.querySelector('[data-publish-project-update]').click();}});
document.addEventListener('input', event => {
  const form=event.target.closest('.member-update-form');
  if (!form) return;
  try { keepUpdateDraft(form); form.querySelector('[role="status"]').textContent='Draft saved in this browser.'; }
  catch { form.querySelector('[role="status"]').textContent='Browser storage unavailable. Your text remains on this page.'; }
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
