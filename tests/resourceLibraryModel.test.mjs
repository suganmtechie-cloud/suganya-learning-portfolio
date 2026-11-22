import test from 'node:test'
import assert from 'node:assert/strict'
import {
  filterResources,
  isSafeResourceUrl,
  normalizeResources,
} from '../src/features/resources/resourceLibraryModel.mjs'

const validResource = {
  id: 'resource-1',
  title: 'Coaching practice guide',
  description: 'A short guide for structured coaching conversations.',
  category: 'Design',
  format: 'Guide',
  url: 'https://example.com/coaching',
  createdAt: '2026-11-22T00:00:00.000Z',
}

test('resource links must use HTTPS and cannot include embedded credentials', () => {
  assert.equal(isSafeResourceUrl('https://example.com/guide'), true)
  assert.equal(isSafeResourceUrl('http://example.com/guide'), false)
  assert.equal(isSafeResourceUrl('javascript:alert(1)'), false)
  assert.equal(isSafeResourceUrl('https://user:pass@example.com/guide'), false)
  assert.equal(isSafeResourceUrl('not a url'), false)
})

test('normalization rejects malformed, oversized and unsupported resources', () => {
  const normalized = normalizeResources([
    validResource,
    { ...validResource, id: 'bad-url', url: 'http://example.com' },
    { ...validResource, id: 'bad-category', category: 'Unlisted' },
    { ...validResource, id: 'bad-title', title: 'x' },
    null,
  ])

  assert.equal(normalized.length, 1)
  assert.equal(normalized[0].id, 'resource-1')
})

test('normalization removes duplicate canonical URLs', () => {
  const normalized = normalizeResources([
    validResource,
    { ...validResource, id: 'resource-2', title: 'Another title' },
  ])

  assert.equal(normalized.length, 1)
  assert.equal(normalized[0].id, 'resource-1')
})

test('search and category filters can be combined', () => {
  const resources = normalizeResources([
    validResource,
    {
      ...validResource,
      id: 'resource-2',
      title: 'Assessment rubric',
      description: 'A practical four-level assessment rubric.',
      category: 'Assessment',
      url: 'https://example.com/rubric',
    },
  ])

  assert.deepEqual(filterResources(resources, 'coaching', 'All').map((item) => item.id), ['resource-1'])
  assert.deepEqual(filterResources(resources, 'rubric', 'Assessment').map((item) => item.id), ['resource-2'])
  assert.deepEqual(filterResources(resources, 'coaching', 'Assessment'), [])
})
