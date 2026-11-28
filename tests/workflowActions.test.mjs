import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const workflowPaths = [
  new URL('../.github/workflows/ci.yml', import.meta.url),
  new URL('../.github/workflows/deploy-pages.yml', import.meta.url),
  new URL('../.github/workflows/prepare-lockfiles.yml', import.meta.url),
];

const workflowSources = await Promise.all(
  workflowPaths.map((path) => readFile(path, 'utf8')),
);
const [ciWorkflow, pagesWorkflow, lockfileWorkflow] = workflowSources;

const actionReferences = workflowSources.flatMap((source) =>
  [...source.matchAll(/^\s*(?:-\s*)?uses:\s*([^\s#]+)/gm)].map((match) => match[1]),
);

const reviewedVersions = new Map([
  ['actions/checkout', 'v7.0.1'],
  ['actions/setup-node', 'v7.1.0'],
  ['actions/setup-java', 'v6.3.0'],
  ['actions/configure-pages', 'v6.0.0'],
  ['actions/upload-pages-artifact', 'v5.0.0'],
  ['actions/deploy-pages', 'v5.0.1'],
]);

test('workflows use the reviewed Node 24-compatible action releases', () => {
  for (const [action, version] of reviewedVersions) {
    const matches = actionReferences.filter((reference) => reference.startsWith(`${action}@`));
    assert.ok(matches.length > 0, `${action} is missing from the workflows`);
    assert.ok(
      matches.every((reference) => reference === `${action}@${version}`),
      `${action} must use ${version}; found: ${matches.join(', ')}`,
    );
  }
});

test('checkout steps do not persist the GitHub token in local Git configuration', () => {
  for (const source of workflowSources) {
    const checkoutCount = [...source.matchAll(/^\s*(?:-\s*)?uses:\s*actions\/checkout@/gm)].length;
    const disabledCredentialCount = [...source.matchAll(/^\s+persist-credentials:\s*false\s*$/gm)].length;
    assert.equal(disabledCredentialCount, checkoutCount);
  }
});

test('Pages write permissions are limited to the deployment job', () => {
  const deploySection = pagesWorkflow.split('\n  deploy:\n')[1] ?? '';

  assert.match(pagesWorkflow, /^permissions:\n  contents: read$/m);
  assert.match(pagesWorkflow, /^  build:\n    runs-on: ubuntu-latest\n    permissions:\n      contents: read$/m);
  assert.match(deploySection, /^    permissions:\n      pages: write\n      id-token: write$/m);
  assert.doesNotMatch(pagesWorkflow, /^  pages: write$/m);
});

test('Java compiler annotations remain enabled after the setup-java v6.3 default change', () => {
  assert.match(ciWorkflow, /^\s+problem-matcher: true\s*$/m);
});

test('CI and Pages use lockfile-backed clean installs and cache the correct npm data', () => {
  assert.match(ciWorkflow, /cache: npm\s+cache-dependency-path: package-lock\.json/);
  assert.match(ciWorkflow, /cache: npm\s+cache-dependency-path: backend\/package-lock\.json/);
  assert.equal([...ciWorkflow.matchAll(/run: npm ci/g)].length, 2);
  assert.doesNotMatch(ciWorkflow, /^\s+run: npm install\s*$/m);

  assert.match(pagesWorkflow, /cache: npm\s+cache-dependency-path: package-lock\.json/);
  assert.match(pagesWorkflow, /run: npm ci/);
  assert.doesNotMatch(pagesWorkflow, /^\s+run: npm install\s*$/m);
});

test('lockfile refresh workflow is script-free and pushes only to a review branch', () => {
  assert.match(lockfileWorkflow, /^permissions:\n  contents: read$/m);
  assert.match(lockfileWorkflow, /^    permissions:\n      contents: write$/m);
  assert.match(lockfileWorkflow, /workflow_dispatch:/);
  assert.equal([...lockfileWorkflow.matchAll(/npm install --package-lock-only --ignore-scripts/g)].length, 2);
  assert.match(lockfileWorkflow, /persist-credentials: false/);
  assert.match(lockfileWorkflow, /GITHUB_TOKEN: \$\{\{ github\.token \}\}/);
  assert.match(lockfileWorkflow, /branch="automation\/npm-lockfiles-\$\{GITHUB_RUN_ID\}"/);
  assert.match(lockfileWorkflow, /git add -f package-lock\.json backend\/package-lock\.json/);
  assert.match(lockfileWorkflow, /git commit -m "Add reproducible npm dependency lockfiles"/);
  assert.doesNotMatch(lockfileWorkflow, /refs\/heads\/main/);
});

for (const project of [
  { label: 'frontend', prefix: '../' },
  { label: 'backend', prefix: '../backend/' },
]) {
  const [manifestSource, lockSource] = await Promise.all([
    readFile(new URL(`${project.prefix}package.json`, import.meta.url), 'utf8'),
    readFile(new URL(`${project.prefix}package-lock.json`, import.meta.url), 'utf8'),
  ]);
  const manifest = JSON.parse(manifestSource);
  const lock = JSON.parse(lockSource);

  test(`${project.label} lockfile matches its manifest and pins integrity-checked registry packages`, () => {
    assert.equal(lock.name, manifest.name);
    assert.equal(lock.version, manifest.version);
    assert.equal(lock.lockfileVersion, 3);
    assert.deepEqual(lock.packages[''].dependencies ?? {}, manifest.dependencies ?? {});
    assert.deepEqual(lock.packages[''].devDependencies ?? {}, manifest.devDependencies ?? {});

    const resolvedPackages = Object.entries(lock.packages).filter(
      ([location, metadata]) => location !== '' && metadata.resolved,
    );
    assert.ok(resolvedPackages.length > 0);

    for (const [location, metadata] of resolvedPackages) {
      assert.ok(
        metadata.resolved.startsWith('https://registry.npmjs.org/'),
        `${location} must resolve from the HTTPS npm registry`,
      );
      assert.ok(metadata.integrity, `${location} must have an integrity hash`);
      assert.doesNotMatch(
        metadata.version ?? '',
        /-(?:alpha|beta|rc|pre|canary|nightly|dev)(?:[.-]|$)/i,
        `${location} must not use a prerelease version`,
      );
    }
  });
}
