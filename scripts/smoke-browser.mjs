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
  // Switch to the comprehensive path and exercise real eight-score submission.
  document.querySelector('[data-test-mode="advanced"]')?.click();
  const scores=[20,90,20,30,75,40,25,60];
  scores.forEach((value,index)=>{
    const input=document.getElementById('function-'+index);
    if(!input)return;
    input.value=String(value);
    input.dispatchEvent(new Event('input',{bubbles:true}));
  });
  const rowe=[32,3,4,4,32,14,-4,15,16];
  rowe.forEach((value,index)=>{
    const input=document.getElementById('rowe-'+index);
    if(!input)return;
    input.value=String(value);
    input.dispatchEvent(new Event('input',{bubbles:true}));
  });
  document.getElementById('generate-button')?.click();
  document.documentElement.setAttribute('data-before-identity',document.querySelector('.result-id')?.textContent||'');
  document.documentElement.setAttribute('data-before-suggestion',document.getElementById('mbti-derived')?.textContent||'');
  // Override the reported four-letter type without changing any function totals.
  document.getElementById('mbti-override').value='ENFP';
  document.getElementById('mbti-override').dispatchEvent(new Event('change',{bubbles:true}));
  document.getElementById('function-identity').value='A';
  document.getElementById('function-identity').dispatchEvent(new Event('change',{bubbles:true}));
  document.getElementById('generate-button')?.click();
  document.documentElement.setAttribute('data-after-identity',document.querySelector('.result-id')?.textContent||'');
  document.documentElement.setAttribute('data-after-suggestion',document.getElementById('mbti-derived')?.textContent||'');
  document.documentElement.setAttribute('data-after-nature',document.querySelector('.nature-summary')?.textContent||'');
  document.documentElement.setAttribute('data-rowe-negative',document.getElementById('rowe-6')?.value||'');
  document.documentElement.setAttribute('data-card-version',document.getElementById('build-version-footer')?.textContent||'');
  // Facets must refine the actual browser build, not merely exist as static inputs.
  const facetInputs=document.querySelectorAll('#bigfive-facet-groups input[type="number"]');
  document.documentElement.setAttribute('data-facet-count',String(facetInputs.length));
  const openness=document.getElementById('bigfive-0');
  openness.value='25';openness.dispatchEvent(new Event('input',{bubbles:true}));
  document.getElementById('generate-button')?.click();
  const baseSpA=()=>{
    const label=[...document.querySelectorAll('.stat-radar-label')].find(node=>
      node.querySelector('.stat-radar-label-name')?.textContent==='Sp. Atk');
    return Number(label?.querySelector('.stat-radar-label-base,.stat-radar-label-single')?.textContent);
  };
  const baseline=baseSpA();
  const facetValues=[90,80,25,25,99,25];
  const firstFacet=document.getElementById('facet-0');
  firstFacet.value=String(facetValues[0]);
  firstFacet.dispatchEvent(new Event('input',{bubbles:true}));
  document.getElementById('generate-button')?.click();
  document.documentElement.setAttribute('data-facet-partial-error',
    document.getElementById('form-error')?.textContent||'');
  facetValues.slice(1).forEach((value,i)=>{
    const field=document.getElementById('facet-'+(i+1));
    field.value=String(value);
    field.dispatchEvent(new Event('input',{bubbles:true}));
  });
  document.getElementById('generate-button')?.click();
  document.documentElement.setAttribute('data-facet-spa-delta',String(baseSpA()-baseline));
  document.documentElement.setAttribute('data-facet-result',
    document.querySelector('.explain')?.textContent?.includes('IPIP-NEO facet refinement')?'true':'false');
  document.documentElement.setAttribute('data-facet-status',
    document.getElementById('facet-entry-status')?.textContent||'');
  // Exercise the post-result EV trainer and both export affordances.
  document.getElementById('ev-reset')?.click();
  document.documentElement.setAttribute('data-ev-after-reset',document.getElementById('ev-budget-count')?.textContent||'');
  document.getElementById('ev-suggest')?.click();
  document.documentElement.setAttribute('data-ev-after-suggest',document.getElementById('ev-budget-count')?.textContent||'');
  document.documentElement.setAttribute('data-trained-hp',document.querySelector('[data-trained-stat="hp"]')?.textContent||'');
  document.documentElement.setAttribute('data-personality-export',Boolean(document.getElementById('download-card')));
  document.documentElement.setAttribute('data-trained-export',Boolean(document.getElementById('download-trained-card')));
  document.dispatchEvent(new CustomEvent('type-effectively:release-version',{detail:{version:'v2.0.8'}}));
  document.documentElement.setAttribute('data-verified-version',document.getElementById('build-version-footer')?.textContent||'');
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
    bigfive:(html.match(/data-score="bigfive"/g)||[]).length,
    functions:(html.match(/aria-label="[A-Z][a-z] overall score"/g)||[]).length,
    rowe:(html.match(/aria-label="Rowe type [1-9] raw total"/g)||[]).length
  };
  console.log('Browser initialization:',JSON.stringify({counts,diagnostics,status:result.status}));
  if(counts.mbti!==5||counts.enneagram!==9||counts.bigfive!==5){
    console.error('Chrome diagnostics:',result.stderr?.slice(-3500));
    console.error('Error attribute:',diagnostics);
    console.error('Module and HTML context:',html.slice(0,1800));
  }
  assert.equal(result.status,0,'Chrome exited unsuccessfully');
  assert.deepEqual(counts,{mbti:5,enneagram:9,bigfive:5,functions:8,rowe:9},
    'All 19 sliders, eight function fields and nine Rowe fields must exist after initialization');
  assert.match(html,/data-before-suggestion="[^"]*Game-derived preference: INTJ/,
    'Function mode should show its initial inferred identity');
  assert.match(html,/data-before-identity="[^"]*INTJ"/,
    'Unknown A\/T should not create a letter suffix');
  assert.match(html,/data-after-identity="[^"]*ENFP-A"/,
    'Sakinorva four-letter override and optional A\/T should be reflected in results');
  assert.match(html,/data-after-suggestion="[^"]*function-derived suggestion: INTJ/,
    'Original function-derived suggestion should remain visible beside the manual type');
  assert.match(html,/data-after-nature="[^"]*[A-Za-z]+ Nature/,
    'Whole-profile Nature should be shown after the overridden build is generated');
  assert.ok(html.includes('class="nature-detail"')&&html.includes('tradeoff fit'),
    'Nature score and factors should appear in the results');
  assert.ok(html.includes('data-test-mode="advanced" aria-pressed="true"'),
    'Comprehensive path should activate');
  assert.ok(html.includes('Input notes:'),
    'Advanced input sources must be disclosed in the completed build');
  assert.ok(html.includes('Rowe signed totals were mapped'),
    'Rowe conversion must be disclosed');
  assert.ok(html.includes('data-rowe-negative="-4"'),
    'Negative Rowe scores must survive direct entry');
  assert.ok(html.includes('data-facet-count="30"'),'all thirty optional IPIP facet fields must render');
  assert.ok(html.includes('data-facet-partial-error="Complete all six Openness facets'),
    'a partly completed facet group must not silently fabricate missing inputs');
  assert.ok(Number(html.match(/data-facet-spa-delta="([^"]+)"/)?.[1])>0,
    'high Intellect/Imagination at low overall Openness must raise Sp. Atk');
  assert.ok(html.includes('data-facet-result="true"'),'facet scoring must appear in result explanations');
  assert.ok(html.includes('data-facet-status="1 of five domain(s) refined'),
    'facet entry status must show fallback for remaining domains');
  assert.ok(html.includes('data-card-version="CREATED v2.0.0"'),
    'Card footer must show the bundled version when the build is generated');
  assert.ok(html.includes('data-verified-version="CREATED v2.0.8"'),
    'Card footer must update when the published release is verified');
  assert.ok(html.includes('data-ev-after-reset="0 / 508"'),
    'EV trainer should reset to a truly untrained spread');
  assert.ok(html.includes('data-ev-after-suggest="508 / 508"'),
    'EV trainer should restore a useful role-based suggestion');
  assert.match(html,/data-trained-hp="[0-9]+"/,
    'Trainer should render actual level-100 stat numbers');
  assert.ok(html.includes('data-personality-export="true"') &&
    html.includes('data-trained-export="true"'),
    'Both personality and trained export actions should be present');
  assert.ok(html.includes('data-ennea-mode="rowe" aria-pressed="true"'),
    'Comprehensive path should activate signed Rowe input');
  assert.ok(html.includes('sakinorva.net/test/function_bunya'),
    'Comprehensive path should link to the suggested function test');
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
  console.log('All 19 sliders, eight function inputs and nine Rowe inputs rendered; advanced build generated.');
}finally{server.close();}
