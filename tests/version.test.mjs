import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const pkg=JSON.parse(load('package.json'));

test('app release markers agree on the package version',()=>{
  const version=pkg.version;
  const minor=version.split('.').slice(0,2).join('.');
  assert.ok(load('index.html').includes('TYPE EFFECTIVELY / V'+version));
  assert.ok(load('index.html').includes('name="application-version" content="'+version+'"'));
  assert.ok(load('README.md').includes('Generation model (v'+minor));
  assert.ok(load('CHANGELOG.md').includes('## '+version));
});

test('v1.0 retains random exploration, six emblems and 17 generated types',()=>{
  const app=load('src/app.mjs');
  assert.ok(app.includes('generateRandomBuildInput'));
  assert.ok(app.includes('renderLiveRoleWatermark'));
  assert.ok(app.includes('typingWing'));
  assert.match(load('index.html'),/17<\/strong> GENERATED TYPES/);
});
