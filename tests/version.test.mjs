import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const pkg=JSON.parse(load('package.json'));

test('app release markers agree on version 1.0.0',()=>{
  assert.equal(pkg.version,'1.0.0');
  assert.match(load('index.html'),/TYPE EFFECTIVELY \/ V1\.0\.0/);
  assert.match(load('index.html'),/name="application-version" content="1\.0\.0"/);
  assert.match(load('README.md'),/Generation model \(v1\.0\)/);
  assert.match(load('CHANGELOG.md'),/## 1\.0\.0/);
});

test('v1.0 retains random exploration, six emblems and 17 generated types',()=>{
  const app=load('src/app.mjs');
  assert.ok(app.includes('generateRandomBuildInput'));
  assert.ok(app.includes('renderLiveRoleWatermark'));
  assert.ok(app.includes('typingWing'));
  assert.match(load('index.html'),/17<\/strong> GENERATED TYPES/);
});
