import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import type { LearningModuleDraft } from './pathwayTypes'
import LessonOutlineEditor from './LessonOutlineEditor'

type ModuleOutlineEditorProps = {
  modules: LearningModuleDraft[]
  durationHours: number
  onChange: (modules: LearningModuleDraft[]) => void
}

const MAX_MODULES = 12
const fieldClassName = 'mt-1.5 w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20'

function createId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : String(Date.now()) + '-' + Math.random().toString(36).slice(2)
}

export default function ModuleOutlineEditor({
  modules,
  durationHours,
  onChange,
}: ModuleOutlineEditorProps) {
  const idPrefix = useId().replaceAll(':', '')
  const [formOpen, setFormOpen] = useState(false)
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [learningObjective, setLearningObjective] = useState('')
  const [description, setDescription] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState('30')
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState('')

  const allocatedMinutes = modules.reduce((total, module) => total + module.estimatedMinutes, 0)
  const budgetMinutes = durationHours * 60
  const remainingMinutes = budgetMinutes - allocatedMinutes

  function resetForm() {
    setFormOpen(false)
    setEditingModuleId(null)
    setTitle('')
    setLearningObjective('')
    setDescription('')
    setEstimatedMinutes('30')
    setFormError('')
  }

  function startAdd() {
    setEditingModuleId(null)
    setTitle('')
    setLearningObjective('')
    setDescription('')
    setEstimatedMinutes('30')
    setFormError('')
    setFormOpen(true)
    setStatus('')
  }

  function startEdit(module: LearningModuleDraft) {
    setEditingModuleId(module.id)
    setTitle(module.title)
    setLearningObjective(module.learningObjective)
    setDescription(module.description)
    setEstimatedMinutes(String(module.estimatedMinutes))
    setFormError('')
    setFormOpen(true)
    setStatus('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanTitle = title.trim()
    const cleanObjective = learningObjective.trim()
    const cleanDescription = description.trim()
    const minutes = Number(estimatedMinutes)

    if (cleanTitle.length < 3) {
      setFormError('Enter a module title with at least 3 characters.')
      return
    }
    if (cleanObjective.length < 8) {
      setFormError('Describe what learners should be able to do in this module.')
      return
    }
    if (!Number.isInteger(minutes) || minutes < 0 || minutes > 600) {
      setFormError('Enter a whole-number estimate between 0 and 600 minutes.')
      return
    }

    const updatedModule: LearningModuleDraft = {
      id: editingModuleId ?? createId(),
      title: cleanTitle,
      learningObjective: cleanObjective,
      description: cleanDescription,
      estimatedMinutes: minutes,
      position: editingModuleId
        ? modules.find((module) => module.id === editingModuleId)?.position ?? modules.length
        : modules.length,
      lessons: editingModuleId
        ? modules.find((module) => module.id === editingModuleId)?.lessons ?? []
        : [],
    }

    const nextModules = editingModuleId
      ? modules.map((module) => module.id === editingModuleId ? updatedModule : module)
      : [...modules, updatedModule]

    onChange(nextModules.map((module, position) => ({ ...module, position })))
    setStatus(editingModuleId ? 'Module updated.' : 'Module added to the outline.')
    resetForm()
  }

  function moveModule(moduleId: string, direction: -1 | 1) {
    const currentIndex = modules.findIndex((module) => module.id === moduleId)
    const nextIndex = currentIndex + direction
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= modules.length) return

    const nextModules = [...modules]
    ;[nextModules[currentIndex], nextModules[nextIndex]] = [nextModules[nextIndex], nextModules[currentIndex]]
    onChange(nextModules.map((module, position) => ({ ...module, position })))
    setStatus('Module order updated.')
  }

  function removeModule(moduleId: string) {
    const nextModules = modules
      .filter((module) => module.id !== moduleId)
      .map((module, position) => ({ ...module, position }))
    onChange(nextModules)
    if (editingModuleId === moduleId) resetForm()
    setStatus('Module removed from the outline.')
  }

  return (
    <section className="mt-5 border-t border-white/10 pt-4" aria-label="Module outline">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h5 className="text-sm font-bold text-white">Course modules</h5>
          <p className="mt-1 text-xs text-slate-400">
            {modules.length} of {MAX_MODULES} modules · {allocatedMinutes} of {budgetMinutes} minutes allocated
          </p>
        </div>
        <button
          type="button"
          onClick={startAdd}
          disabled={modules.length >= MAX_MODULES || formOpen}
          className="min-h-9 rounded-lg border border-teal-300/40 px-3 py-2 text-xs font-semibold text-teal-100 hover:bg-teal-300/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add module
        </button>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Module time allocation" aria-valuemin={0} aria-valuemax={budgetMinutes} aria-valuenow={Math.min(allocatedMinutes, budgetMinutes)}>
        <div
          className={`h-full rounded-full transition-all ${allocatedMinutes > budgetMinutes ? 'bg-rose-300' : 'bg-teal-300'}`}
          style={{ width: budgetMinutes > 0 ? Math.min(100, allocatedMinutes / budgetMinutes * 100) + '%' : '0%' }}
        />
      </div>
      <p className={`mt-1 text-xs ${remainingMinutes < 0 ? 'text-rose-200' : 'text-slate-400'}`}>
        {remainingMinutes < 0
          ? Math.abs(remainingMinutes) + ' minutes over the programme budget'
          : remainingMinutes + ' minutes available for additional modules'}
      </p>

      {status && <p className="mt-2 text-xs text-teal-200" role="status" aria-live="polite">{status}</p>}

      {formOpen && (
        <form onSubmit={handleSubmit} noValidate className="mt-4 rounded-xl border border-teal-300/20 bg-slate-950/60 p-4">
          <h6 className="text-sm font-semibold text-white">{editingModuleId ? 'Edit module' : 'Add a course module'}</h6>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor={idPrefix + '-title'} className="text-xs font-medium text-slate-200">Module title</label>
              <input id={idPrefix + '-title'} value={title} onChange={(event) => setTitle(event.target.value)} className={fieldClassName} placeholder="e.g. Prepare a customer discovery session" minLength={3} maxLength={120} required />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={idPrefix + '-objective'} className="text-xs font-medium text-slate-200">Module learning objective</label>
              <textarea id={idPrefix + '-objective'} value={learningObjective} onChange={(event) => setLearningObjective(event.target.value)} className={fieldClassName} placeholder="By the end of this module, learners can..." rows={2} minLength={8} maxLength={300} required />
            </div>
            <div>
              <label htmlFor={idPrefix + '-minutes'} className="text-xs font-medium text-slate-200">Estimated time (minutes)</label>
              <input id={idPrefix + '-minutes'} type="number" min={0} max={600} step={5} value={estimatedMinutes} onChange={(event) => setEstimatedMinutes(event.target.value)} className={fieldClassName} />
            </div>
            <div>
              <label htmlFor={idPrefix + '-description'} className="text-xs font-medium text-slate-200">Activities or notes (optional)</label>
              <input id={idPrefix + '-description'} value={description} onChange={(event) => setDescription(event.target.value)} className={fieldClassName} placeholder="Practice, demo, reflection..." maxLength={500} />
            </div>
          </div>
          {formError && <p className="mt-3 text-xs text-rose-200" role="alert">{formError}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="submit" className="min-h-9 rounded-lg bg-teal-300 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-teal-200">{editingModuleId ? 'Save changes' : 'Add to outline'}</button>
            <button type="button" onClick={resetForm} className="min-h-9 rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5">Cancel</button>
          </div>
        </form>
      )}

      {modules.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-white/15 px-3 py-4 text-center text-xs text-slate-400">
          No modules yet. Add the first module and describe the capability learners will practise.
        </p>
      ) : (
        <ol className="mt-3 space-y-2">
          {modules.map((module, index) => (
            <li key={module.id} className="rounded-xl border border-white/10 bg-slate-950/45 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-300">Module {index + 1} · {module.estimatedMinutes} min</p>
                  <h6 className="mt-1 break-words text-sm font-semibold text-white">{module.title}</h6>
                  <p className="mt-1 text-xs leading-5 text-slate-300">{module.learningObjective}</p>
                  {module.description && <p className="mt-1 text-xs leading-5 text-slate-500">{module.description}</p>}
                </div>
                <div className="flex shrink-0 flex-wrap gap-1">
                  <button type="button" onClick={() => moveModule(module.id, -1)} disabled={index === 0} aria-label={'Move ' + module.title + ' up'} className="rounded-md border border-white/15 px-2 py-1 text-xs text-slate-300 disabled:opacity-30">↑</button>
                  <button type="button" onClick={() => moveModule(module.id, 1)} disabled={index === modules.length - 1} aria-label={'Move ' + module.title + ' down'} className="rounded-md border border-white/15 px-2 py-1 text-xs text-slate-300 disabled:opacity-30">↓</button>
                  <button type="button" onClick={() => startEdit(module)} aria-label={'Edit ' + module.title} className="rounded-md border border-white/15 px-2 py-1 text-xs text-slate-300 hover:text-white">Edit</button>
                  <button type="button" onClick={() => removeModule(module.id)} aria-label={'Remove ' + module.title} className="rounded-md border border-white/15 px-2 py-1 text-xs text-rose-200 hover:border-rose-300/40">Remove</button>
                </div>
              </div>
              <LessonOutlineEditor
                lessons={module.lessons ?? []}
                onChange={(lessons) => onChange(modules.map((item) => item.id === module.id ? { ...item, lessons } : item))}
              />
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
