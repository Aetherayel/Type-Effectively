import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DEMOS, STAT_KEYS } from '../src/data.mjs';
import { generateCompleteBuild } from '../src/engine.mjs';
import { buildCreaturePrompt } from '../src/creature-workshop.mjs';
const b = generateCompleteBuild({mbtiScores:DEMOS.architect.mbti, enneagramScores:DEMOS.architect.enneagram, bigFive:DEMOS.architect.bigfive});
test('default prompt is self-contained, deterministic and does not include raw inputs',()=>{
  const p=buildCreaturePrompt(b);
  assert.equal(p,buildCreaturePrompt(b));
  for(const value of [b.title,b.identity,b.tritype,b.types.join(' / '),b.nature,b.ability.name,b.hiddenAbility,b.heldItem.name,...b.moves.map(m=>m.name),...STAT_KEYS.map(k=>String(b.baseStats[k])),b.report.growth]) assert.ok(p.includes(value),value);
  assert.match(p,/600 BST, before Nature/);
  assert.doesNotMatch(p,/undefined|null|mbtiScores|enneagramScores|bigFive|#build=/);
});
test('optional inspirations and additional direction augment the prompt without changing the build',()=>{
  const before=JSON.stringify(b);
  const p=buildCreaturePrompt(b,{creature:'  musk ox  ',environment:'glacial metal',symbolism:'winter guardian',style:'pixel art',details:'Symmetrical horns'});
  for(const value of ['musk ox','glacial metal','winter guardian','pixel art','Symmetrical horns']) assert.ok(p.includes(value));
  assert.equal(JSON.stringify(b),before);
  assert.equal(buildCreaturePrompt(b,{creature:'   '}),buildCreaturePrompt(b));
});
test('synthetic provenance and optional specialization are retained',()=>{
  const p=buildCreaturePrompt({...b,isSample:true,signatureStrategy:{name:'Example strategy',mechanism:'Example mechanism',insight:'Example insight'}});
  assert.match(p,/random sample \/ synthetic scores/);
  assert.match(p,/Signature strategy: Example strategy/);
  assert.match(p,/Strategy mechanism: Example mechanism/);
  assert.doesNotMatch(buildCreaturePrompt(b),/random sample \/ synthetic scores/);
});
test('workshop appears after training, before relatives, and uses clipboard handler',()=>{
  const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
  assert.ok(app.indexOf("renderTrainingPanel(build,$('result-container')")<app.indexOf("renderCreatureWorkshop(build,$('result-container')"));
  assert.ok(app.indexOf("renderCreatureWorkshop(build,$('result-container')")<app.indexOf("renderRelatives(build,$('result-container')"));
  assert.match(app,/onCopy:prompt=>copyText\(prompt,/);
});
