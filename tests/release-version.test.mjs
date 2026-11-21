import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fetchPublishedVersion, versionForRevision } from '../src/release-version.mjs';

const baseline = '2d7feae340f2a0fa3fc2836f077851e1f13bc48a';
const published = 'f'.repeat(40);
const previous = 'a'.repeat(40);
const sample = [
  { tag_name: 'v1.1.2', target_commitish: previous, draft: false },
  { tag_name: 'v1.1.1', target_commitish: published, draft: false },
  { tag_name: 'v1.2.0', target_commitish: published, draft: false },
  { tag_name: 'v1.1.3', target_commitish: published, draft: true }
];

test('only the published commit selects a matching v1.1 patch release', () => {
  assert.equal(versionForRevision(published, sample), '1.1.1');
  assert.equal(versionForRevision(previous, sample), '1.1.2');
  assert.equal(versionForRevision('b'.repeat(40), sample), null);
  assert.equal(versionForRevision('{{ site.github.build_revision }}', sample), null);
  assert.equal(versionForRevision(published, [{ tag_name:'v1.1.4', target_commitish: published, draft: true }]), null);
});

test('v1.1.0 baseline works before any release tag exists', async () => {
  const version = await fetchPublishedVersion(async () => ({
    ok: true, json: async () => ({ revision: baseline })
  }));
  assert.equal(version, '1.1.0');
});

test('version lookup never uses the latest release from another commit', async () => {
  const requests = [];
  const version = await fetchPublishedVersion(async url => {
    requests.push(url);
    return {
      ok: true,
      json: async () => url.endsWith('deploy-revision.json')
        ? { revision: published } : sample
    };
  });
  assert.equal(version, '1.1.1');
  assert.equal(requests.length, 2);
  assert.match(requests[1], /github\.com\/repos\/Aetherayel\/Type-Effectively\/releases/);
});

test('unrendered local Jekyll template leaves the baseline UI unchanged', async () => {
  let requests = 0;
  const result = await fetchPublishedVersion(async () => {
    requests++;
    return { ok: true, json: async () => ({ revision: '{{ site.github.build_revision }}' }) };
  });
  assert.equal(result, null);
  assert.equal(requests, 1);
});

test('release workflow tracks merged PRs, not arbitrary new main commits', () => {
  const workflow = readFileSync(new URL('../.github/workflows/version-release.yml', import.meta.url), 'utf8');
  const template = readFileSync(new URL('../deploy-revision.json', import.meta.url), 'utf8');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(workflow, /types: \[closed\]/);
  assert.match(workflow, /github\.event\.pull_request\.merged == true/);
  assert.match(workflow, /git log --first-parent/);
  assert.match(workflow, /pages build and deployment/);
  assert.match(workflow, /gh release create/);
  assert.ok(template.includes('{{ site.github.build_revision }}'));
  assert.match(html, /id="release-version"/);
  assert.match(html, /id="footer-version"/);
  assert.match(html, /src="\.\/src\/release-version\.mjs"/);
});
