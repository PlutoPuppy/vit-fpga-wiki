import {collections,validateContent} from './content-model.js';
import {saveContent} from './content-store.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const tabCollections={dashboard:['overview','pages'],updates:['biweekly','pages'],summary:['summary','pages'],brainstorm:['ideas','pages'],gantt:['schedule','pages'],calendar:['meetings','pages'],resources:['resources','pages'],files:['files','pages'],repos:['repos','pages']};
export function installContentEditor({getData,tab,onChange}){
  let context;
  function choices(type,field){
    if(field.type==='member')return (getData().members || []).map(m=>[m.id,m.name]);
    return (field.options || []).map(value=>[value,value]);
  }
  function open(type,id,remove=false){
    document.getElementById('content-entry-dialog')?.remove();
    const original=getData()[type]?.find(r=>r.id===id);
    const tabId=tab();
    const record=original || {id:id || `${type}-${crypto.randomUUID()}`,date:new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto'}).format(new Date()),scope:tabId==='updates'?'project':'member',status:'todo',category:'General',type:'internal',timezone:'America/Toronto',startMonth:3,endMonth:3,group:'Hardware development',kind:'task'};
    const key=`vit-fpga:entry-draft:${type}:${id || tabId}`;
    let draft;try{draft=JSON.parse(localStorage.getItem(key)||'null');}catch{}
    const values=draft && (!original || draft._revision===original._revision)?draft:record;
    const dialog=document.createElement('dialog');dialog.id='content-entry-dialog';dialog.className='meeting-dialog';dialog.setAttribute('aria-labelledby','content-entry-title');
    const selector=tabCollections[tabId].filter(t=>t!=='pages').map(t=>`<option value="${t}" ${t===type?'selected':''}>${esc(collections[t].label)}</option>`).join('');
    const fields=collections[type].fields.map(f=>{
      const value=values[f.name];let control;
      if(f.type==='boolean')control=`<input name="${f.name}" type="checkbox" ${value?'checked':''}>`;
      else if(f.type==='select' || f.type==='member')control=`<select name="${f.name}">${choices(type,f).map(([v,l])=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(l)}</option>`).join('')}</select>`;
      else if(['textarea','list','links'].includes(f.type))control=`<textarea name="${f.name}" rows="${f.rows || (f.type==='textarea'?4:2)}" ${f.required?'required':''}>${esc(f.type==='links'?(value||[]).map(l=>`${l.label} | ${l.url}`).join('\n'):f.type==='list'?(value||[]).join('\n'):value||'')}</textarea>`;
      else control=`<input name="${f.name}" type="${['date','time','number'].includes(f.type)?f.type:'text'}" ${f.min!==undefined?`min="${f.min}"`:''} ${f.max!==undefined?`max="${f.max}"`:''} ${f.required?'required':''} value="${esc(value??'')}">`;
      return `<label class="${['jerry','stephanie','tiffany','winnie'].includes(f.name)?'teammate-field':''}">${esc(f.label)}${control}</label>`;
    }).join('');
    dialog.innerHTML=`<div class="section-head"><h2 id="content-entry-title">${remove?'Remove entry':collections[type].single?`Edit ${esc(collections[type].label.toLowerCase())}`:type==='biweekly'?(id?'Edit biweekly update':'Add biweekly update'):id?'Edit entry':'Add entry'}</h2><button class="chip" type="button" data-editor-close aria-label="Close entry popup">✕</button></div>${remove?`<p>Remove “${esc(record.title || record.name)}” from the wiki? It remains in the saved revision history.</p>`:!id && tabCollections[tabId].filter(t=>t!=='pages').length>1?`<label>Entry type<select data-editor-collection>${selector}</select></label>`:''}<form id="content-entry-form">${remove?'':fields}<div class="note-buttons"><button type="submit" class="edit-cta">${remove?'Remove entry':type==='biweekly'?'Save update':'Save entry'}</button><button class="chip" type="button" data-editor-close>Cancel</button></div><p role="status" class="update-status"></p></form>`;
    context={type,record,key,remove,busy:false};
    document.body.append(dialog);dialog.addEventListener('cancel',event=>{if(context.busy)event.preventDefault();});dialog.addEventListener('close',()=>{dialog.remove();context=null;});dialog.showModal();
  }
  const parse=form=>{
    const result={...context.record};
    for(const f of collections[context.type].fields){
      const input=form.elements.namedItem(f.name);if(!input)continue;
      const value=input.value;
      result[f.name]=f.type==='boolean'?input.checked:f.type==='number'?(value===''?null:Number(value)):f.type==='list'?value.split('\n').map(x=>x.trim()).filter(Boolean):f.type==='links'?value.split('\n').filter(x=>x.trim()).map(line=>{const parts=line.split('|');const url=parts.length>1?parts.pop().trim():parts[0].trim();return {label:parts.length?parts.join('|').trim():url,url};}):value;
    }
    return result;
  };
  document.addEventListener('click',event=>{
    const add=event.target.closest('[data-entry-add]');if(add){open(add.dataset.entryAdd);return;}
    const edit=event.target.closest('[data-entry-edit]');if(edit){open(edit.dataset.entryType,edit.dataset.entryEdit);return;}
    const remove=event.target.closest('[data-entry-remove]');if(remove){open(remove.dataset.entryType,remove.dataset.entryRemove,true);return;}
    const manage=event.target.closest('[data-manage-content]');if(manage){const type=tabCollections[tab()][0];open(type,collections[type].single);return;}
    if(event.target.closest('[data-editor-close]') && !context?.busy)document.getElementById('content-entry-dialog')?.close();
  });
  document.addEventListener('change',event=>{if(event.target.matches('[data-editor-collection]'))open(event.target.value);});
  document.addEventListener('input',event=>{const form=event.target.closest('#content-entry-form');if(!form || context.remove)return;try{localStorage.setItem(context.key,JSON.stringify(parse(form)));}catch{}});
  document.addEventListener('submit',async event=>{
    if(event.target.id!=='content-entry-form')return;event.preventDefault();const form=event.target,status=form.querySelector('[role="status"]');if(context.busy)return;
    const current=context;try{
      const record=current.remove?current.record:parse(form);validateContent(current.type,record);
      current.busy=true;for(const control of form.elements)control.disabled=true;status.textContent='Saving…';
      const result=await saveContent(current.type,record,{deleted:current.remove});
      try{localStorage.removeItem(current.key);}catch{}
      document.getElementById('content-entry-dialog').close();onChange(current.type,result.record,result.deleted);
    }catch(error){status.textContent=error.message;current.busy=false;for(const control of form.elements)control.disabled=false;}
  });
  return {
    decorate(root){
      for(const node of root.querySelectorAll('[data-content-type][data-content-id]')){
        const type=node.dataset.contentType,id=node.dataset.contentId;if(!getData()[type]?.some(r=>r.id===id))continue;
        const controls=document.createElement('div');controls.className='entry-controls';controls.innerHTML=`<button class="chip" type="button" data-entry-type="${type}" data-entry-edit="${esc(id)}">Edit</button>${type==='pages'?'':`<button class="chip remove-entry" type="button" data-entry-type="${type}" data-entry-remove="${esc(id)}">Remove</button>`}`;node.append(controls);
      }
    }
  };
}
