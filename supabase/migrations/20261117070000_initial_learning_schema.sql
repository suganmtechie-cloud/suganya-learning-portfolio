-- Initial Learning Studio schema.
-- Apply with Supabase CLI: supabase db push

create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  learning_path_id uuid not null references public.learning_paths(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text not null default '',
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  unique (learning_path_id, position)
);

create table if not exists public.learner_progress (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.learning_modules(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  reflection text not null default '',
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (learner_id, module_id)
);

create index if not exists learning_paths_owner_id_idx on public.learning_paths(owner_id);
create index if not exists learning_modules_path_position_idx on public.learning_modules(learning_path_id, position);
create index if not exists learner_progress_learner_id_idx on public.learner_progress(learner_id);

alter table public.learning_paths enable row level security;
alter table public.learning_modules enable row level security;
alter table public.learner_progress enable row level security;

create policy "Owners manage their learning paths"
on public.learning_paths for all to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "Authenticated users read published learning paths"
on public.learning_paths for select to authenticated
using (status = 'published');

create policy "Owners manage modules in their paths"
on public.learning_modules for all to authenticated
using (exists (
  select 1 from public.learning_paths p
  where p.id = learning_path_id and p.owner_id = (select auth.uid())
))
with check (exists (
  select 1 from public.learning_paths p
  where p.id = learning_path_id and p.owner_id = (select auth.uid())
));

create policy "Learners read modules in published paths"
on public.learning_modules for select to authenticated
using (exists (
  select 1 from public.learning_paths p
  where p.id = learning_path_id and p.status = 'published'
));

create policy "Learners manage only their own progress"
on public.learner_progress for all to authenticated
using (learner_id = (select auth.uid()))
with check (learner_id = (select auth.uid()));
