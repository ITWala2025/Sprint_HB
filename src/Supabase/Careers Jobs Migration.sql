-- Run after the SPRINT RBAC migration so current_user_has_permission is available.

create table if not exists public.sprint_careers_jobs (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    type text not null default 'full-time'
        check (type in ('internship', 'full-time', 'part-time', 'contract')),
    location text not null,
    description text not null,
    responsibilities jsonb not null default '[]'::jsonb
        check (jsonb_typeof(responsibilities) = 'array'),
    requirements jsonb not null default '[]'::jsonb
        check (jsonb_typeof(requirements) = 'array'),
    duration text,
    stipend text,
    status text not null default 'draft'
        check (status in ('draft', 'published', 'closed')),
    posted_date date not null default current_date,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists sprint_careers_jobs_status_posted_date_idx
    on public.sprint_careers_jobs (status, posted_date desc);

alter table public.sprint_careers_jobs enable row level security;

grant select on public.sprint_careers_jobs to anon, authenticated;
grant insert, update, delete on public.sprint_careers_jobs to authenticated;

drop policy if exists "Public can view published career jobs"
    on public.sprint_careers_jobs;
create policy "Public can view published career jobs"
    on public.sprint_careers_jobs
    for select
    to anon, authenticated
    using (status = 'published');

drop policy if exists "Career managers can view all jobs"
    on public.sprint_careers_jobs;
create policy "Career managers can view all jobs"
    on public.sprint_careers_jobs
    for select
    to authenticated
    using (
        public.current_user_has_permission('careers', 'view')
        or public.current_user_has_permission('cms_careers', 'view')
        or public.current_user_has_permission('admin', 'view')
    );

drop policy if exists "Career managers can create jobs"
    on public.sprint_careers_jobs;
create policy "Career managers can create jobs"
    on public.sprint_careers_jobs
    for insert
    to authenticated
    with check (
        public.current_user_has_permission('careers', 'create')
        or public.current_user_has_permission('cms_careers', 'create')
        or public.current_user_has_permission('admin', 'create')
    );

drop policy if exists "Career managers can edit jobs"
    on public.sprint_careers_jobs;
create policy "Career managers can edit jobs"
    on public.sprint_careers_jobs
    for update
    to authenticated
    using (
        public.current_user_has_permission('careers', 'edit')
        or public.current_user_has_permission('cms_careers', 'edit')
        or public.current_user_has_permission('admin', 'edit')
    )
    with check (
        public.current_user_has_permission('careers', 'edit')
        or public.current_user_has_permission('cms_careers', 'edit')
        or public.current_user_has_permission('admin', 'edit')
    );

drop policy if exists "Career managers can delete jobs"
    on public.sprint_careers_jobs;
create policy "Career managers can delete jobs"
    on public.sprint_careers_jobs
    for delete
    to authenticated
    using (
        public.current_user_has_permission('careers', 'delete')
        or public.current_user_has_permission('cms_careers', 'delete')
        or public.current_user_has_permission('admin', 'delete')
    );

-- Preserve existing listings from the legacy table when it is present.
do $$
begin
    if to_regclass('public.career_openings') is not null then
        execute $migration$
            insert into public.sprint_careers_jobs (
                id,
                title,
                type,
                location,
                description,
                responsibilities,
                requirements,
                duration,
                stipend,
                status,
                posted_date,
                created_at,
                updated_at
            )
            select
                legacy.id,
                legacy.title,
                legacy.job_type::text,
                legacy.location,
                legacy.description,
                '[]'::jsonb,
                to_jsonb(legacy.requirements),
                legacy.duration,
                legacy.stipend_compensation,
                case when legacy.is_active then 'published' else 'closed' end,
                legacy.posted_date,
                legacy.created_at,
                legacy.updated_at
            from public.career_openings as legacy
            on conflict (id) do nothing
        $migration$;
    end if;
end;
$$;
