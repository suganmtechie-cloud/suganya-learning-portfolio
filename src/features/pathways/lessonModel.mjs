export const MAX_LESSONS_PER_MODULE = 20

const LESSON_FORMATS = new Set(['text', 'video', 'pdf', 'link'])

export function isHttpsUrl(value) {
  if (typeof value !== 'string' || value.trim() === '' || value.trim().length > 2000) return false

  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' && url.hostname.length > 0
  } catch {
    return false
  }
}

export function isLessonContentValid(format, content) {
  if (typeof content !== 'string') return false
  const cleanContent = content.trim()

  if (format === 'text') return cleanContent.length >= 1 && cleanContent.length <= 800
  if (format === 'video' || format === 'pdf' || format === 'link') return isHttpsUrl(cleanContent)
  return false
}

export function normalizeLessons(value) {
  if (!Array.isArray(value)) return []

  return value
    .slice(0, MAX_LESSONS_PER_MODULE * 3)
    .flatMap((item, index) => {
      if (typeof item !== 'object' || item === null || Array.isArray(item)) return []
      if (typeof item.id !== 'string' || typeof item.title !== 'string') return []

      const title = item.title.trim().slice(0, 120)
      const format = item.format
      const content = typeof item.content === 'string'
        ? item.content.slice(0, format === 'text' ? 800 : 2000)
        : ''
      if (title.length < 3 || !LESSON_FORMATS.has(format) || !isLessonContentValid(format, content)) return []

      const estimatedMinutes = Number.isInteger(item.estimatedMinutes)
        ? Math.min(600, Math.max(0, item.estimatedMinutes))
        : 15

      return [{
        id: item.id,
        title,
        format,
        content,
        estimatedMinutes,
        position: Number.isInteger(item.position) ? item.position : index,
      }]
    })
    .sort((left, right) => left.position - right.position)
    .slice(0, MAX_LESSONS_PER_MODULE)
    .map((lesson, position) => ({ ...lesson, position }))
}

export function reorderLessons(lessons, index, direction) {
  const next = [...lessons]
  const target = index + direction
  if (index < 0 || index >= next.length || target < 0 || target >= next.length) {
    return next.map((lesson, position) => ({ ...lesson, position }))
  }

  ;[next[index], next[target]] = [next[target], next[index]]
  return next.map((lesson, position) => ({ ...lesson, position }))
}
