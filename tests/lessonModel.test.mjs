import test from 'node:test'
import assert from 'node:assert/strict'
import {
  isHttpsUrl,
  isLessonContentValid,
  normalizeLessons,
  reorderLessons,
  MAX_LESSONS_PER_MODULE,
} from '../src/features/pathways/lessonModel.mjs'

test('external lesson resources accept HTTPS only', () => {
  assert.equal(isHttpsUrl('https://example.com/course.pdf'), true)
  assert.equal(isHttpsUrl('http://example.com/course.pdf'), false)
  assert.equal(isHttpsUrl('javascript:alert(1)'), false)
  assert.equal(isHttpsUrl('not a URL'), false)
})

test('lesson content validation applies format-specific rules', () => {
  assert.equal(isLessonContentValid('text', 'Read the scenario'), true)
  assert.equal(isLessonContentValid('text', '   '), false)
  assert.equal(isLessonContentValid('text', 'x'.repeat(801)), false)
  assert.equal(isLessonContentValid('video', 'https://example.com/video'), true)
  assert.equal(isLessonContentValid('pdf', 'http://example.com/handout.pdf'), false)
})

test('normalization drops invalid lessons, clamps duration and caps the outline', () => {
  const entries = Array.from({ length: MAX_LESSONS_PER_MODULE + 2 }, (_, index) => ({
    id: 'lesson-' + index,
    title: 'Lesson ' + (index + 1),
    format: 'text',
    content: 'Practice activity',
    estimatedMinutes: index === 0 ? 900 : 15,
    position: index,
  }))
  entries.push({ id: 'bad-link', title: 'Unsafe link', format: 'link', content: 'javascript:alert(1)', position: 99 })
  entries.push({ id: 'bad-title', title: 'x', format: 'text', content: 'Reading', position: 100 })

  const normalized = normalizeLessons(entries)
  assert.equal(normalized.length, MAX_LESSONS_PER_MODULE)
  assert.equal(normalized[0].estimatedMinutes, 600)
  assert.deepEqual(normalized.map((lesson) => lesson.position), Array.from({ length: MAX_LESSONS_PER_MODULE }, (_, index) => index))
  assert.equal(normalized.some((lesson) => lesson.id === 'bad-link'), false)
  assert.equal(normalized.some((lesson) => lesson.id === 'bad-title'), false)
})

test('reordering updates positions and safely ignores boundary moves', () => {
  const lessons = [
    { id: 'a', position: 0 },
    { id: 'b', position: 1 },
    { id: 'c', position: 2 },
  ]
  const moved = reorderLessons(lessons, 1, -1)
  assert.deepEqual(moved.map((lesson) => lesson.id), ['b', 'a', 'c'])
  assert.deepEqual(moved.map((lesson) => lesson.position), [0, 1, 2])
  assert.deepEqual(reorderLessons(lessons, 0, -1).map((lesson) => lesson.id), ['a', 'b', 'c'])
})
