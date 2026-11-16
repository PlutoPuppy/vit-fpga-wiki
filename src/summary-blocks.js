const key='vit-fpga:summary-blocks';
export function newSummaryBlock(now=new Date(),id=crypto.randomUUID()){
  const date=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto'}).format(now);
  return {id:`summary-${id}`,title:`Project summary — ${date}`,date,body:'',createdAt:now.toISOString()};
}
export function sortSummaryBlocks(blocks){
  const date=record=>record.date || (record.createdAt || record.updatedAt || '').slice(0,10);
  return [...blocks].sort((a,b)=>date(b).localeCompare(date(a)) || (b.createdAt || b.updatedAt || '').localeCompare(a.createdAt || a.updatedAt || '') || b.id.localeCompare(a.id));
}
export function localSummaryBlocks(storage=localStorage){
  try{const blocks=JSON.parse(storage.getItem(key) || '[]');return Array.isArray(blocks)?blocks:[];}catch{return [];}
}
export function saveLocalSummary(record,{deleted=false}={},storage=localStorage){
  const blocks=localSummaryBlocks(storage);
  const existing=blocks.find(block=>block.id===record.id);
  if((existing?._revision || 0)!==(record._revision || 0))throw new Error('This browser draft changed. Reload before editing it again.');
  const result={...record,_localOnly:true,_revision:(record._revision || 0)+1,updatedAt:new Date().toISOString()};
  storage.setItem(key,JSON.stringify([...blocks.filter(block=>block.id!==record.id),...(deleted?[]:[result])]));
  return {record:result,deleted};
}
