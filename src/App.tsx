import { isSupabaseConfigured } from './lib/supabase'

const learningAreas = [
  { number: '01', title: 'Learning pathways', detail: 'Design role-based journeys with outcomes, modules and milestones.', tag: 'Curriculum design' },
  { number: '02', title: 'Learning resources', detail: 'Organize facilitator guides, practice activities and reference material.', tag: 'Content library' },
  { number: '03', title: 'Progress & reflection', detail: 'Track learning activity and capture evidence of skill development.', tag: 'Learner growth' },
]

export default function App() {
  return (
    <main className="min-h-screen px-5 py-8 text-slate-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <a className="text-sm font-bold tracking-[.18em] text-white" href="../">SUGANYA<span className="text-teal-300">.</span>PORTFOLIO</a>
          <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-300">Learning Studio · Preview</span>
        </header>

        <section className="grid gap-10 py-16 md:grid-cols-[1.3fr_.7fr] md:items-end md:py-24">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-teal-300">Learning & Development workspace</p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">Turn learning goals into <span className="text-indigo-300">measurable capability.</span></h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">A growing workspace for designing learning journeys, organizing resources and making progress visible—from the first learning objective to real-world application.</p>
          </div>
          <aside className="rounded-2xl border border-white/10 bg-white/[.06] p-6 shadow-2xl shadow-black/20">
            <p className="text-sm font-semibold text-slate-200">Platform connection</p>
            <div className="mt-4 flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-300'}`} aria-hidden="true" />
              <span className="font-medium">{isSupabaseConfigured ? 'Supabase credentials detected' : 'Supabase setup required'}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">{isSupabaseConfigured ? 'The client configuration is present. Database access will be enabled as the schema and authenticated workflows are added.' : 'Add your project URL and publishable key to .env.local. No credentials are stored in this repository.'}</p>
            <p className="mt-4 text-xs text-slate-500">Connection status checks local configuration only; it does not yet verify a live database request.</p>
          </aside>
        </section>

        <section aria-labelledby="areas-heading" className="pb-16">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-rose-300">Product roadmap</p><h2 id="areas-heading" className="mt-2 text-2xl font-bold sm:text-3xl">Your learning workspace</h2></div>
            <p className="max-w-md text-sm leading-6 text-slate-400">The first foundation is in place. These core areas will become interactive features over the next development increments.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {learningAreas.map((area) => (
              <article key={area.number} className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-950/80 to-slate-900 p-6">
                <p className="text-sm font-semibold text-teal-300">{area.number} / {area.tag}</p>
                <h3 className="mt-5 text-xl font-bold">{area.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{area.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/10 py-6 text-sm text-slate-500">Built incrementally with React, TypeScript, Tailwind CSS, Vite and Supabase.</footer>
      </div>
    </main>
  )
}
