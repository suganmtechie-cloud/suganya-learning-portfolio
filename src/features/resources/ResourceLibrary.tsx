import { useEffect, useId, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  filterResources,
  isSafeResourceUrl,
  normalizeResources,
  RESOURCE_CATEGORIES,
  RESOURCE_FORMATS,
  RESOURCE_STORAGE_KEY,
} from './resourceLibraryModel.mjs'
import type { ResourceDraft } from './resourceLibraryModel.mjs'

const builtInResources: ResourceDraft[] = [
  {
    id: 'builtin-learning-design',
    title: 'Learning design approach',
    description: 'A practical loop for discovering needs, defining outcomes, designing practice, delivering and improving learning.',
    category: 'Design',
    format: 'Guide',
    url: 'https://github.com/suganmtechie-cloud/suganya-learning-portfolio/blob/main/learning-design.md',
    createdAt: '',
  },
  {
    id: 'builtin-assessment-rubric',
    title: 'Assessment and rubric',
    description: 'A blueprint for diagnostic, formative, practical and workplace-transfer evidence, with a four-level sample rubric.',
    category: 'Assessment',
    format: 'Checklist',
    url: 'https://github.com/suganmtechie-cloud/suganya-learning-portfolio/blob/main/assessment-and-rubric.md',
    createdAt: '',
  },
  {
    id: 'builtin-feedback-system',
    title: 'Feedback system',
    description: 'Daily learner pulse questions, trainer observation prompts and a close-the-loop improvement format.',
    category: 'Feedback',
    format: 'Guide',
    url: 'https://github.com/suganmtechie-cloud/suganya-learning-portfolio/blob/main/feedback-system.md',
    createdAt: '',
  },
  {
    id: 'builtin-sample-session',
    title: 'Sample 90-minute session',
    description: 'An example REST API session that connects demonstrations, guided practice, pair work and observable evidence.',
    category: 'Facilitation',
    format: 'Session plan',
    url: 'https://github.com/suganmtechie-cloud/suganya-learning-portfolio/blob/main/sample-session.md',
    createdAt: '',
  },
  {
    id: 'builtin-course-template',
    title: 'Course and module template',
    description: 'A reusable Markdown structure for learner context, outcomes, learning sequence, materials, assessment and version history.',
    category: 'Templates',
    format: 'Template',
    url: 'https://github.com/suganmtechie-cloud/suganya-learning-portfolio/blob/main/templates/course-template.md',
    createdAt: '',
  },
]

const fieldClassName = 'mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20'

function readCustomResources(): ResourceDraft[] {
  if (typeof window === 'undefined') return []

  try {
    const saved = window.localStorage.getItem(RESOURCE_STORAGE_KEY)
    return saved ? normalizeResources(JSON.parse(saved)) : []
  } catch {
    return []
  }
}

function createId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : String(Date.now()) + '-' + Math.random().toString(36).slice(2)
}

export default function ResourceLibrary() {
  const idPrefix = useId().replaceAll(':', '')
  const [customResources, setCustomResources] = useState<ResourceDraft[]>(readCustomResources)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [formOpen, setFormOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('External')
  const [format, setFormat] = useState('External link')
  const [url, setUrl] = useState('')
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState('')
  const [storageAvailable, setStorageAvailable] = useState(true)

  useEffect(() => {
    try {
      window.localStorage.setItem(RESOURCE_STORAGE_KEY, JSON.stringify(customResources))
      setStorageAvailable(true)
    } catch {
      setStorageAvailable(false)
    }
  }, [customResources])

  const allResources = useMemo(
    () => [...builtInResources, ...customResources],
    [customResources],
  )
  const visibleResources = useMemo(
    () => filterResources(allResources, search, activeCategory),
    [allResources, search, activeCategory],
  )

  function resetForm() {
    setFormOpen(false)
    setTitle('')
    setDescription('')
    setCategory('External')
    setFormat('External link')
    setUrl('')
    setFormError('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanTitle = title.trim()
    const cleanDescription = description.trim()
    const cleanUrl = url.trim()

    if (cleanTitle.length < 3 || cleanTitle.length > 80) {
      setFormError('Enter a resource title between 3 and 80 characters.')
      return
    }
    if (cleanDescription.length < 8 || cleanDescription.length > 180) {
      setFormError('Add a short description between 8 and 180 characters.')
      return
    }
    if (!isSafeResourceUrl(cleanUrl)) {
      setFormError('Use a valid HTTPS link. HTTP and other URL schemes are not accepted.')
      return
    }

    const normalizedUrl = new URL(cleanUrl).href
    if (allResources.some((resource) => resource.url === normalizedUrl)) {
      setFormError('This link is already in the resource library.')
      return
    }

    const resource: ResourceDraft = {
      id: createId(),
      title: cleanTitle,
      description: cleanDescription,
      category,
      format,
      url: normalizedUrl,
      createdAt: new Date().toISOString(),
    }

    setCustomResources((current) => [resource, ...current])
    setStatus('Resource added to this browser’s library.')
    resetForm()
  }

  function removeResource(resourceId: string) {
    setCustomResources((current) => current.filter((resource) => resource.id !== resourceId))
    setStatus('Custom resource removed from this browser’s library.')
  }

  return (
    <section aria-labelledby="resource-library-heading" className="border-y border-white/10 bg-slate-900/35 py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-indigo-300">Reusable L&D assets</p>
            <h2 id="resource-library-heading" className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Resource library</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Keep design guides, assessment tools, feedback prompts and facilitator resources easy to find.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setFormOpen((open) => !open); setFormError('') }}
            aria-expanded={formOpen}
            aria-controls={idPrefix + '-resource-form'}
            className="min-h-11 rounded-xl bg-indigo-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-indigo-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-200"
          >
            {formOpen ? 'Close form' : 'Add a resource'}
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_220px]">
          <div>
            <label htmlFor={idPrefix + '-search'} className="text-xs font-medium text-slate-200">Search resources</label>
            <input
              id={idPrefix + '-search'}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className={fieldClassName}
              placeholder="Search by title, topic or format"
            />
          </div>
          <div>
            <label htmlFor={idPrefix + '-filter'} className="text-xs font-medium text-slate-200">Filter by category</label>
            <select
              id={idPrefix + '-filter'}
              value={activeCategory}
              onChange={(event) => setActiveCategory(event.target.value)}
              className={fieldClassName}
            >
              <option value="All">All categories</option>
              {RESOURCE_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>

        {formOpen && (
          <form
            id={idPrefix + '-resource-form'}
            onSubmit={handleSubmit}
            noValidate
            className="mt-5 rounded-2xl border border-indigo-300/20 bg-slate-950/70 p-5"
          >
            <h3 className="text-base font-bold text-white">Add an external resource</h3>
            <p className="mt-1 text-xs leading-5 text-slate-400">Add a reference link. File uploads and cross-device synchronization are not enabled yet.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor={idPrefix + '-title'} className="text-xs font-medium text-slate-200">Resource title</label>
                <input id={idPrefix + '-title'} value={title} onChange={(event) => setTitle(event.target.value)} className={fieldClassName} minLength={3} maxLength={80} required />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={idPrefix + '-description'} className="text-xs font-medium text-slate-200">Short description</label>
                <textarea id={idPrefix + '-description'} value={description} onChange={(event) => setDescription(event.target.value)} className={fieldClassName} rows={2} minLength={8} maxLength={180} required />
              </div>
              <div>
                <label htmlFor={idPrefix + '-category'} className="text-xs font-medium text-slate-200">Category</label>
                <select id={idPrefix + '-category'} value={category} onChange={(event) => setCategory(event.target.value)} className={fieldClassName}>
                  {RESOURCE_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor={idPrefix + '-format'} className="text-xs font-medium text-slate-200">Resource format</label>
                <select id={idPrefix + '-format'} value={format} onChange={(event) => setFormat(event.target.value)} className={fieldClassName}>
                  {RESOURCE_FORMATS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={idPrefix + '-url'} className="text-xs font-medium text-slate-200">HTTPS resource link</label>
                <input id={idPrefix + '-url'} type="url" value={url} onChange={(event) => setUrl(event.target.value)} className={fieldClassName} placeholder="https://example.com/learning-resource" required />
              </div>
            </div>
            {formError && <p className="mt-3 text-sm text-rose-200" role="alert">{formError}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="submit" className="min-h-10 rounded-lg bg-teal-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-teal-200">Save resource</button>
              <button type="button" onClick={resetForm} className="min-h-10 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5">Cancel</button>
            </div>
          </form>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-400" aria-live="polite">{visibleResources.length} of {allResources.length} resources</p>
          {status && <p className="text-xs text-teal-200" role="status" aria-live="polite">{status}</p>}
        </div>

        {!storageAvailable && (
          <p className="mt-3 rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100" role="status">
            Browser storage is unavailable. Custom links will not remain after this page is refreshed.
          </p>
        )}

        {visibleResources.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-white/15 px-5 py-8 text-center">
            <p className="font-semibold text-slate-200">No matching resources</p>
            <p className="mt-2 text-sm text-slate-400">Try another search term or choose a different category.</p>
          </div>
        ) : (
          <ul className="mt-4 grid list-none gap-4 p-0 md:grid-cols-2 xl:grid-cols-3">
            {visibleResources.map((resource) => {
              const isBuiltIn = resource.id.startsWith('builtin-')
              return (
                <li key={resource.id}>
                  <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-teal-300/25 bg-teal-300/10 px-2.5 py-1 text-[11px] font-semibold text-teal-100">{resource.category}</span>
                      <span className="text-[11px] text-slate-500">{resource.format}</span>
                      {isBuiltIn && <span className="text-[11px] text-indigo-200">Portfolio resource</span>}
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-white">{resource.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{resource.description}</p>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-9 items-center rounded-lg bg-indigo-300 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-indigo-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-200"
                      >
                        Open resource
                      </a>
                      {!isBuiltIn && (
                        <button
                          type="button"
                          onClick={() => removeResource(resource.id)}
                          aria-label={'Remove ' + resource.title}
                          className="min-h-9 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-rose-300/50 hover:text-rose-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        )}

        <p className="mt-5 text-xs leading-5 text-slate-500">
          The five portfolio resources are built in. Custom links are stored in this browser only; they are not uploaded, shared or synchronized to a cloud account.
        </p>
      </div>
    </section>
  )
}
