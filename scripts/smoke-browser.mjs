import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve, extname, join } from 'node:path';
import { tmpdir } from 'node:os';
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
window.addEventListener('DOMContentLoaded',()=>{
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
    // No external font loading during CI: a stalled third-party stylesheet
    // must not determine whether our own JavaScript works.
    if(path.endsWith('/styles.css'))body=Buffer.from(
      body.toString().replace(/^@import\s+url\([^;]+;\s*/,''));
    if(path.endsWith('/index.html'))body=Buffer.from(
      body.toString().replace('<script type="module"',instrumentation+'<script type="module"'));
    res.setHeader('Content-Type',mime[extname(path)]||'application/octet-stream');
    res.end(body);
  }catch(error){res.writeHead(404);res.end(String(error.message));}
});
await new Promise((ok,fail)=>server.once('error',fail).listen(port,'127.0.0.1',ok));
try{
  const candidates=['google-chrome','google-chrome-stable','chromium','chromium-browser'];
  const executable=candidates.find(cmd=>spawnSync('which',[cmd],{encoding:'utf8'}).status===0);
  if(!executable)throw new Error('Chrome/Chromium unavailable: cannot run browser startup smoke test');

  // A clean profile prevents collisions with other browser processes on shared
  // runners. Retry only a stalled Chrome startup, never failing assertions.
  const runChrome=async (timeoutMs)=>{
    const profile=mkdtempSync(join(tmpdir(),'type-effectively-smoke-'));
    try{
      return await new Promise((ok,fail)=>{
        const proc=spawn(executable,[
          '--headless=new','--no-sandbox','--disable-dev-shm-usage',
          '--disable-gpu','--disable-background-networking',
          '--disable-extensions','--blink-settings=imagesEnabled=false',
          '--no-first-run','--no-default-browser-check',
          '--user-data-dir='+profile,
          '--virtual-time-budget=4500','--dump-dom',
          'http://127.0.0.1:'+port+'/'
        ],{stdio:['ignore','pipe','pipe']});
        let stdout='',stderr='',timedOut=false;
        const timer=setTimeout(()=>{timedOut=true;proc.kill('SIGKILL');},timeoutMs);
        proc.stdout.on('data',chunk=>{stdout+=chunk.toString();});
        proc.stderr.on('data',chunk=>{stderr+=chunk.toString();});
        proc.once('error',error=>{clearTimeout(timer);fail(error);});
        proc.once('close',status=>{clearTimeout(timer);ok({status,stdout,stderr,timedOut});});
      });
    }finally{
      rmSync(profile,{recursive:true,force:true});
    }
  };
  let result=await runChrome(25000);
  if(result.timedOut){
    console.warn('Headless Chrome stalled on first attempt; retrying with a fresh profile.',
      'stderr:',result.stderr.slice(-1400),'output bytes:',result.stdout.length);
    result=await runChrome(35000);
  }
  if(result.timedOut)throw new Error(
    'Headless Chrome timed out twice; last stderr: '+result.stderr.slice(-1800)+
    '; partial output bytes: '+result.stdout.length);
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
