import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DEMOS, STAT_KEYS, STAT_NAMES } from '../src/data.mjs';
import { generateBuild } from '../src/engine.mjs';
import { buildCardSvg, buildTrainedCardSvg, CARD_HEIGHT, CARD_WIDTH } from '../src/export-card.mjs';
import { level100Stats, suggestTrainingEvs, validTrainingEvs } from '../src/ev-training.mjs';

const createBuild = () => ({
  ...generateBuild({
    mbtiScores: DEMOS.architect.mbti,
    enneagramScores: DEMOS.architect.enneagram,
    bigFive: DEMOS.architect.bigfive
  }),
  createdVersion: 'v1.3.0',
  renderVersion: 'v1.3.0'
});

test('personality card remains an independent original with base radar and unchanged provenance', () => {
  const b=createBuild();
  const original=buildCardSvg(b);
  const training=suggestTrainingEvs(b);
  const trained=buildTrainedCardSvg(b,training);
  assert.equal(buildCardSvg(b),original,'training export must not mutate identity card');
  assert.ok(original.includes('>BASE STATS</text>'));
  assert.ok(original.includes('>600 BST</text>'));
  assert.ok(original.includes('class="stat-radar"'));
  assert.ok(!original.includes('>TRAINED STATS</text>'));
  assert.ok(!original.includes('LEVEL 100 · 31 IVs'));
  assert.ok(!trained.includes('class="stat-radar"'),'trained card replaces the radar, not overlays it');
  assert.equal(CARD_WIDTH,960);
  assert.equal(CARD_HEIGHT,1700);
});

test('trained card exports exact EV allocation, official level 100 stats, and shared identity', () => {
  const b=createBuild();
  const evs=[252,0,252,0,4,0];
  assert.ok(validTrainingEvs(evs));
  const final=level100Stats(b.baseStats,b.natureBoost,b.natureDrop,evs);
  const svg=buildTrainedCardSvg(b,evs);
  assert.ok(svg.includes('>TRAINED STATS</text>'));
  assert.ok(svg.includes('>LEVEL 100 · 31 IVs</text>'));
  assert.ok(svg.includes('EVs: 508 / 508 USEFUL'));
  for(let i=0;i<STAT_KEYS.length;i++) {
    assert.ok(svg.includes('>'+STAT_NAMES[i]+'</text>'),STAT_KEYS[i]+' name');
    assert.ok(svg.includes('>'+b.baseStats[STAT_KEYS[i]]+'</text>'),STAT_KEYS[i]+' base');
    assert.ok(svg.includes('>'+evs[i]+'</text>'),STAT_KEYS[i]+' EVs');
    assert.ok(svg.includes('>'+final[STAT_KEYS[i]]+'</text>'),STAT_KEYS[i]+' level 100 result');
  }
  for(const text of [b.title,b.ability.name,b.hiddenAbility,b.heldItem.name,...b.moves.map(m=>m.name),'CREATED v1.3.0'])
    assert.ok(svg.includes(text),'both exports retain '+text);
  assert.ok(!svg.includes(b.report.reasoning),'never export the long personality rationale');
});

test('trained export rejects invalid EV distributions, supports empty and custom spreads', () => {
  const b=createBuild();
  for(const invalid of [null, [], [256,0,0,0,0,0], [252,252,8,0,0,0], [1,0,0,0,0,0]])
    assert.throws(()=>buildTrainedCardSvg(b,invalid),/valid EV spread/);
  const empty=buildTrainedCardSvg(b,[0,0,0,0,0,0]);
  assert.ok(empty.includes('EVs: 0 / 508 USEFUL'));
  const trained=buildTrainedCardSvg(b,[0,252,0,252,4,0]);
  assert.notEqual(empty,trained,'different trainer investments create different exports');
});

test('results offer distinct personality and trained downloads while shares preserve EVs', () => {
  const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const packageJson=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
  assert.ok(app.includes('Download Personality Card ↓'));
  assert.ok(app.includes('Download Trained Build ↓'));
  assert.ok(app.includes('id="download-trained-card"'));
  assert.ok(app.includes('downloadCardPng(build)'));
  assert.ok(app.includes('downloadTrainedCardPng(build, state.lastTrainingEvs)'));
  assert.ok(app.includes('trainingEvs:state.lastTrainingEvs'));
  assert.ok(app.includes('state.lastTrainingEvs=payload.trainingEvs'));
  assert.equal(packageJson.version,'2.0.0');
  assert.match(html,/application-version" content="2\.0\.0"/);
  assert.match(html,/src\/app\.mjs\?v=[\w.-]+/,'entry cache key is distinct from release version');
});
