import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {localFileStore,migrateLegacyPreview} from '../server/local-file-store.mjs';
import {onRequest} from '../functions/api/content.js';

export async function createPreview({port=8767,stateFile,quiet=false}={}){
  const root=fileURLToPath(new URL('../',import.meta.url));
  await mkdir(resolve(root,'.local'),{recursive:true});
  const file=stateFile || resolve(root,'.local/content.json');
  if(!stateFile)await migrateLegacyPreview(resolve(root,'.local/content.sqlite'),file);
  const store=localFileStore(file);
  const env={WIKI_FILE_STORE:store},dist=resolve(root,'dist');
  const server=createServer(async(req,res)=>{
    try{
      const url=new URL(req.url,`http://127.0.0.1:${server.address().port}`);
      if(url.pathname==='/api/content'){
        const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>65000){res.writeHead(413).end();return;}chunks.push(chunk);}
        const body=Buffer.concat(chunks);
        const request=new Request(url,{method:req.method,headers:req.headers,...(body.length?{body}: {})});
        const response=await onRequest({request,env});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
      }
      if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
      const target=resolve(dist,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
      if(!target.startsWith(dist+sep)){res.writeHead(403).end();return;}
      const bytes=await readFile(target);
      const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.pdf':'application/pdf'}[extname(target)] || 'application/octet-stream';
      res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:bytes);
    }catch(error){res.writeHead(error.code==='ENOENT'?404:500,{'Content-Type':'text/plain'}).end(error.code==='ENOENT'?'Not found':'Preview request failed.');}
  });
  await new Promise(done=>server.listen(port,'127.0.0.1',done));
  if(!quiet)console.log(`Editable wiki preview: http://127.0.0.1:${server.address().port}/`);
  return {server,store,close:()=>new Promise(done=>server.close(done))};
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url))await createPreview();
