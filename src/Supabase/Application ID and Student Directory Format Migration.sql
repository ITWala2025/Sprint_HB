-- ============================================================================
-- SPRINT Application ID and Student Directory Format Migration
-- ============================================================================
-- Format Standards:
-- 1. Application ID: SPR-APP-YYMM-XXXX (e.g., SPR-APP-2611-0001)
-- 2. Student ID: SPR-YYYY-XXXX (e.g., SPR-2026-0001)
--
-- Ensures UUIDs are never exposed in UI or transactional workflows.
-- ============================================================================

-- 1. Trigger function for automatic application_number generation on public.enrollments
create or replace function public.set_enrollment_application_number()
returns trigger as $$
declare
    v_prefix text;
    v_seq int;
begin
    if new.application_number is null or new.application_number = '' then
        v_prefix := 'SPR-APP-' || to_char(coalesce(new.created_at, timezone('utc', now())), 'YYMM') || '-';

        select coalesce(max(nullif(substring(application_number from 14 for 4), '')::int), 0) + 1
        into v_seq
        from public.enrollments
        where application_number like v_prefix || '%';

        new.application_number := v_prefix || lpad(v_seq::text, 4, '0');
    end if;
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_enrollments_application_number on public.enrollments;
create trigger trg_enrollments_application_number
    before insert on public.enrollments
    for each row
    execute function public.set_enrollment_application_number();

-- 2. Backfill existing enrollments that lack application_number
do $$
declare
    r record;
    v_prefix text;
    v_seq int;
begin
    for r in
        select id, created_at
        from public.enrollments
        where application_number is null or application_number = ''
        order by created_at asc
    loop
        v_prefix := 'SPR-APP-' || to_char(coalesce(r.created_at, timezone('utc', now())), 'YYMM') || '-';

        select coalesce(max(nullif(substring(application_number from 14 for 4), '')::int), 0) + 1
        into v_seq
        from public.enrollments
        where application_number like v_prefix || '%';

        update public.enrollments
        set application_number = v_prefix || lpad(v_seq::text, 4, '0')
        where id = r.id;
    end loop;
end $$;

-- 3. Notify PostgREST to reload schema cache
notify pgrst, 'reload schema';

