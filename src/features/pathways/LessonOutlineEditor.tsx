import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { isLessonContentValid, MAX_LESSONS_PER_MODULE, reorderLessons } from './lessonModel.mjs'
import type { LearningLessonDraft, LearningLessonFormat } from './pathwayTypes'

type LessonOutlineEditorProps = {
  lessons: LearningLessonDraft[]
  onChange: (lessons: LearningLessonDraft[]) => void
}

const fieldClassName = 'mt-1.5 w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-300/20'

function createId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : String(Date.now()) + '-' + Math.random().toString(36).slice(2)
}

export default function LessonOutlineEditor({ lessons, onChange }: LessonOutlineEditorProps) {
  const idPrefix = useId().replaceAll(':', '')
  const [formOpen, setFormOpen] = useState(false)
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [format, setFormat] = useState<LearningLessonFormat>('text')
  const [content, setContent] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState('15')
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState('')

  function resetForm() {
    setFormOpen(false)
    setEditingLessonId(null)
    setTitle('')
    setFormat('text')
    setContent('')
    setEstimatedMinutes('15')
    setFormError('')
  }

  function startAdd() {
    resetForm()
    setFormOpen(true)
    setStatus('')
  }

  function startEdit(lesson: LearningLessonDraft) {
    setEditingLessonId(lesson.id)
    setTitle(lesson.title)
    setFormat(lesson.format)
    setContent(lesson.content)
    setEstimatedMinutes(String(lesson.estimatedMinutes))
    setFormError('')
    setFormOpen(true)
    setStatus('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanTitle = title.trim()
    const cleanContent = content.trim()
    const minutes = Number(estimatedMinutes)

    if (cleanTitle.length < 3 || cleanTitle.length > 120) {
      setFormError('Enter a lesson title between 3 and 120 characters.')
      return
    }
    if (!isLessonContentValid(format, cleanContent)) {
      setFormError(format === 'text'
        ? 'Add lesson content (up to 4,000 characters).'
        : 'Enter a valid HTTPS URL for this resource.')
      return
    }
    if (!Number.isInteger(minutes) || minutes < 0 || minutes > 600) {
      setFormError('Enter a whole-number estimate between 0 and 600 minutes.')
      return
    }

    const existing = lessons.find((lesson) => lesson.id === editingLessonId)
    const nextLesson: LearningLessonDraft = {
      id: editingLessonId ?? createId(),
      title: cleanTitle,
      format,
      content: cleanContent,
      estimatedMinutes: minutes,
      position: existing?.position ?? lessons.length,
    }
    const nextLessons = editingLessonId
      ? lessons.map((lesson) => lesson.id === editingLessonId ? nextLesson : lesson)
      : [...lessons, nextLesson]

    onChange(nextLessons.map((lesson, position) => ({ ...lesson, position })))
    setStatus(editingLessonId ? 'Lesson updated.' : 'Lesson added to the module.')
    resetForm()
  }

  function moveLesson(index: number, direction: -1 | 1) {
    onChange(reorderLessons(lessons, index, direction))
    setStatus('Lesson order updated.')
  }

  function removeLesson(lessonId: string) {
    onChange(lessons.filter((lesson) => lesson.id !== lessonId).map((lesson, position) => ({ ...lesson, position })))
    if (editingLessonId === lessonId) resetForm()
    setStatus('Lesson removed from the module.')
  }

  return (
    <section className="mt-4 border-t border-white/10 pt-3" aria-label="Module lessons">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h6 className="text-xs font-bold uppercase tracking-wider text-indigo-200">Lessons</h6>
          <p className="mt-1 text-xs text-slate-500">{lessons.length} of {MAX_LESSONS_PER_MODULE} lessons</p>
        </div>
        <button
          type="button"
          onClick={startAdd}
          disabled={lessons.length >= MAX_LESSONS_PER_MODULE || formOpen}
          className="min-h-9 rounded-lg border border-indigo-300/40 px-3 py-2 text-xs font-semibold text-indigo-100 hover:bg-indigo-300/10 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-200"
        >
          Add lesson
        </button>
      </div>

      {status && <p className="mt-2 text-xs text-indigo-200" role="status" aria-live="polite">{status}</p>}

      {formOpen && (
        <form onSubmit={handleSubmit} noValidate className="mt-3 rounded-xl border border-indigo-300/20 bg-slate-950/60 p-3">
          <p className="text-xs font-semibold text-white">{editingLessonId ? 'Edit lesson' : 'Add a lesson'}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor={idPrefix + '-title'} className="text-xs font-medium text-slate-200">Lesson title</label>
              <input id={idPrefix + '-title'} value={title} onChange={(event) => setTitle(event.target.value)} className={fieldClassName} placeholder="e.g. Watch the discovery call demonstration" minLength={3} maxLength={120} required />
            </div>
            <div>
              <label htmlFor={idPrefix + '-format'} className="text-xs font-medium text-slate-200">Content type</label>
              <select id={idPrefix + '-format'} value={format} onChange={(event) => setFormat(event.target.value as LearningLessonFormat)} className={fieldClassName}>
                <option value="text">Text / reading</option>
                <option value="video">Video link</option>
                <option value="pdf">PDF / document link</option>
                <option value="link">External resource</option>
              </select>
            </div>
            <div>
              <label htmlFor={idPrefix + '-minutes'} className="text-xs font-medium text-slate-200">Estimated time (minutes)</label>
              <input id={idPrefix + '-minutes'} type="number" min={0} max={600} step={5} value={estimatedMinutes} onChange={(event) => setEstimatedMinutes(event.target.value)} className={fieldClassName} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={idPrefix + '-content'} className="text-xs font-medium text-slate-200">{format === 'text' ? 'Lesson content' : 'Resource URL (HTTPS)'}</label>
              {format === 'text' ? (
                <textarea id={idPrefix + '-content'} value={content} onChange={(event) => setContent(event.target.value)} className={fieldClassName} placeholder="Write key explanations, instructions or reading content…" rows={4} maxLength={4000} required />
              ) : (
                <input id={idPrefix + '-content'} type="url" value={content} onChange={(event) => setContent(event.target.value)} className={fieldClassName} placeholder="https://…" maxLength={2000} required />
              )}
              <p className="mt-1 text-[11px] text-slate-500">External resources must use HTTPS. Add only links learners are authorized to access.</p>
            </div>
          </div>
          {formError && <p className="mt-3 text-xs text-rose-200" role="alert">{formError}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="submit" className="min-h-9 rounded-lg bg-indigo-300 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-indigo-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-200">{editingLessonId ? 'Save lesson' : 'Add lesson'}</button>
            <button type="button" onClick={resetForm} className="min-h-9 rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5">Cancel</button>
          </div>
        </form>
      )}

      {lessons.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-white/10 px-3 py-3 text-center text-xs text-slate-500">No lessons yet. Add the reading, demonstration or practice activity for this module.</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {lessons.map((lesson, index) => (
            <li key={lesson.id} className="rounded-lg border border-white/10 bg-white/[.03] p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-200">Lesson {index + 1} · {lesson.format} · {lesson.estimatedMinutes} min</p>
                  <p className="mt-1 break-words text-xs font-semibold text-white">{lesson.title}</p>
                  {lesson.format === 'text'
                    ? <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-slate-400">{lesson.content}</p>
                    : <a className="mt-1 inline-block break-all text-xs text-teal-200 underline underline-offset-2" href={lesson.content} target="_blank" rel="noopener noreferrer">Open lesson resource in a new tab</a>}
                </div>
                <div className="flex shrink-0 flex-wrap gap-1">
                  <button type="button" onClick={() => moveLesson(index, -1)} disabled={index === 0} aria-label={'Move ' + lesson.title + ' up'} className="rounded-md border border-white/15 px-2 py-1 text-xs text-slate-300 disabled:opacity-30">↑</button>
                  <button type="button" onClick={() => moveLesson(index, 1)} disabled={index === lessons.length - 1} aria-label={'Move ' + lesson.title + ' down'} className="rounded-md border border-white/15 px-2 py-1 text-xs text-slate-300 disabled:opacity-30">↓</button>
                  <button type="button" onClick={() => startEdit(lesson)} aria-label={'Edit ' + lesson.title} className="rounded-md border border-white/15 px-2 py-1 text-xs text-slate-300 hover:text-white">Edit</button>
                  <button type="button" onClick={() => removeLesson(lesson.id)} aria-label={'Remove ' + lesson.title} className="rounded-md border border-white/15 px-2 py-1 text-xs text-rose-200 hover:border-rose-300/40">Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
