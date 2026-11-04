export async function loadContent(){
  const response=await fetch('/api/content',{cache:'no-store'});
  if(!response.ok)throw new Error('Shared content is unavailable.');
  return response.json();
}
export async function saveContent(collection,record,{deleted=false}={}){
  const response=await fetch('/api/content',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({collection,record,revision:record._revision || 0,deleted})});
  let result;try{result=await response.json();}catch{throw new Error('Shared saving is unavailable. Your draft is kept.');}
  if(!response.ok)throw new Error(result.error || 'Could not save. Your draft is kept.');
  return result;
}
