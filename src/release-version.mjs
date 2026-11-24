// A release number is shown only when GitHub Pages has served the exact
// commit to which that GitHub Release points. Unpublished main commits and
// slow browser caches cannot make the visible version jump forward.
const RELEASES_URL = 'https://api.github.com/repos/Aetherayel/Type-Effectively/releases?per_page=100';
const SHA_PATTERN = /^[0-9a-f]{40}$/i;
const PATCH_TAG_PATTERN = /^v(?:1\.(?:1|2|3|4)|2\.(?:0|1))\.(?:0|[1-9][0-9]*)$/;

export function versionForRevision(revision, releases) {
  if (!SHA_PATTERN.test(revision) || !Array.isArray(releases)) return null;
  // Keep historical minor releases visible, preferring the newest valid
  // highest semver tag when multiple releases point at one published revision.
  const matches = releases.filter(release =>
    release?.draft === false &&
    PATCH_TAG_PATTERN.test(release.tag_name) &&
    release.target_commitish?.toLowerCase() === revision.toLowerCase()
  );
  const versionParts = release => release.tag_name.slice(1).split('.').map(Number);
  matches.sort((a,b) => {
    const left=versionParts(a),right=versionParts(b);
    for(let i=0;i<3;i++) if(right[i]!==left[i]) return right[i]-left[i];
    return 0;
  });
  return matches.length ? matches[0].tag_name.slice(1) : null;
}

export async function fetchPublishedVersion(fetcher = fetch) {
  const revisionResponse = await fetcher('./deploy-revision.json', { cache: 'no-store' });
  if (!revisionResponse.ok) return null;
  const { revision } = await revisionResponse.json();
  if (!SHA_PATTERN.test(revision)) return null; // local, unprocessed Jekyll template
  // v1.1.0 was already deployed before this automatic release mechanism existed.
  if (revision.toLowerCase() === '2d7feae340f2a0fa3fc2836f077851e1f13bc48a') return '1.1.0';
  const response = await fetcher(RELEASES_URL, {
    cache: 'no-store',
    headers: { Accept: 'application/vnd.github+json' }
  });
  if (!response.ok) return null;
  return versionForRevision(revision, await response.json());
}

if (typeof document !== 'undefined') {
  fetchPublishedVersion().then(version => {
    if (!version) return;
    const label = 'v' + version;
    const header = document.getElementById('release-version');
    const footer = document.getElementById('footer-version');
    if (header) {
      header.textContent = label;
      header.title = 'Published GitHub Pages release ' + label;
    }
    if (footer) footer.textContent = 'TYPE EFFECTIVELY / ' + label.toUpperCase();
    const meta = document.querySelector('meta[name="application-version"]');
    if (meta) meta.content = version;
    // Cards generated before this asynchronous verification can replace their
    // provisional bundled minor version with the exact published patch number.
    document.dispatchEvent(new CustomEvent('type-effectively:release-version', {
      detail: { version: label }
    }));
  }).catch(() => {
    // An offline connection or GitHub API limit must never block the app.
  });
}
