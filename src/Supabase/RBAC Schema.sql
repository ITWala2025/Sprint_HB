/* SPRINT RBAC and staff provisioning migration */

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

alter table public.profiles add column if not exists role_id uuid references public.roles(id) on delete set null;
alter table public.profiles add column if not exists is_active boolean not null default true;

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

alter table public.roles enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Staff can view roles" on public.roles;
create policy "Staff can view roles" on public.roles for select using (public.current_user_has_permission('access_control', 'view'));
drop policy if exists "Admins can manage roles" on public.roles;
create policy "Admins can manage roles" on public.roles for all using (public.current_user_has_permission('access_control', 'edit')) with check (public.current_user_has_permission('access_control', 'edit'));
drop policy if exists "Staff can view managed profiles" on public.profiles;
create policy "Staff can view managed profiles" on public.profiles for select using (id = auth.uid() or public.current_user_has_permission('access_control', 'view'));
drop policy if exists "Admins can update managed profiles" on public.profiles;
create policy "Admins can update managed profiles" on public.profiles for update using (public.current_user_has_permission('access_control', 'edit')) with check (public.current_user_has_permission('access_control', 'edit'));

insert into public.roles (name, slug, description, permissions, color, is_system)
values (
    'Super Admin',
    'super_admin',
    'Full access to every SPRINT admin module.',
    '{"full_access": true}'::jsonb,
    'navy',
    true
), (
    'Read Only',
    'read_only',
    'View-only access to protected modules.',
    '{"cms_home":{"view":true},"cms_about":{"view":true},"cms_courses":{"view":true},"cms_contact":{"view":true},"cms_careers":{"view":true},"cms_announcements":{"view":true},"cms_legal":{"view":true},"admissions":{"view":true},"student_ops":{"view":true},"academics":{"view":true},"trainers":{"view":true},"partners":{"view":true}}'::jsonb,
    'blue',
    true
)
on conflict (slug) do nothing;

update public.profiles profile
set role_id = seeded.id
from public.roles seeded
where profile.role = 'admin'::public.user_role
  and seeded.slug = 'super_admin'
  and profile.role_id is null;

create or replace function public.admin_create_staff_user(new_email text, new_password text, full_name text, target_role_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
    new_user_id uuid := gen_random_uuid();
begin
    if not public.current_user_has_permission('access_control', 'create') then
        raise exception 'Access denied';
    end if;
    if exists (select 1 from auth.users where email = lower(trim(new_email))) then
        raise exception 'A user with this email already exists';
    end if;
    insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
    values (new_user_id, 'authenticated', 'authenticated', lower(trim(new_email)), extensions.crypt(new_password, extensions.gen_salt('bf')), now(), jsonb_build_object('full_name', full_name), now(), now());
    update public.profiles
    set full_name = trim(admin_create_staff_user.full_name), email = lower(trim(admin_create_staff_user.new_email)), role_id = target_role_id, is_active = true
    where id = new_user_id;
    return new_user_id;
end;
$$;