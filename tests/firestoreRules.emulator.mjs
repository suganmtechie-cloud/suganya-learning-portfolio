import { after, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'

const projectId = 'demo-learning-studio'
const rules = await readFile(new URL('../firestore.rules', import.meta.url), 'utf8')

const testEnv = await initializeTestEnvironment({
  projectId,
  firestore: { rules },
})

after(async () => {
  await testEnv.cleanup()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
})

function pathway(ownerId, id = 'pathway-1') {
  return {
    id,
    title: 'New manager onboarding',
    audience: 'New managers',
    outcome: 'Plan and facilitate a structured onboarding',
    level: 'Beginner',
    durationHours: 8,
    createdAt: '2026-11-25T00:00:00.000Z',
    modules: [],
    ownerId,
    updatedAt: serverTimestamp(),
  }
}

function pathwayRef(database, ownerId, pathwayId) {
  return doc(database, 'users', ownerId, 'pathways', pathwayId)
}

test('an owner can create, read, update and delete their own pathway', async () => {
  const database = testEnv.authenticatedContext('alice').firestore()
  const reference = pathwayRef(database, 'alice', 'pathway-1')

  await assertSucceeds(setDoc(reference, pathway('alice')))
  await assertSucceeds(getDoc(reference))
  await assertSucceeds(updateDoc(reference, {
    title: 'Updated manager onboarding',
    updatedAt: serverTimestamp(),
  }))
  await assertSucceeds(deleteDoc(reference))
})

test('a user cannot read or write another user’s pathway path', async () => {
  const aliceDatabase = testEnv.authenticatedContext('alice').firestore()
  const bobDatabase = testEnv.authenticatedContext('bob').firestore()

  await assertSucceeds(setDoc(
    pathwayRef(aliceDatabase, 'alice', 'pathway-1'),
    pathway('alice'),
  ))

  await assertFails(getDoc(pathwayRef(bobDatabase, 'alice', 'pathway-1')))
  await assertFails(setDoc(
    pathwayRef(bobDatabase, 'alice', 'bob-pathway'),
    pathway('bob', 'bob-pathway'),
  ))
})

test('unauthenticated users cannot read or create pathways', async () => {
  const database = testEnv.unauthenticatedContext().firestore()
  const reference = pathwayRef(database, 'alice', 'pathway-1')

  await assertFails(getDoc(reference))
  await assertFails(setDoc(reference, pathway('alice')))
})

test('pathway writes reject invalid owners, extra fields and out-of-range values', async () => {
  const database = testEnv.authenticatedContext('alice').firestore()
  const invalidCases = [
    ['wrong-owner', (data) => { data.ownerId = 'bob' }],
    ['extra-field', (data) => { data.isAdmin = true }],
    ['mismatched-id', (data) => { data.id = 'different-id' }],
    ['short-title', (data) => { data.title = 'No' }],
    ['duration-over-limit', (data) => { data.durationHours = 41 }],
    ['too-many-modules', (data) => {
      data.modules = Array.from({ length: 13 }, (_, index) => ({ id: `module-${index}` }))
    }],
    ['client-controlled-updated-at', (data) => {
      data.updatedAt = '2026-11-25T00:00:00.000Z'
    }],
  ]

  for (const [pathwayId, mutate] of invalidCases) {
    const data = pathway('alice', pathwayId)
    mutate(data)
    await assertFails(setDoc(pathwayRef(database, 'alice', pathwayId), data))
  }
})

test('updates preserve createdAt and require a server-generated updatedAt', async () => {
  const database = testEnv.authenticatedContext('alice').firestore()
  const reference = pathwayRef(database, 'alice', 'pathway-1')

  await assertSucceeds(setDoc(reference, pathway('alice')))
  await assertFails(updateDoc(reference, {
    createdAt: '2026-11-26T00:00:00.000Z',
    updatedAt: serverTimestamp(),
  }))
  await assertFails(updateDoc(reference, {
    updatedAt: '2026-11-25T00:00:00.000Z',
  }))
  await assertSucceeds(updateDoc(reference, {
    title: 'A valid pathway update',
    updatedAt: serverTimestamp(),
  }))
})

test('legacy pathway documents remain available only to their path owner', async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), 'users', 'alice', 'pathways', 'legacy'),
      { title: 'Legacy pathway without ownerId' },
    )
  })

  const aliceDatabase = testEnv.authenticatedContext('alice').firestore()
  const bobDatabase = testEnv.authenticatedContext('bob').firestore()
  const aliceReference = pathwayRef(aliceDatabase, 'alice', 'legacy')

  await assertSucceeds(getDoc(aliceReference))
  await assertFails(getDoc(pathwayRef(bobDatabase, 'alice', 'legacy')))
  await assertSucceeds(deleteDoc(aliceReference))
})

test('unmatched document paths remain denied', async () => {
  const database = testEnv.authenticatedContext('alice').firestore()
  const reference = doc(database, 'private', 'record')

  await assertFails(getDoc(reference))
  await assertFails(setDoc(reference, { ownerId: 'alice' }))
})
