import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
const engine=readFileSync(new URL('../src/engine.mjs',import.meta.url),'utf8');

test('application and scoring engine share a deliberate cache invalidation key',()=>{
  const entry=html.match(/src="\.\/src\/app\.mjs\?v=([^"]+)"/)?.[1];
  const scoring=app.match(/from '\.\/engine\.mjs\?v=([^']+)'/)?.[1];
  assert.ok(entry,'entry script needs a versioned module URL');
  assert.ok(scoring,'app must version the engine import');
  assert.equal(entry,scoring,'entry and engine must be refreshed together');
  assert.equal(entry,'v2-facet-first-1','V2 must not reuse a V1 scoring module cache');
  assert.notEqual(entry,'1.2.0','scoring engine must not reuse the pre-PR #27 cache key');
  assert.match(engine,/if\(growth==='Baton Pass' && !hasBatonPassSetup/);
});

test('release badge and actual engine can have independent cache states',()=>{
  // The badge is resolved from the published Pages commit asynchronously.
  // A new release label does not by itself invalidate browser ESM module URLs.
  const release=readFileSync(new URL('../src/release-version.mjs',import.meta.url),'utf8');
  assert.match(release,/deploy-revision\.json/);
  assert.match(release,/type-effectively:release-version/);
  assert.match(html,/app\.mjs\?v=/);
});

test('Nature engine, source data and new explanation styling cannot reuse old browser caches',()=>{
  const nature=readFileSync(new URL('../src/nature.mjs',import.meta.url),'utf8');
  const entry=html.match(/app\.mjs\?v=([^"]+)/)?.[1];
  const style=html.match(/styles\.css\?v=([^"]+)/)?.[1];
  const dataKey=source=>source.match(/from '\.\/data\.mjs\?v=([^']+)'/)?.[1];
  assert.ok(entry&&style&&dataKey(app)&&dataKey(engine)&&dataKey(nature));
  assert.notEqual(entry,'1.3.0');
  assert.equal(entry,style);
  assert.equal(dataKey(app),dataKey(engine));
  assert.equal(dataKey(app),dataKey(nature));
  assert.equal(entry,dataKey(engine));
});
