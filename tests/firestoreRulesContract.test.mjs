import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const rules = await readFile(new URL('../firestore.rules', import.meta.url), 'utf8')

test('pathway reads and deletes stay scoped to the authenticated path owner', () => {
  assert.match(rules, /function isSignedInAs\(userId\)/)
  assert.match(rules, /request\.auth\.uid == userId/)
  assert.match(rules, /allow read, delete: if isSignedInAs\(userId\)/)
  assert.match(rules, /match \/users\/\{userId\}\/pathways\/\{pathwayId\}/)
})

test('pathway writes require an explicit schema allowlist and required fields', () => {
  assert.match(rules, /data\.keys\(\)\.hasAll\([\s\S]*?'ownerId'[\s\S]*?'updatedAt'[\s\S]*?\)/)
  assert.match(rules, /data\.keys\(\)\.hasOnly\([\s\S]*?'ownerId'[\s\S]*?'updatedAt'[\s\S]*?\)/)
  assert.match(rules, /data\.id == pathwayId/)
  assert.match(rules, /data\.ownerId == userId/)
})

test('pathway field types and size boundaries are enforced by the rules source', () => {
  assert.match(rules, /data\.title\.size\(\) >= 3/)
  assert.match(rules, /data\.title\.size\(\) <= 80/)
  assert.match(rules, /data\.audience\.size\(\) <= 100/)
  assert.match(rules, /data\.outcome\.size\(\) <= 240/)
  assert.match(rules, /data\.level in \['Beginner', 'Intermediate', 'Advanced'\]/)
  assert.match(rules, /data\.durationHours is int/)
  assert.match(rules, /data\.durationHours <= 40/)
  assert.match(rules, /data\.modules is list/)
  assert.match(rules, /data\.modules\.size\(\) <= 12/)
})

test('updates preserve creation time and require a server-generated update timestamp', () => {
  assert.match(rules, /request\.resource\.data\.createdAt == resource\.data\.createdAt/)
  assert.match(rules, /data\.updatedAt == request\.time/)
})

test('all unmatched document paths remain denied', () => {
  assert.match(rules, /match \/\{document=\*\*\}\s*\{\s*allow read, write: if false;/)
})
