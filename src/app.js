import { newestBiweeklyFirst, teammates } from './biweekly.js';
import {loadContent,saveContent} from './content-store.js';
import {installContentEditor,tabCollections} from './content-editor.js';
import {collections} from './content-model.js';
import { validateMeeting } from './meeting-publishing.js';
const types = ['members', 'tasks', 'meetings', 'ideas', 'resources', 'updates', 'files', 'schedule', 'pages', 'overview', 'biweekly', 'summary'];
const app = document.getElementById('app');
const sidebar = document.getElementById('sidebar');
const state = { data: {}, ideaTag: 'All', resourceType: 'All', search: '', shared: false };
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const route = () => { const path = (location.hash.slice(1) || '/').replace(/\/$/, '') || '/'; return path; };
const link = url => /^https?:\/\//i.test(url || '') ? esc(url) : '#';
const label = value => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase());
const heading = (title, subtitle) => `<div class="page-head"><div><div class="eyebrow">CAPSTONE RESEARCH PROJECT · 2026</div><h1 class="page-title">${esc(title)}</h1><p class="page-subtitle">${esc(subtitle)}</p></div>${headingButton(tabCollections[route().slice(1)||'dashboard'][0])}</div>`;
const headingButton = type => collections[type]?.single ? `<button class="edit-cta" type="button" data-entry-type="${type}" data-entry-edit="${collections[type].single}">Edit ${esc(collections[type].label.toLowerCase())}</button>` : `<button class="edit-cta" type="button" data-entry-add="${type}">${route()==='/updates'?'+ Add biweekly update':'+ Add entry'}</button>`;

function dashboard() {
  const { members, tasks, ideas, resources, meetings } = state.data;
  const currentTasks = tasks.filter(t => !t.archived);
  const inProgress = currentTasks.filter(t => t.status === 'in-progress');
  const topIdeas = [...ideas].sort((a, b) => b.votes - a.votes).slice(0, 3);
  return heading('Dashboard','Team progress, notes and project overview.') + `<section class="hero" data-content-type="pages" data-content-id="dashboard"><div class="hero-content"><div class="hero-meta">CAPSTONE RESEARCH PROJECT · 2026</div><h2>${esc(state.data.pages.find(p=>p.id==='dashboard')?.title || 'Vision Transformer on FPGA')}</h2><p>${esc(state.data.pages.find(p=>p.id==='dashboard')?.description || '')}</p><div class="hero-meta">TEAM RESEARCH WIKI</div></div></section>
    <section class="stats" aria-label="Project statistics">
      <div class="stat"><strong>${members.length}</strong><span>Team members</span></div><div class="stat"><strong>${currentTasks.filter(t => t.status === 'done').length}/${currentTasks.length}</strong><span>Tasks done · ${inProgress.length} in progress</span></div><div class="stat"><strong>${ideas.length}</strong><span>Brainstorm ideas · ${ideas.filter(i => i.pinned).length} pinned</span></div><div class="stat"><strong>${resources.length}</strong><span>Research resources</span></div>
    </section><div class="grid-2"><section class="panel"><div class="section-head"><h2>Team Progress</h2></div>${members.map(m => `<div class="member-mini"><div><strong>${esc(m.name)}</strong><br><small>${esc(m.role)}</small></div><b>${tasks.filter(t => !t.archived && t.memberId === m.id && t.status === 'done').length}/${tasks.filter(t => !t.archived && t.memberId === m.id).length}</b></div>`).join('')}</section>
    <section class="panel"><div class="section-head"><h2>Top Ideas</h2><a href="#/brainstorm">View board →</a></div>${topIdeas.map(i => `<div class="idea-mini"><span class="vote">▲ ${Number(i.votes) || 0}</span> &nbsp;${esc(i.title)}</div>`).join('')}</section>
    <section class="panel"><div class="section-head"><h2>Upcoming Meetings</h2><a href="#/calendar">Calendar →</a></div>${meetings.filter(m => m.date >= new Date().toISOString().slice(0, 10)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3).map(m => `<div class="task-mini">${esc(m.date)} · ${esc(m.title)}</div>`).join('') || '<div class="empty">No upcoming meetings</div>'}</section>
    <section class="panel"><div class="section-head"><h2>Quick Links</h2></div><div class="quick-links"><a href="#/updates">Biweekly Updates →</a><a href="#/files">ECE496 Files & Data →</a><a href="#/brainstorm">Brainstorm Board →</a><a href="#/calendar">Meeting Calendar →</a><a href="#/resources">Research Resources →</a></div></section></div><section class="dashboard-notes cards">${state.data.overview.map(n=>`<article class="card" data-content-type="overview" data-content-id="${esc(n.id)}"><h2>${esc(n.title)}</h2><small>${esc(n.date)}</small><p class="project-update-body">${esc(n.description)}</p></article>`).join('')}</section>`;
}

const torontoDate = () => new Intl.DateTimeFormat('en-CA', {timeZone:'America/Toronto'}).format(new Date());

function projectUpdates() {
  const entries=newestBiweeklyFirst(state.data.biweekly);
  return heading('Project Updates','Biweekly progress from all four teammates, newest first.') + `<div class="toolbar overview-toolbar"><button class="chip active" type="button" aria-pressed="true">Overview</button></div><div class="cards biweekly-feed">${entries.map(entry=>`<article class="card biweekly-entry" data-content-type="biweekly" data-content-id="${esc(entry.id)}"><div class="update-meta"><time datetime="${esc(entry.date)}">${esc(entry.date)}</time><span>Biweekly team update</span></div><h2>${esc(entry.title)}</h2><div class="teammate-updates">${teammates.map(member=>`<section class="teammate-update"><h3>${esc(member.name)}</h3><p>${esc(entry[member.key] || 'No update recorded for this period.')}</p></section>`).join('')}</div>${entry.notes?`<section class="team-next-steps"><h3>Team decisions / next steps</h3><p>${esc(entry.notes)}</p></section>`:''}${entry.links?.length?`<div class="evidence-links">${entry.links.map(l=>`<a href="${link(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)} ↗</a>`).join('')}</div>`:''}</article>`).join('') || '<div class="empty">No biweekly updates yet. Add the first team update above.</div>'}</div>`;
}
function summary() {
  const doc = state.data.summary.find(r => r.id === collections.summary.single);
  return heading('Progress Summary', 'Overall project progress, written by the team.') + `<section class="card summary-doc">${doc?.body?.trim() ? `<div class="summary-text">${esc(doc.body)}</div>` : '<p class="empty">No summary written yet. Click Edit progress summary to write it.</p>'}${doc?.updatedAt ? `<p class="summary-updated">Last updated ${esc(new Intl.DateTimeFormat('en-CA', {timeZone:'America/Toronto'}).format(new Date(doc.updatedAt)))}</p>` : ''}</section>`;
}
function brainstorm() {
  const ideas = [...state.data.ideas].sort((a, b) => Number(b.pinned) - Number(a.pinned) || Number(b.votes) - Number(a.votes));
  const tags = ['All', ...new Set(ideas.map(i => i.tag).filter(Boolean))];
  const visible = state.ideaTag === 'All' ? ideas : ideas.filter(i => i.tag === state.ideaTag);
  return heading('Brainstorm Board', 'Capture research ideas, hypotheses, and design directions.') + `<div class="toolbar">${tags.map(tag => `<button class="chip ${state.ideaTag === tag ? 'active' : ''}" data-idea-tag="${esc(tag)}" type="button">${esc(tag)}</button>`).join('')}</div><div class="ideas-grid">${visible.map(i => `<article class="card idea-card" data-content-type="ideas" data-content-id="${esc(i.id)}"><span class="pill">${esc(i.tag)}</span>${i.pinned ? '<span class="pinned">★ PINNED</span>' : ''}<h2>${esc(i.title)}</h2><p>${esc(i.description)}</p><div class="idea-meta"><span>${esc(i.author)} · ${esc((i.createdAt || '').slice(0, 10))}</span><span class="vote">▲ ${Number(i.votes) || 0} votes</span></div></article>`).join('') || '<div class="empty">No ideas in this category.</div>'}</div>`;
}

const meetingDraftKey = id => `vit-fpga:meeting-draft:${id}`;
function readDraft(id) {
  try { return JSON.parse(localStorage.getItem(meetingDraftKey(id)) || 'null'); } catch { return null; }
}
function meetingCard(m) {
  const draft = readDraft(m.id);
  return `<article class="card meeting" data-content-type="meetings" data-content-id="${esc(m.id)}"><div class="meeting-date">${esc(m.date || 'Date to be agreed')}${m.time ? ' · ' + esc(m.time) + ' ' + esc(m.timezone) : ''}</div><h3>${esc(m.title)}</h3>${m.localOnly ? `<span class="pill">This browser only</span> <button class="chip" type="button" data-remove-local-meeting="${esc(m.id)}">Remove local copy</button>` : ''}${m.location ? `<p>${esc(m.location)}</p>` : ''}<p class="published-notes">${esc(m.notes || 'No shared notes yet.')}</p><small>Recorded attendees: ${esc((m.attendees || []).join(', ') || 'Not recorded')}</small>${m.actionItems?.length ? `<h4>Shared action items</h4><ul>${m.actionItems.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}<details ${m.id === 'prof-betz-20261103' || m.id === 'internal-planning' ? 'open' : ''}><summary>Take notes</summary><form class="meeting-note-form" data-meeting-id="${esc(m.id)}"><label>Notes and decisions<textarea name="notes" rows="6">${esc(draft?.notes ?? m.notes ?? '')}</textarea></label><label>Action items — include owner and due date<textarea name="actions" rows="3">${esc(draft?.actions ?? (m.actionItems || []).join('\n'))}</textarea></label><div class="note-buttons"><button class="chip" type="button" data-save-meeting="${esc(m.id)}">Save browser draft</button><button class="chip" type="button" data-export-meeting="${esc(m.id)}">Download notes</button><button class="chip" type="button" data-edit-meeting="${esc(m.id)}">Edit meeting / shared notes</button></div><p class="draft-status" role="status">${draft ? 'Draft saved in this browser. ' : ''}Use Edit meeting / shared notes to publish to the team.</p></form></details></article>`;
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
  dialog.innerHTML=`<div class="section-head"><h2 id="meeting-dialog-title">${id?'Edit meeting':'Add meeting'}</h2><button class="chip" type="button" data-close-meeting aria-label="Close meeting popup">✕</button></div><form id="meeting-popup-form"><label>Meeting title<input name="title" required maxlength="160" value="${esc(initial.title)}"></label><div class="update-fields"><label>Meeting type<select name="type"><option value="professor" ${initial.type==='professor'?'selected':''}>With Professor Betz</option><option value="internal" ${initial.type==='internal'?'selected':''}>Internal team</option></select></label><label>Date<input name="date" type="date" required value="${esc(initial.date)}"></label><label>Time (Toronto)<input name="time" type="time" value="${esc(initial.time || '')}"></label><label>Location or call link<input name="location" value="${esc(initial.location || '')}" placeholder="Optional"></label></div><label>Agenda, notes and decisions<textarea name="notes" rows="4" maxlength="20000">${esc(initial.notes || '')}</textarea></label><label>Attendees — one per line<textarea name="attendees" rows="2">${esc((initial.attendees || []).join('\n'))}</textarea></label><label>Action items — one per line, with owner and due date<textarea name="actions" rows="2">${esc((initial.actionItems || []).join('\n'))}</textarea></label><div class="note-buttons"><button class="edit-cta" type="button" data-publish-meeting>Save to shared wiki</button><button class="chip" type="button" data-local-meeting>Save in this browser</button><button class="chip" type="button" data-close-meeting>Cancel</button></div><p class="publish-hint">Save to the shared wiki directly. Browser-only copies stay on this device.</p><p role="status" class="update-status">${saved?'Popup draft restored.':''}</p></form>`;
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
  return heading('Gantt Chart', 'September 2026–April 2027 · implementation schedule and target milestones.') + `<p class="schedule-source">Transcribed from the supplied <strong>Inplementation Plan.docx</strong>. Bars show planned work windows, not completion. See <a href="#/updates">Project Updates</a> for evidence. “Step” and “Tiff” in the source are Stephanie and Tiffany.</p><div class="gantt-scroll" role="region" aria-label="Project schedule" tabindex="0"><div class="gantt-table"><div class="gantt-label gantt-heading">Workstream / owner</div>${months.map((m,i) => `<div class="gantt-month ${i===2 ? 'current-month' : ''}">${m}</div>`).join('')}${groups.map(group => `<div class="gantt-group">${esc(group)}</div>${state.data.schedule.filter(r => r.group === group).sort((a,b) => a.startMonth-b.startMonth || a.title.localeCompare(b.title)).map(r => `<div class="gantt-label" data-content-type="schedule" data-content-id="${esc(r.id)}"><strong>${esc(r.title)}</strong><small>${esc(r.owner)}</small></div>${months.map((m,i) => `<div class="gantt-cell ${i===2?'current-month':''}">${i+1>=r.startMonth && i+1<=r.endMonth ? `<span class="${r.kind==='milestone'?'gantt-milestone':'gantt-bar'}" title="${esc(r.title)} · ${esc(r.owner)} · ${months[r.startMonth-1]}–${months[r.endMonth-1]}">${r.kind==='milestone'?'◆':'<span class="sr-only">Planned work</span>'}</span>` : ''}</div>`).join('')}`).join('')}`).join('')}</div></div><div class="panel schedule-note"><h2>Progress and planning notes</h2><p>The plan reports a GELU board-test pass; a linked test log is still needed. Standalone softmax passed simulation and timing near 90 MHz. Stephanie’s integrated model uses an 80 MHz full-SoC image and one selected offloaded operation; it does not establish full-model FPGA inference or consistent speedup.</p><p>February: hardware integration target · March: system prototype target · April: final demonstration. Future milestones remain planning targets.</p></div>`;
}

function resources() {
  const all = state.data.resources;
  const types = ['All', ...new Set(all.map(r => r.type).filter(Boolean))];
  const visible = all.filter(r => (state.resourceType === 'All' || r.type === state.resourceType) && `${r.title} ${r.authors} ${r.description} ${(r.tags || []).join(' ')}`.toLowerCase().includes(state.search.toLowerCase()));
  return heading('Research Resources', 'Curated papers, videos, and tutorials on Vision Transformers and FPGA acceleration.') + `<input class="search" id="resource-search" type="search" placeholder="Search resources…" aria-label="Search resources" value="${esc(state.search)}"><div class="toolbar">${types.map(type => `<button class="chip ${state.resourceType === type ? 'active' : ''}" data-resource-type="${esc(type)}" type="button">${esc(label(type))} (${type === 'All' ? all.length : all.filter(r => r.type === type).length})</button>`).join('')}</div><div class="resources">${visible.map(r => `<article class="card resource" data-content-type="resources" data-content-id="${esc(r.id)}"><span class="pill">${esc(label(r.type))}</span><h2><a href="${link(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)} ↗</a></h2><div class="resource-meta">${[r.authors, r.year, r.venue].filter(Boolean).map(esc).join(' · ')}</div>${r.description ? `<p>${esc(r.description)}</p>` : ''}${r.tags?.length ? `<div class="resource-tags">${r.tags.map(tag => `<span>${esc(tag)}</span>`).join('')}</div>` : ''}</article>`).join('') || '<div class="empty">No resources match your search.</div>'}</div>`;
}


function files() {
 return heading('ECE496 Files & Data', 'Deliverables, experiment data and shared links.') + `<div class="cards">${state.data.files.map(f => `<article class="card" data-content-type="files" data-content-id="${esc(f.id)}"><h2><a href="${/^\/files\//.test(f.url) ? esc(f.url) : link(f.url)}" target="_blank" rel="noopener noreferrer">${esc(f.title)} ↗</a></h2><p>${esc(f.date)} · ${esc(f.owner)} · ${esc(f.status)}</p><p>${esc(f.description)}</p></article>`).join('')}</div>`;
}
const pages = { '/': ['Dashboard', dashboard], '/updates': ['Project Updates', projectUpdates], '/summary': ['Progress Summary', summary], '/brainstorm': ['Brainstorm Board', brainstorm], '/calendar': ['Meeting Calendar', calendar], '/resources': ['Research Resources', resources], '/files': ['ECE496 Files & Data', files], '/gantt': ['Gantt Chart', gantt] };
function render() {
  const path = route();
  const [title, component] = pages[path] || pages['/'];
  document.title = `${title} · ViT-FPGA Research Wiki`;
  document.getElementById('breadcrumb').textContent = `~/ ${title}`;
  document.querySelectorAll('[data-route]').forEach(a => a.classList.toggle('active', a.dataset.route === path));
  app.innerHTML = component();
  entryEditor.decorate(app);
  const pageId=path.slice(1)||'dashboard';
  const page=state.data.pages.find(p=>p.id===pageId);
  const titleNode=app.querySelector('.page-title'),subtitleNode=app.querySelector('.page-subtitle');
  if(page && titleNode && pageId!=='dashboard')titleNode.textContent=page.title;
  if(page && subtitleNode)subtitleNode.textContent=page.subtitle || '';
  if(page && pageId!=='dashboard' && page.notes){
    const note=document.createElement('p');note.className='project-update-body';note.textContent=page.notes;app.querySelector('.page-head')?.after(note);
  }
  if(!state.shared){const notice=document.createElement('p');notice.className='storage-notice';notice.textContent='The site owner needs to enable GitHub file saving once. No database is required. Browser drafts are still available.';app.prepend(notice);}
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
    status.textContent='Saving meeting…';
    record=(await saveContent('meetings',record)).record;
    state.data.meetings=state.data.meetings.filter(m=>m.id!==record.id);state.data.meetings.push(record);
    try { localStorage.setItem('vit-fpga:local-meetings',JSON.stringify(readLocalMeetings().filter(m=>m.id!==record.id)));localStorage.removeItem(context.key);localStorage.removeItem(meetingDraftKey(record.id)); } catch {}
    context.busy=false;document.getElementById('meeting-dialog').close();render();
  } catch(error) {status.textContent=error.message;}
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

const entryEditor=installContentEditor({getData:()=>state.data,tab:()=>route().slice(1)||'dashboard',onChange:(type,record,deleted)=>{
  state.data[type]=state.data[type].filter(r=>r.id!==record.id);if(!deleted)state.data[type].push(record);render();
}});
try {
  try{const loaded=await loadContent();state.data=loaded.data;state.shared=loaded.shared;}
  catch{
    const responses=await Promise.all(types.map(type=>fetch(`/data/${type}.json`,{cache:'no-cache'})));
    if(responses.some(response=>!response.ok))throw new Error('Content could not be loaded.');
    const rows=await Promise.all(responses.map(response=>response.json()));state.data=Object.fromEntries(types.map((type,index)=>[type,rows[index]]));
  }
  render();
} catch (error) {
  app.innerHTML = `<div class="error">Unable to load wiki content. ${esc(error.message)}</div>`;
}
