const field=(name,label,type='text',options={})=>({name,label,type,...options});
const title=field('title','Title','text',{required:true});
const date=field('date','Date','date');
const notes=field('notes','Notes','textarea');
const member=field('memberId','Member','member',{required:true});
const select=(name,label,options)=>field(name,label,'select',{options});
export const collections={
  overview:{label:'Dashboard updates',fields:[title,date,field('description','Update','textarea',{required:true})]},
  pages:{label:'Page introduction',fields:[title,field('subtitle','Introduction','textarea'),field('description','Overview','textarea'),field('notes','Additional notes','textarea')]},
  members:{label:'Member profiles',fields:[field('name','Name','text',{required:true}),field('role','Role'),field('avatar','Initials'),notes]},
  tasks:{label:'Tasks',fields:[title,member,select('status','Status',['todo','in-progress','done']),field('tag','Category'),field('acceptance','Acceptance criteria / evidence','textarea'),field('archived','Archived','boolean')]},
  updates:{label:'Updates',fields:[title,member,date,select('scope','Scope',['member','project']),select('category','Category',['General','Result','Issue','Decision']),field('measurement','Key result / value'),field('update','Update','textarea',{required:true}),field('context','Context / next step','textarea'),field('links','Evidence links — label | URL, one per line','links')]},
  meetings:{label:'Meetings',fields:[title,select('type','Meeting type',['professor','internal']),date,field('time','Time (Toronto)','time'),field('timezone','Time zone'),field('location','Location / call link'),field('recurrence','Recurrence'),notes,field('attendees','Attendees — one per line','list'),field('actionItems','Action items — one per line','list')]},
  ideas:{label:'Ideas',fields:[title,field('description','Description','textarea'),field('author','Author'),field('tag','Category'),field('votes','Votes','number',{min:0}),field('pinned','Pinned','boolean')]},
  resources:{label:'Research resources',fields:[title,field('type','Type'),field('url','URL','url',{required:true}),field('authors','Authors'),field('year','Year'),field('venue','Venue'),field('description','Description','textarea'),field('citations','Citations','number',{min:0}),field('tags','Tags — one per line','list')]},
  files:{label:'Files and data links',fields:[title,date,field('owner','Owner'),field('status','Submission / version status'),field('url','File or shared link','url',{required:true}),field('description','Description','textarea')]},
  schedule:{label:'Gantt schedule',fields:[title,field('owner','Owner'),select('group','Workstream',['Baseline and profiling','Hardware development','Software and peripherals','System integration and testing','Milestones']),select('kind','Kind',['task','milestone']),field('startMonth','Start month (1=Sep 2026, 8=Apr 2027)','number',{min:1,max:8,required:true}),field('endMonth','End month','number',{min:1,max:8,required:true})]}
};
export const contentTypes=Object.keys(collections);
export function validateContent(type,record){
  if(!Object.hasOwn(collections,type))throw new Error('Unknown content collection.');
  if(!record || !/^[a-zA-Z0-9_-]{1,120}$/.test(record.id))throw new Error('Invalid content identifier.');
  const cleaned={id:record.id};
  for(const f of collections[type].fields){
    let v=record[f.name];
    if(v===undefined || v===null || v===''){if(f.required)throw new Error(`${f.label} is required.`);continue;}
    if(f.type==='boolean'){if(typeof v!=='boolean')throw new Error(`Invalid ${f.label}.`);}
    else if(f.type==='number'){if(typeof v!=='number' || !Number.isInteger(v) || v<(f.min??0) || v>(f.max??1000000000))throw new Error(`Invalid ${f.label}.`);}
    else if(f.type==='list'){if(!Array.isArray(v) || v.length>100 || v.some(item=>typeof item!=='string' || item.length>2000))throw new Error(`Invalid ${f.label}.`);}
    else if(f.type==='links'){
      if(!Array.isArray(v) || v.length>30)throw new Error('Too many links.');
      v=v.map(item=>{if(!item || typeof item.url!=='string' || !/^https?:\/\//i.test(item.url) || item.url.length>2000)throw new Error('Use http or https evidence links.');return {label:String(item.label || item.url).slice(0,500),url:item.url};});
    }else{
      if(typeof v!=='string' || v.length>(f.type==='textarea'?20000:2000))throw new Error(`Invalid ${f.label}.`);
      if(f.type==='select' && !f.options.includes(v))throw new Error(`Invalid ${f.label}.`);
      if(f.type==='date'){const d=new Date(`${v}T12:00:00Z`);if(!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(d.getTime()) || d.toISOString().slice(0,10)!==v)throw new Error('Invalid date.');}
      if(f.type==='time' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(v))throw new Error('Invalid time.');
      if(f.type==='url' && !/^https?:\/\//i.test(v) && !/^\/(files|assets)\/[a-zA-Z0-9_./% -]+$/.test(v))throw new Error('Use an http(s) URL or a /files/ or /assets/ link.');
    }
    cleaned[f.name]=v;
  }
  if(type==='schedule' && cleaned.endMonth<cleaned.startMonth)throw new Error('End month must follow start month.');
  if(type==='updates' && !cleaned.date)throw new Error('Update date is required.');
  return cleaned;
}
