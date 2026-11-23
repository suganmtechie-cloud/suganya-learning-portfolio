import { lazy, Suspense, useEffect, useRef, useState } from 'react'

const ResourceLibrary = lazy(() => import('./ResourceLibrary'))

export default function DeferredResourceLibrary() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [nearViewport, setNearViewport] = useState(false)

  useEffect(() => {
    const target = containerRef.current
    if (!target) return

    if (typeof IntersectionObserver === 'undefined') {
      setNearViewport(true)
      return
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setNearViewport(true)
        observer.disconnect()
      }
    }, { rootMargin: '600px 0px' })

    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef}>
      {nearViewport ? (
        <Suspense fallback={
          <section className="border-y border-white/10 bg-slate-900/35 px-5 py-14 sm:px-8 lg:px-12" aria-busy="true">
            <div className="mx-auto max-w-6xl">
              <p className="text-sm text-slate-300" role="status" aria-live="polite">Loading the resource library…</p>
            </div>
          </section>
        }>
          <ResourceLibrary />
        </Suspense>
      ) : (
        <section className="border-y border-white/10 bg-slate-900/35 px-5 py-14 sm:px-8 lg:px-12" aria-label="Resource library">
          <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-slate-950/40 p-6">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-indigo-300">Reusable L&D assets</p>
            <h2 className="mt-3 text-2xl font-bold text-white">Resource library</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">This section loads as you approach it, keeping the initial workspace lighter.</p>
          </div>
        </section>
      )}
    </div>
  )
}
