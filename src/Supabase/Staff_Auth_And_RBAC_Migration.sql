create table if not exists public.roles (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    description text,
    permissions jsonb not null default '{}'::jsonb,
    color text not null default 'navy',
    is_active boolean not null default true,
    is_system boolean not null default false,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles
    add column if not exists role_id uuid,
    add column if not exists is_active boolean not null default true;

alter table public.profiles
    add column if not exists must_change_password boolean default false;

update public.profiles
set must_change_password = false
where must_change_password is null;

alter table public.profiles
    alter column must_change_password set default false,
    alter column must_change_password set not null;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'profiles_role_id_fkey'
          and conrelid = 'public.profiles'::regclass
    ) then
        alter table public.profiles
            add constraint profiles_role_id_fkey
            foreign key (role_id) references public.roles(id) on delete set null;
    end if;
end;
$$;

create index if not exists profiles_role_id_idx on public.profiles(role_id);

create or replace function public.current_user_has_permission(module_key text, capability text default 'view')
returns boolean
language sql
security definer
stable
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles profile
        left join public.roles assigned_role on assigned_role.id = profile.role_id
        where profile.id = auth.uid()
          and profile.is_active
          and (
              profile.role = 'admin'::public.user_role
              or coalesce((assigned_role.permissions ->> 'full_access')::boolean, false)
              or coalesce((assigned_role.permissions -> module_key ->> capability)::boolean, false)
          )
    );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, full_name, email, role)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
        new.email,
        coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role)
    )
    on conflict (id) do update
    set email = excluded.email,
        full_name = case
            when public.profiles.full_name = '' then excluded.full_name
            else public.profiles.full_name
        end;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

create or replace function public.current_user_has_permission(module_key text, capability text default 'view')
returns boolean
language sql
security definer
stable
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles profile
        left join public.roles assigned_role on assigned_role.id = profile.role_id
        where profile.id = auth.uid()
          and profile.is_active
          and (
              profile.role = 'admin'::public.user_role
              or (
                  assigned_role.is_active
                  and (
                      coalesce((assigned_role.permissions ->> 'full_access')::boolean, false)
                      or coalesce((assigned_role.permissions -> module_key ->> capability)::boolean, false)
                  )
              )
          )
    );
$$;

alter table public.profiles enable row level security;
alter table public.roles enable row level security;

drop policy if exists "Users can view their assigned role" on public.roles;
create policy "Users can view their assigned role"
    on public.roles for select
    using (
        exists (
            select 1
            from public.profiles profile
            where profile.id = auth.uid()
              and profile.role_id = roles.id
        )
        or public.current_user_has_permission('user_management', 'view')
        or public.current_user_has_permission('access_control', 'view')
    );

drop policy if exists "User managers can view staff directory" on public.profiles;
create policy "User managers can view staff directory"
    on public.profiles for select
    using (
        id = auth.uid()
        or public.current_user_has_permission('user_management', 'view')
        or public.current_user_has_permission('access_control', 'view')
    );

create schema if not exists staff_security;
revoke all on schema staff_security from public, anon, authenticated;

create table if not exists staff_security.password_reset_state (
    user_id uuid primary key references auth.users(id) on delete cascade,
    password_changed boolean not null default false
);

alter table staff_security.password_reset_state enable row level security;
revoke all on table staff_security.password_reset_state from public, anon, authenticated;

create or replace function public.mark_staff_password_changed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    update staff_security.password_reset_state
    set password_changed = true
    where user_id = new.id;
    return new;
end;
$$;

revoke all on function public.mark_staff_password_changed() from public, anon, authenticated;

drop trigger if exists on_staff_password_changed on auth.users;
create trigger on_staff_password_changed
    after update of encrypted_password on auth.users
    for each row
    when (old.encrypted_password is distinct from new.encrypted_password)
    execute function public.mark_staff_password_changed();

drop function if exists public.admin_create_staff_user(text, text, text, uuid);
drop function if exists public.admin_create_staff_user(text, text, uuid, text);

create function public.admin_create_staff_user(
    p_email text,
    p_temp_password text,
    p_role_id uuid,
    p_full_name text
)
returns table (user_id uuid, status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
    new_user_id uuid := gen_random_uuid();
    normalized_email text := lower(btrim(p_email));
    normalized_name text := btrim(p_full_name);
begin
    if auth.role() is distinct from 'service_role' then
        raise exception 'Provisioning is available only to the trusted server';
    end if;

    if normalized_email is null or normalized_email = '' then
        raise exception 'Email is required';
    end if;
    if p_temp_password is null or length(p_temp_password) < 8 then
        raise exception 'Temporary password must be at least 8 characters';
    end if;
    if normalized_name is null or normalized_name = '' then
        raise exception 'Full name is required';
    end if;
    if p_role_id is null or not exists (
        select 1 from public.roles assigned_role
        where assigned_role.id = p_role_id and assigned_role.is_active
    ) then
        raise exception 'An active role is required';
    end if;
    if exists (
        select 1 from auth.users existing_user
        where lower(existing_user.email) = normalized_email
    ) then
        raise exception 'A user with this email already exists';
    end if;

    insert into auth.users (
        id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_user_meta_data, created_at, updated_at
    ) values (
        new_user_id,
        'authenticated',
        'authenticated',
        normalized_email,
        extensions.crypt(p_temp_password, extensions.gen_salt('bf')),
        pg_catalog.now(),
        pg_catalog.jsonb_build_object(
            'full_name', normalized_name,
            'is_staff_provisioned', true
        ),
        pg_catalog.now(),
        pg_catalog.now()
    );

    insert into public.profiles (
        id, email, role, full_name, role_id, must_change_password, is_active
    ) values (
        new_user_id,
        normalized_email,
        'staff'::public.user_role,
        normalized_name,
        p_role_id,
        true,
        true
    )
    on conflict (id) do update
    set email = excluded.email,
        role = excluded.role,
        full_name = excluded.full_name,
        role_id = excluded.role_id,
        must_change_password = true,
        is_active = true;

    insert into staff_security.password_reset_state (user_id, password_changed)
    values (new_user_id, false)
    on conflict (user_id) do update
    set password_changed = false;

    return query select new_user_id, 'created'::text;
end;
$$;

revoke all on function public.admin_create_staff_user(text, text, uuid, text) from public, anon, authenticated;
grant execute on function public.admin_create_staff_user(text, text, uuid, text) to service_role;

create or replace function public.complete_staff_password_reset()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    caller_id uuid := auth.uid();
    password_was_changed boolean;
begin
    if caller_id is null then
        raise exception 'Authentication is required';
    end if;

    select reset_state.password_changed
    into password_was_changed
    from staff_security.password_reset_state reset_state
    where reset_state.user_id = caller_id;

    if not found then
        if exists (
            select 1 from public.profiles profile
            where profile.id = caller_id and profile.must_change_password
        ) then
            raise exception 'The password reset could not be verified';
        end if;
        return false;
    end if;

    if not password_was_changed then
        raise exception 'The authentication password has not been changed';
    end if;

    update public.profiles
    set must_change_password = false
    where id = caller_id;

    if not found then
        raise exception 'Profile not found';
    end if;

    delete from staff_security.password_reset_state where user_id = caller_id;
    return true;
end;
$$;

revoke all on function public.complete_staff_password_reset() from public, anon;
grant execute on function public.complete_staff_password_reset() to authenticated;