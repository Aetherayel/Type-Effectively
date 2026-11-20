import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { spawnSync } from 'node:child_process';

const root=resolve(process.cwd());
const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
  '.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
const port=41739;
const instrumentation=`<script>
window.addEventListener('error',event=>{
  document.documentElement.setAttribute('data-boot-error',
    (event.message||'resource load error')+' '+(event.filename||event.target?.src||''));
},true);
window.addEventListener('unhandledrejection',event=>{
  document.documentElement.setAttribute('data-boot-error',
    String(event.reason));
});
</script>`;
const server=createServer((req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const path=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!path.startsWith(root+'/')){res.writeHead(403);res.end();return;}
    let body=readFileSync(path);
    if(path.endsWith('/index.html'))body=Buffer.from(
      body.toString().replace('<script type="module"',instrumentation+'<script type="module"'));
    res.setHeader('Content-Type',mime[extname(path)]||'application/octet-stream');
    res.end(body);
  }catch(error){res.writeHead(404);res.end(String(error.message));}
});
await new Promise((ok,fail)=>server.once('error',fail).listen(port,'127.0.0.1',ok));
try{
  const candidates=['google-chrome','google-chrome-stable','chromium','chromium-browser'];
  let result;
  for(const cmd of candidates){
    const probe=spawnSync('which',[cmd],{encoding:'utf8'});
    if(probe.status===0){
      result=spawnSync(cmd,[
        '--headless=new','--no-sandbox','--disable-dev-shm-usage',
        '--disable-gpu','--no-first-run','--no-default-browser-check',
        '--virtual-time-budget=6000','--dump-dom',
        'http://127.0.0.1:'+port+'/'
      ],{encoding:'utf8',timeout:35000,maxBuffer:8_000_000});
      break;
    }
  }
  if(!result)throw new Error('Chrome/Chromium unavailable: cannot run browser startup smoke test');
  if(result.error)throw result.error;
  const html=result.stdout||'';
  const diagnostics=html.match(/data-boot-error="([^"]+)"/)?.[1]||'';
  const counts={
    mbti:(html.match(/data-score="mbti"/g)||[]).length,
    enneagram:(html.match(/data-score="enneagram"/g)||[]).length,
    bigfive:(html.match(/data-score="bigfive"/g)||[]).length
  };
  console.log('Browser initialization:',JSON.stringify({counts,diagnostics,status:result.status}));
  if(counts.mbti!==5||counts.enneagram!==9||counts.bigfive!==5){
    console.error('Chrome diagnostics:',result.stderr?.slice(-3500));
    console.error('Error attribute:',diagnostics);
    console.error('Module and HTML context:',html.slice(0,1800));
  }
  assert.equal(result.status,0,'Chrome exited unsuccessfully');
  assert.deepEqual(counts,{mbti:5,enneagram:9,bigfive:5},
    'Form sliders must exist in a real browser after module initialization');
  assert.equal(diagnostics,'','Browser reported an uncaught initialization error');
  console.log('All 19 input sliders rendered successfully.');
}finally{server.close();}
