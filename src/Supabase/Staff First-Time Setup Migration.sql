alter table public.profiles
    add column if not exists password_changed boolean not null default false;

alter table public.staff_invitations
    add column if not exists used_at timestamptz;

alter table public.staff_invitations
    drop constraint if exists staff_invitations_status_check;

alter table public.staff_invitations
    add constraint staff_invitations_status_check
    check (status in ('pending', 'expired', 'accepted', 'used'));
