const repository='PlutoPuppy/vit-fpga-wiki';
const endpoint=`https://api.github.com/repos/${repository}/contents/content/live-state.json`;
export function githubStore(token,request=fetch){
  const headers={Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'};
  return {
    async read(){
      const response=await request(`${endpoint}?ref=main`,{headers,cache:'no-store'});
      if(response.status===404)return {state:{records:{}},version:null};
      if(!response.ok)throw new Error('Could not read saved wiki text from GitHub.');
      const file=await response.json();
      if(!file.content || file.encoding!=='base64')throw new Error('Saved wiki text could not be read.');
      const text=new TextDecoder().decode(Uint8Array.from(atob(file.content.replace(/\s/g,'')),c=>c.charCodeAt(0)));
      return {state:JSON.parse(text),version:file.sha};
    },
    async write(state,version){
      const bytes=new TextEncoder().encode(JSON.stringify(state,null,2)+'\n');
      if(bytes.length>900000)throw new Error('The wiki text file needs archiving before more entries can be saved.');
      const content=btoa(Array.from(bytes,b=>String.fromCharCode(b)).join(''));
      const response=await request(endpoint,{method:'PUT',headers,body:JSON.stringify({branch:'main',message:'Save wiki content',content,...(version?{sha:version}:{})})});
      if([409,422].includes(response.status))return false;
      if(!response.ok)throw new Error('GitHub could not save the wiki text. Check the server token permissions.');
      return true;
    }
  };
}
