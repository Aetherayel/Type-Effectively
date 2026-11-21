import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { deriveTritype, generateBuild, normalizeRoweScores } from '../src/engine.mjs';
import { DEMOS } from '../src/data.mjs';

const raw=[32,3,4,4,32,14,-4,15,16];
const base={mbtiScores:DEMOS.architect.mbti,bigFive:DEMOS.architect.bigfive};

test('Rowe accepts signed raw totals and maps all nine without fabricating percentages',()=>{
  const mapped=normalizeRoweScores(raw);
  assert.equal(mapped.length,9);
  assert.ok(mapped.every(x=>x>=0&&x<=100));
  assert.equal(mapped[0],mapped[4], 'equally scored types stay tied');
  assert.ok(Math.abs(mapped[0]-78.8)<1e-9);
  assert.ok(Math.abs(mapped[6]-21.2)<1e-9);
  assert.equal(deriveTritype(mapped),'153');
  assert.deepEqual(normalizeRoweScores(raw.map(x=>x+200)),mapped,
    'uniform offsets should not change relative scores');
  assert.deepEqual(normalizeRoweScores(Array(9).fill(-17)),Array(9).fill(50),
    'a flat profile must not be stretched to artificial extremes');
});

test('closely clustered Rowe results retain small differences',()=>{
  const mapped=normalizeRoweScores([4,5,6,7,8,9,10,11,12]);
  assert.ok(Math.max(...mapped)-Math.min(...mapped)<15);
  assert.ok(mapped[8]>mapped[7]);
  assert.throws(()=>normalizeRoweScores([1,2]),/nine finite/);
  assert.throws(()=>normalizeRoweScores([...raw.slice(0,8),'x']),/nine finite/);
  assert.throws(()=>normalizeRoweScores([...raw.slice(0,8),NaN]),/nine finite/);
});

test('Rowe input shares the existing Enneagram engine, respects tritype override and wing',()=>{
  const b=generateBuild({...base,roweScores:raw,tritypeOverride:'513'});
  const control=generateBuild({...base,enneagramScores:normalizeRoweScores(raw),tritypeOverride:'513'});
  assert.equal(b.tritype,'513');
  assert.equal(b.suggestedTritype,'153');
  assert.equal(b.wing,6);
  assert.equal(b.typingWing,6);
  assert.equal(b.enneagramSource,'rowe');
  assert.deepEqual(b.baseStats,control.baseStats);
  assert.deepEqual(b.types,control.types);
  assert.deepEqual(b.moves,control.moves);
  assert.ok(b.warnings.some(w=>w.includes('Rowe signed totals')));
  assert.equal(Object.values(b.baseStats).reduce((a,x)=>a+x,0),535);
  assert.deepEqual(generateBuild({...base,roweScores:raw}).baseStats,generateBuild({...base,roweScores:raw}).baseStats);
  assert.throws(()=>generateBuild({...base,roweScores:raw,enneagramScores:DEMOS.architect.enneagram}),/not both/);
});

test('Rowe entry is selectable and roundtrippable, while 0–100 inputs remain supported',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
  assert.match(html,/data-ennea-mode="rowe"/);
  assert.match(html,/id="rowe-score-fields"/);
  assert.match(html,/Negative values are supported/);
  assert.match(app,/roweScores=readRoweScores\(\)/);
  assert.match(app,/input\.roweScores/);
  assert.match(app,/state\.touched\.rowe=true/);
  assert.match(app,/setMode\('ennea',advanced\?'rowe':'scores'\)/);
  const original=generateBuild({...base,enneagramScores:DEMOS.architect.enneagram});
  assert.equal(original.enneagramSource,'standard');
});
