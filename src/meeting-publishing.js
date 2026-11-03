import { repository, encodeRecord } from './member-publishing.js';

const fields = ['title','type','date','time','timezone','location','notes','attendees','actionItems'];
const editable = record => JSON.stringify(fields.map(key => record[key] ?? (['attendees','actionItems'].includes(key) ? [] : '')));

export function validateMeeting(input) {
  const date = new Date(`${input.date}T12:00:00Z`);
  if (!input.title?.trim()) throw new Error('Add a meeting title.');
  if (!['professor','internal'].includes(input.type)) throw new Error('Choose a meeting type.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || Number.isNaN(date.getTime()) || date.toISOString().slice(0,10)!==input.date) throw new Error('Choose a valid meeting date.');
  if (input.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)) throw new Error('Choose a valid meeting time.');
  if (input.title.length > 160 || (input.notes || '').length > 20000) throw new Error('Keep the title under 160 characters and notes under 20,000 characters.');
  return {...input,title:input.title.trim(),timezone:'America/Toronto'};
}

export async function publishMeeting(token, record, original = null, request = fetch) {
  if (!/^[a-zA-Z0-9_-]+$/.test(record.id)) throw new Error('Invalid meeting identifier.');
  const endpoint=`https://api.github.com/repos/${repository}/contents/content/meetings/${record.id}.json`;
  const headers={Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'};
  const current=await request(`${endpoint}?ref=main`,{headers});
  let sha;
  if (current.ok) {
    const file=await current.json();
    const latest=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(file.content.replace(/\s/g,'')),c=>c.charCodeAt(0))));
    if (editable(latest)===editable(record)) return {url:file.html_url};
    if (!original || editable(latest)!==editable(original)) throw new Error('This meeting changed on GitHub. Reload the page before editing it again; your popup draft is kept.');
    sha=file.sha;
  } else if (current.status===401) {
    throw new Error('GitHub sign-in expired. Sign in again; your draft is kept.');
  } else if (current.status!==404 || original) {
    throw new Error('Could not load the shared meeting. Check GitHub access and reload; your draft is kept.');
  }
  const response=await request(endpoint,{method:'PUT',headers,body:JSON.stringify({branch:'main',message:`${original?'Update':'Add'} ${record.type} meeting: ${record.date} ${record.title}`,content:encodeRecord(record),...(sha?{sha}:{})})});
  if (!response.ok) {
    if (response.status===401) throw new Error('GitHub sign-in expired. Sign in again; your draft is kept.');
    if ([403,404].includes(response.status)) throw new Error('Your GitHub account needs repository write access. Your draft is kept.');
    throw new Error('GitHub did not confirm the save. Check meeting history before retrying; your draft is kept.');
  }
  const result=await response.json();
  return {url:result.commit.html_url};
}
