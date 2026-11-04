-- Enrollment approval provisions the student and activates portal access
-- atomically. Registration submissions may not yet have a student number.

alter table public.registrations
    alter column registration_number drop not null;

alter table public.profiles
    add column if not exists is_active boolean not null default true;

alter table public.students
    add column if not exists phone text,
    add column if not exists status text not null default 'active';

drop policy if exists "Student operations can view directory profiles" on public.profiles;
create policy "Student operations can view directory profiles"
    on public.profiles for select to authenticated
    using (public.current_user_has_permission('student_ops', 'view'));

drop policy if exists "Student operations can view directory records" on public.students;
create policy "Student operations can view directory records"
    on public.students for select to authenticated
    using (public.current_user_has_permission('student_ops', 'view'));

create or replace function public.verify_and_approve_registration(
    p_reg_id uuid,
    p_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    application public.registrations%rowtype;
    student_number text;
begin
    if p_reg_id is null or p_user_id is null then
        raise exception 'A registration and user are required for approval.';
    end if;

    select *
    into application
    from public.registrations
    where id = p_reg_id
    for update;

    if not found then
        raise exception 'This enrollment application no longer exists.';
    end if;

    if application.status <> 'pending'::public.registration_status then
        raise exception 'This enrollment application has already been reviewed.';
    end if;

    if not exists (select 1 from auth.users where id = p_user_id) then
        raise exception 'The applicant account could not be verified.';
    end if;

    select registration_number
    into student_number
    from public.students
    where id = p_user_id
    for update;

    student_number := coalesce(
        nullif(trim(student_number), ''),
        nullif(trim(application.registration_number), ''),
        'SPR-' || to_char(timezone('utc', now()), 'YYYY') || '-' || upper(replace(application.id::text, '-', ''))
    );

    insert into public.profiles (id, full_name, email, phone, role, is_active)
    values (p_user_id, application.full_name, application.email, application.phone, 'student', true)
    on conflict (id) do update
    set full_name = case
            when nullif(trim(public.profiles.full_name), '') is null then excluded.full_name
            else public.profiles.full_name
        end,
        email = excluded.email,
        phone = coalesce(public.profiles.phone, excluded.phone),
        role = case
            when public.profiles.role = 'admin'::public.user_role then public.profiles.role
            else 'student'::public.user_role
        end,
        role_id = case
            when public.profiles.role = 'admin'::public.user_role then public.profiles.role_id
            else null
        end,
        is_active = true;

    insert into public.students (
        id,
        registration_number,
        college_institution,
        course_degree,
        specialization_branch,
        current_semester,
        phone,
        status,
        employment_status,
        organization_name,
        city,
        state
    )
    values (
        p_user_id,
        student_number,
        coalesce(nullif(trim(application.college_institution), ''), 'SPRINT Campus Institute'),
        coalesce(nullif(trim(application.course_degree), ''), 'General Technology Track'),
        application.specialization_branch,
        application.year_semester,
        application.phone,
        'active',
        application.employment_status,
        application.organization_name,
        application.city,
        application.state
    )
    on conflict (id) do update
    set registration_number = coalesce(
            nullif(trim(public.students.registration_number), ''),
            excluded.registration_number
        ),
        college_institution = coalesce(
            nullif(trim(public.students.college_institution), ''),
            excluded.college_institution
        ),
        course_degree = coalesce(
            nullif(trim(public.students.course_degree), ''),
            excluded.course_degree
        ),
        specialization_branch = coalesce(
            nullif(trim(public.students.specialization_branch), ''),
            excluded.specialization_branch
        ),
        current_semester = coalesce(
            nullif(trim(public.students.current_semester), ''),
            excluded.current_semester
        ),
        phone = coalesce(nullif(trim(public.students.phone), ''), excluded.phone),
        status = 'active',
        employment_status = coalesce(
            nullif(trim(public.students.employment_status), ''),
            excluded.employment_status
        ),
        organization_name = coalesce(
            nullif(trim(public.students.organization_name), ''),
            excluded.organization_name
        ),
        city = coalesce(nullif(trim(public.students.city), ''), excluded.city),
        state = coalesce(nullif(trim(public.students.state), ''), excluded.state);

    update public.registrations
    set status = 'approved'::public.registration_status,
        user_id = p_user_id,
        registration_number = coalesce(registration_number, student_number)
    where id = p_reg_id;

    return p_user_id;
end;
$$;

revoke all on function public.verify_and_approve_registration(uuid, uuid) from public;
revoke all on function public.verify_and_approve_registration(uuid, uuid) from anon;
revoke all on function public.verify_and_approve_registration(uuid, uuid) from authenticated;
grant execute on function public.verify_and_approve_registration(uuid, uuid) to service_role;
