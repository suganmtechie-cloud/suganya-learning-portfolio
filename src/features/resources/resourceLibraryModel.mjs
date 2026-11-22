export const RESOURCE_STORAGE_KEY = 'suganya-learning-resources-v1'

export const RESOURCE_CATEGORIES = [
  'Design',
  'Assessment',
  'Feedback',
  'Facilitation',
  'Templates',
  'External',
]

export const RESOURCE_FORMATS = [
  'Guide',
  'Checklist',
  'Session plan',
  'Template',
  'External link',
]

const categorySet = new Set(RESOURCE_CATEGORIES)
const formatSet = new Set(RESOURCE_FORMATS)

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isSafeResourceUrl(value) {
  if (typeof value !== 'string' || value.trim() === '' || value.trim().length > 2048) return false

  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' &&
      url.hostname.length > 0 &&
      url.username.length === 0 &&
      url.password.length === 0
  } catch {
    return false
  }
}

export function normalizeResources(value) {
  if (!Array.isArray(value)) return []

  const seenUrls = new Set()

  return value
    .slice(0, 200)
    .flatMap((item) => {
      if (!isRecord(item)) return []

      const id = typeof item.id === 'string' ? item.id.trim() : ''
      const title = typeof item.title === 'string' ? item.title.trim() : ''
      const description = typeof item.description === 'string' ? item.description.trim() : ''
      const category = item.category
      const format = item.format
      const rawUrl = typeof item.url === 'string' ? item.url.trim() : ''

      if (
        id.length < 1 ||
        id.length > 100 ||
        title.length < 3 ||
        title.length > 80 ||
        description.length < 8 ||
        description.length > 180 ||
        !categorySet.has(category) ||
        !formatSet.has(format) ||
        !isSafeResourceUrl(rawUrl)
      ) return []

      const url = new URL(rawUrl).href
      if (seenUrls.has(url)) return []
      seenUrls.add(url)

      return [{
        id,
        title,
        description,
        category,
        format,
        url,
        createdAt: typeof item.createdAt === 'string' ? item.createdAt : '',
      }]
    })
    .slice(0, 100)
}

export function filterResources(resources, search, category) {
  const query = typeof search === 'string' ? search.trim().toLowerCase() : ''

  return resources.filter((resource) => {
    const matchesCategory = !category || category === 'All' || resource.category === category
    const searchableText = [
      resource.title,
      resource.description,
      resource.category,
      resource.format,
    ].join(' ').toLowerCase()

    return matchesCategory && (!query || searchableText.includes(query))
  })
}
