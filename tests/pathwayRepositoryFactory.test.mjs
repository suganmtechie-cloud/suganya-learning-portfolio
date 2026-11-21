import test from 'node:test'
import assert from 'node:assert/strict'
import { createPathwayRepository } from '../src/lib/pathwayRepositoryFactory.mjs'

test('repository factory rejects incomplete storage adapters', () => {
  assert.throws(() => createPathwayRepository(null), /must implement list, save and remove/)
  assert.throws(() => createPathwayRepository({ list() {}, save() {} }), /must implement list, save and remove/)
})

test('repository delegates list, save and remove without changing ownership arguments', async () => {
  const calls = []
  const pathway = { id: 'path-1', title: 'Coaching essentials' }
  const store = {
    async list(ownerId) { calls.push(['list', ownerId]); return [pathway] },
    async save(ownerId, value) { calls.push(['save', ownerId, value]) },
    async remove(ownerId, pathwayId) { calls.push(['remove', ownerId, pathwayId]) },
  }
  const repository = createPathwayRepository(store)

  assert.deepEqual(await repository.list('user-7'), [pathway])
  await repository.save('user-7', pathway)
  await repository.remove('user-7', 'path-1')

  assert.deepEqual(calls, [
    ['list', 'user-7'],
    ['save', 'user-7', pathway],
    ['remove', 'user-7', 'path-1'],
  ])
  assert.equal(Object.isFrozen(repository), true)
})

test('repository propagates storage failures to the caller', async () => {
  const failure = new Error('Storage is unavailable')
  const repository = createPathwayRepository({
    list: async () => { throw failure },
    save: async () => {},
    remove: async () => {},
  })

  await assert.rejects(repository.list('user-7'), failure)
})
