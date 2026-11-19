-- Add structured outcomes and time estimates to course modules.
-- Existing learning_modules RLS policies remain in force for these columns.
-- Apply only after reviewing the migration against the connected Supabase project.

alter table public.learning_modules
  add column if not exists learning_objective text not null default '';

alter table public.learning_modules
  add column if not exists estimated_minutes integer not null default 30;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'learning_modules_estimated_minutes_range'
      and conrelid = 'public.learning_modules'::regclass
  ) then
    alter table public.learning_modules
      add constraint learning_modules_estimated_minutes_range
      check (estimated_minutes between 0 and 600);
  end if;
end
$$;
