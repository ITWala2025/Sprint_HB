-- ============================================================================
-- SPRINT Student Portal — Authentication Migration
-- ============================================================================
-- Run this in the Supabase SQL Editor (or via your migration tool) once.
--
-- What it does:
--   1. Adds the student fields to public.profiles:
--        first_name, last_name, mobile_number, status
--   2. Rebuilds the Auth "new user" trigger so every sign-up writes a complete
--      student profile (first_name, last_name, full_name, email,
--      mobile_number, role = 'student', status = 'active').
--   3. Adds the RLS INSERT policy a student needs to create their own profile
--      row (auth.uid() = id) — SELECT / UPDATE self-policies already exist.
--
-- IMPORTANT:
--   - Passwords are NEVER stored here. Supabase Auth manages them.
--   - No password_hash / reset_token columns are introduced.
--   - RLS stays ENABLED; nothing here weakens it.
-- ============================================================================

/* ----------------------------------------------------------------------------
   1. STUDENT FIELDS ON public.profiles
---------------------------------------------------------------------------- */

alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists mobile_number text;

-- Existing rows: default to 'active' so already-registered students keep access.
alter table public.profiles add column if not exists status text not null default 'active';

/* ----------------------------------------------------------------------------
   2. BACKFILL first_name / last_name FROM full_name (pre-sign-up rows)
---------------------------------------------------------------------------- */

update public.profiles
set first_name = coalesce(
        public.profiles.first_name,
        nullif(split_part(full_name, ' ', 1), '')
    ),
    last_name = coalesce(
        public.profiles.last_name,
        nullif(
            substring(full_name from (position(' ' in full_name || ' ') + 1)),
            ''
        )
    )
where full_name is not null
  and full_name <> '';

/* ----------------------------------------------------------------------------
   3. AUTH "NEW USER" TRIGGER — complete student profile
---------------------------------------------------------------------------- */

create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (
        id,
        first_name,
        last_name,
        full_name,
        email,
        mobile_number,
        role,
        status
    )
    values (
        new.id,
        coalesce(
            nullif(new.raw_user_meta_data->>'first_name', ''),
            split_part(coalesce(new.raw_user_meta_data->>'full_name', ''), ' ', 1)
        ),
        coalesce(nullif(new.raw_user_meta_data->>'last_name', ''), ''),
        coalesce(
            new.raw_user_meta_data->>'full_name',
            nullif(
                trim(concat(
                    coalesce(new.raw_user_meta_data->>'first_name', ''),
                    ' ',
                    coalesce(new.raw_user_meta_data->>'last_name', '')
                )),
                ''
            )
        ),
        new.email,
        new.raw_user_meta_data->>'mobile_number',
        coalesce(
            (new.raw_user_meta_data->>'role')::public.user_role,
            'student'::public.user_role
        ),
        'active'
    )
    on conflict (id) do update set
        email = excluded.email,
        first_name = case
            when public.profiles.first_name is null or public.profiles.first_name = ''
            then excluded.first_name
            else public.profiles.first_name
        end,
        last_name = case
            when public.profiles.last_name is null or public.profiles.last_name = ''
            then excluded.last_name
            else public.profiles.last_name
        end,
        full_name = case
            when public.profiles.full_name = ''
            then excluded.full_name
            else public.profiles.full_name
        end,
        mobile_number = coalesce(public.profiles.mobile_number, excluded.mobile_number);
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

/* ----------------------------------------------------------------------------
   4. ROW LEVEL SECURITY — only ever the student's own row
---------------------------------------------------------------------------- */

alter table public.profiles enable row level security;

-- A student may create exactly one profile row and only for themselves.
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
    on public.profiles
    for insert
    to authenticated
    with check (auth.uid() = id);

-- Self-service access is already covered, but keep them explicit and enforced.
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
    on public.profiles
    for select
    to authenticated
    using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
    on public.profiles
    for update
    to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);

/* ----------------------------------------------------------------------------
   5. Keep updated_at fresh (public.handle_updated_at already exists)
---------------------------------------------------------------------------- */

drop trigger if exists handle_profiles_updated_at on public.profiles;
create trigger handle_profiles_updated_at
    before update on public.profiles
    for each row execute procedure public.handle_updated_at();