import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const workflowPaths = [
  new URL('../.github/workflows/ci.yml', import.meta.url),
  new URL('../.github/workflows/deploy-pages.yml', import.meta.url),
];

const workflowSources = await Promise.all(
  workflowPaths.map((path) => readFile(path, 'utf8')),
);

const actionReferences = workflowSources.flatMap((source) =>
  [...source.matchAll(/^\s*-\s*uses:\s*([^\s#]+)/gm)].map((match) => match[1]),
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
    const checkoutCount = [...source.matchAll(/^\s*-\s*uses:\s*actions\/checkout@/gm)].length;
    const disabledCredentialCount = [...source.matchAll(/^\s+persist-credentials:\s*false\s*$/gm)].length;
    assert.equal(disabledCredentialCount, checkoutCount);
  }
});

test('Pages write permissions are limited to the deployment job', () => {
  const pagesWorkflow = workflowSources[1];

  assert.match(pagesWorkflow, /^permissions:\n  contents: read$/m);
  assert.match(pagesWorkflow, /^  build:\n    permissions:\n      contents: read$/m);
  assert.match(pagesWorkflow, /^  deploy:\n    environment:/m);
  assert.match(pagesWorkflow, /^    permissions:\n      pages: write\n      id-token: write$/m);
  assert.doesNotMatch(pagesWorkflow, /^  pages: write$/m);
});

test('Java compiler annotations remain enabled after the setup-java v6.3 default change', () => {
  assert.match(workflowSources[0], /^\s+problem-matcher: true\s*$/m);
});
