import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

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
window.addEventListener('load',()=>{
  // Exercise the actual results UI, not merely the slider bootstrap.
  document.getElementById('randomize-button')?.click();
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
      result=await new Promise((ok,fail)=>{
        const proc=spawn(cmd,[
          '--headless=new','--no-sandbox','--disable-dev-shm-usage',
          '--disable-gpu','--no-first-run','--no-default-browser-check',
          '--virtual-time-budget=6000','--dump-dom',
          'http://127.0.0.1:'+port+'/'
        ],{stdio:['ignore','pipe','pipe']});
        let stdout='',stderr='';
        const timer=setTimeout(()=>{proc.kill('SIGKILL');fail(new Error('Chrome startup timed out'));},35000);
        proc.stdout.on('data',chunk=>{stdout+=chunk.toString();});
        proc.stderr.on('data',chunk=>{stderr+=chunk.toString();});
        proc.once('error',err=>{clearTimeout(timer);fail(err);});
        proc.once('close',status=>{clearTimeout(timer);ok({status,stdout,stderr});});
      });
      break;
    }
  }
  if(!result)throw new Error('Chrome/Chromium unavailable: cannot run browser startup smoke test');
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
  assert.ok(html.includes('class="field-report"'),
    'Synthetic sample should render the complete Trainer Field Report');
  assert.equal((html.match(/class="report-tile"/g)||[]).length,8,
    'Report must include all eight analysis sections');
  assert.ok(html.includes('POKÉDEX ENTRY'),
    'Generated report should include the new Pokédex field entry');
  assert.equal((html.match(/class="trainer-step"/g)||[]).length,3,
    'Trainer guide must contain exactly three actionable training directives');
  assert.ok(html.includes('TRAINER PLAYBOOK'),
    'Trainer field guide should present the training steps');
  assert.ok(html.includes('Show the receipts'),
    'Archetype scoring explanation should be visible in results markup');
  assert.equal((html.match(/class="report-score-row"/g)||[]).length,4,
    'Every archetype report should expose four score components');
  console.log('All 19 input sliders rendered successfully.');
}finally{server.close();}
