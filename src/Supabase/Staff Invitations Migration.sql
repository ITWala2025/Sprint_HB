-- Apply after Staff_Auth_And_RBAC_Migration.sql. Configure this project's
-- Supabase Auth redirect allowlist for the deployed /staff/invitation/* URL.
alter table public.profiles
    add column if not exists first_login boolean not null default false;

create table if not exists public.staff_invitations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    email text not null,
    token text not null unique,
    status text not null default 'pending'
        check (status in ('pending', 'expired', 'accepted')),
    expires_at timestamptz not null,
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists staff_invitations_email_status_idx
    on public.staff_invitations (email, status);

create index if not exists staff_invitations_user_status_idx
    on public.staff_invitations (user_id, status);

alter table public.staff_invitations enable row level security;
revoke all on table public.staff_invitations from public, anon, authenticated;
grant all on table public.staff_invitations to service_role;

create or replace function public.clear_staff_first_login_after_password_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if old.must_change_password and not new.must_change_password then
        new.first_login := false;
    end if;
    return new;
end;
$$;

drop trigger if exists clear_staff_first_login_after_password_change on public.profiles;
create trigger clear_staff_first_login_after_password_change
    before update of must_change_password on public.profiles
    for each row execute function public.clear_staff_first_login_after_password_change();
