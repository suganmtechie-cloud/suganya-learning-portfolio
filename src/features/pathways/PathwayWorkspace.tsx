import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import ModuleOutlineEditor from './ModuleOutlineEditor'
import type { LearningLevel, LearningModuleDraft, LearningPathDraft } from './pathwayTypes'

const STORAGE_KEY = 'suganya-learning-pathway-drafts-v1'
const fieldClassName = 'mt-2 w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeModule(value: unknown, index: number): LearningModuleDraft | null {
  if (!isRecord(value)) return null
  if (typeof value.id !== 'string' || typeof value.title !== 'string') return null
  if (value.title.trim().length < 3 || value.title.length > 120) return null

  return {
    id: value.id,
    title: value.title,
    learningObjective: typeof value.learningObjective === 'string' ? value.learningObjective.slice(0, 300) : '',
    description: typeof value.description === 'string' ? value.description.slice(0, 500) : '',
    estimatedMinutes: typeof value.estimatedMinutes === 'number' && Number.isInteger(value.estimatedMinutes)
      ? Math.min(600, Math.max(0, value.estimatedMinutes))
      : 30,
    position: typeof value.position === 'number' && Number.isInteger(value.position) ? value.position : index,
  }
}

function normalizeDraft(value: unknown): LearningPathDraft | null {
  if (!isRecord(value)) return null

  const level = value.level
  if (level !== 'Beginner' && level !== 'Intermediate' && level !== 'Advanced') return null
  if (
    typeof value.id !== 'string' ||
    typeof value.title !== 'string' ||
    value.title.trim().length < 3 ||
    typeof value.audience !== 'string' ||
    typeof value.outcome !== 'string' ||
    typeof value.durationHours !== 'number' ||
    !Number.isInteger(value.durationHours) ||
    value.durationHours < 1 ||
    value.durationHours > 40 ||
    typeof value.createdAt !== 'string'
  ) return null

  const modules = Array.isArray(value.modules)
    ? value.modules
      .map(normalizeModule)
      .filter((module): module is LearningModuleDraft => module !== null)
      .sort((left, right) => left.position - right.position)
      .map((module, position) => ({ ...module, position }))
    : []

  return {
    id: value.id,
    title: value.title,
    audience: value.audience,
    outcome: value.outcome,
    level: level as LearningLevel,
    durationHours: value.durationHours,
    createdAt: value.createdAt,
    modules,
  }
}

function readSavedDrafts(): LearningPathDraft[] {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return []

    const parsed: unknown = JSON.parse(saved)
    return Array.isArray(parsed)
      ? parsed.map(normalizeDraft).filter((draft): draft is LearningPathDraft => draft !== null)
      : []
  } catch {
    return []
  }
}

function createId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : String(Date.now()) + '-' + Math.random().toString(36).slice(2)
}

export default function PathwayWorkspace() {
  const [drafts, setDrafts] = useState<LearningPathDraft[]>(readSavedDrafts)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [storageAvailable, setStorageAvailable] = useState(true)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
      setStorageAvailable(true)
    } catch {
      setStorageAvailable(false)
    }
  }, [drafts])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const values = new FormData(form)
    const title = String(values.get('title') ?? '').trim()
    const audience = String(values.get('audience') ?? '').trim()
    const outcome = String(values.get('outcome') ?? '').trim()
    const durationHours = Number(values.get('durationHours'))
    const levelValue = String(values.get('level') ?? 'Beginner')
    const level: LearningLevel =
      levelValue === 'Advanced' || levelValue === 'Intermediate' ? levelValue : 'Beginner'

    if (title.length < 3) {
      setFormError('Enter a programme name with at least 3 characters.')
      return
    }
    if (!audience || !outcome) {
      setFormError('Add both a target audience and a practical learning outcome.')
      return
    }
    if (!Number.isInteger(durationHours) || durationHours < 1 || durationHours > 40) {
      setFormError('Choose a whole-number duration between 1 and 40 hours.')
      return
    }

    const draft: LearningPathDraft = {
      id: createId(),
      title,
      audience,
      outcome,
      level,
      durationHours,
      createdAt: new Date().toISOString(),
      modules: [],
    }

    setDrafts((current) => [draft, ...current])
    setFormError('')
    setNotice('Your learning pathway draft has been saved in this browser.')
    form.reset()
  }

  function removeDraft(id: string) {
    setDrafts((current) => current.filter((draft) => draft.id !== id))
    setNotice('The learning pathway draft was removed.')
  }

  function updateModules(draftId: string, modules: LearningModuleDraft[]) {
    setDrafts((current) => current.map((draft) => draft.id === draftId ? { ...draft, modules } : draft))
    setNotice('The module outline was saved in this browser.')
  }

  return (
    <section aria-labelledby="pathway-workspace-heading" className="border-y border-white/10 bg-slate-950/25 py-14 sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-teal-300">First interactive tool</p>
          <h2 id="pathway-workspace-heading" className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Build a learning pathway</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
            Turn a workplace capability need into a structured programme brief. Start with the audience and the practical outcome, then save a draft to refine later.
          </p>

          <div className="mt-6 rounded-2xl border border-teal-300/20 bg-teal-300/5 p-4">
            <p className="text-sm font-semibold text-teal-100">A useful design prompt</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              What should learners be able to do differently at work after this programme—not just what should they know?
            </p>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Drafts are stored in this browser only; they are not synced to Supabase yet. Avoid entering personal, confidential or identifiable learner information.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[.05] p-5 shadow-xl shadow-black/10 sm:p-6">
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="pathway-title" className="text-sm font-medium text-slate-200">Programme name</label>
                <input id="pathway-title" name="title" className={fieldClassName} placeholder="e.g. AI foundations for business users" minLength={3} maxLength={80} required />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="pathway-audience" className="text-sm font-medium text-slate-200">Target audience</label>
                <input id="pathway-audience" name="audience" className={fieldClassName} placeholder="e.g. New customer success managers" maxLength={100} required />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="pathway-outcome" className="text-sm font-medium text-slate-200">Practical learning outcome</label>
                <textarea id="pathway-outcome" name="outcome" className={fieldClassName} placeholder="After this programme, learners will be able to..." rows={3} maxLength={240} required />
              </div>

              <div>
                <label htmlFor="pathway-level" className="text-sm font-medium text-slate-200">Starting level</label>
                <select id="pathway-level" name="level" className={fieldClassName} defaultValue="Beginner">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <div>
                <label htmlFor="pathway-duration" className="text-sm font-medium text-slate-200">Duration (hours)</label>
                <input id="pathway-duration" name="durationHours" type="number" min={1} max={40} step={1} defaultValue={4} className={fieldClassName} required />
              </div>
            </div>

            {formError && <p className="mt-4 rounded-lg border border-rose-300/30 bg-rose-300/10 px-3 py-2 text-sm text-rose-100" role="alert">{formError}</p>}
            <button type="submit" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-300 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-200">
              Save pathway draft
            </button>
          </form>
        </div>

        <div className="lg:col-span-2" aria-labelledby="saved-pathways-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-rose-300">Your workspace</p>
              <h3 id="saved-pathways-heading" className="mt-2 text-2xl font-bold text-white">Saved pathway drafts</h3>
            </div>
            <span className="text-sm text-slate-400">{drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'}</span>
          </div>

          {!storageAvailable && (
            <p className="mt-4 rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100" role="status">
              Browser storage is unavailable. Drafts will remain visible only until this page is refreshed.
            </p>
          )}
          {notice && <p className="mt-3 text-sm text-teal-200" role="status" aria-live="polite">{notice}</p>}

          {drafts.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-white/15 px-5 py-8 text-center">
              <p className="font-semibold text-slate-200">No pathway drafts yet</p>
              <p className="mt-2 text-sm text-slate-400">Use the form above to create your first programme brief.</p>
            </div>
          ) : (
            <ul className="mt-4 grid list-none gap-3 p-0 md:grid-cols-2">
              {drafts.map((draft) => (
                <li key={draft.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">{draft.level} · {draft.durationHours} hours</p>
                      <h4 className="mt-2 text-lg font-bold text-white">{draft.title}</h4>
                    </div>
                    <button type="button" onClick={() => removeDraft(draft.id)} aria-label={'Delete ' + draft.title + ' draft'} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-rose-300/50 hover:text-rose-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300">
                      Remove pathway
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-slate-300"><span className="font-semibold text-slate-100">Audience:</span> {draft.audience}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{draft.outcome}</p>
                  <p className="mt-3 text-xs text-slate-500">Created {new Date(draft.createdAt).toLocaleDateString()}</p>
                  <ModuleOutlineEditor
                    modules={draft.modules}
                    durationHours={draft.durationHours}
                    onChange={(modules) => updateModules(draft.id, modules)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
