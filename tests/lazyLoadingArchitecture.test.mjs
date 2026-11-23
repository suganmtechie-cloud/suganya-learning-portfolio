import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

async function readSource(path) {
  return readFile(new URL('../' + path, import.meta.url), 'utf8')
}

test('authentication and resource library are outside the initial App imports', async () => {
  const app = await readSource('src/App.tsx')
  assert.match(app, /lazy\(\(\) => import\(['"]\.\/features\/auth\/FirebaseAuthPanel['"]\)\)/)
  assert.match(app, /DeferredResourceLibrary/)
  assert.doesNotMatch(app, /import\s+FirebaseAuthPanel\s+from/)
  assert.doesNotMatch(app, /import\s+ResourceLibrary\s+from/)
})

test('resource library waits until the section is near the viewport', async () => {
  const source = await readSource('src/features/resources/DeferredResourceLibrary.tsx')
  assert.match(source, /IntersectionObserver/)
  assert.match(source, /lazy\(\(\) => import\(['"]\.\/ResourceLibrary['"]\)\)/)
  assert.match(source, /rootMargin: '600px 0px'/)
})

test('module and lesson editor are split from the initial workspace chunk', async () => {
  const workspace = await readSource('src/features/pathways/PathwayWorkspace.tsx')
  assert.match(workspace, /lazy\(\(\) => import\(['"]\.\/ModuleOutlineEditor['"]\)\)/)
  assert.match(workspace, /<Suspense/)
})

test('Firestore SDK is deferred until the repository requests its adapter', async () => {
  const repository = await readSource('src/lib/pathwayRepository.ts')
  const config = await readSource('src/lib/firebase.ts')
  assert.match(repository, /import\(['"]\.\/firebasePathwayStore['"]\)/)
  assert.doesNotMatch(repository, /from\s+['"]\.\/firebasePathwayStore['"]/)
  assert.match(config, /import\(['"]firebase\/firestore['"]\)/)
  assert.doesNotMatch(config, /from\s+['"]firebase\//)
})
