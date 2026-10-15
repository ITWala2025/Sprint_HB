-- Enforce course and flagship-program capabilities for assigned staff roles.

drop policy if exists "Staff can create courses with permission" on public.courses;
create policy "Staff can create courses with permission"
    on public.courses for insert
    to authenticated
    with check (
        public.current_user_has_permission('courses', 'create')
        or public.current_user_has_permission('cms_courses', 'create')
    );

drop policy if exists "Staff can edit courses with permission" on public.courses;
create policy "Staff can edit courses with permission"
    on public.courses for update
    to authenticated
    using (
        public.current_user_has_permission('courses', 'edit')
        or public.current_user_has_permission('cms_courses', 'edit')
    )
    with check (
        public.current_user_has_permission('courses', 'edit')
        or public.current_user_has_permission('cms_courses', 'edit')
    );

drop policy if exists "Staff can delete courses with permission" on public.courses;
create policy "Staff can delete courses with permission"
    on public.courses for delete
    to authenticated
    using (
        public.current_user_has_permission('courses', 'delete')
        or public.current_user_has_permission('cms_courses', 'delete')
    );

drop policy if exists "Staff can create flagship programs with permission" on public.course_bundles;
create policy "Staff can create flagship programs with permission"
    on public.course_bundles for insert
    to authenticated
    with check (
        public.current_user_has_permission('course_bundle_cms', 'create')
        or public.current_user_has_permission('cms_courses', 'create')
    );

drop policy if exists "Staff can edit flagship programs with permission" on public.course_bundles;
create policy "Staff can edit flagship programs with permission"
    on public.course_bundles for update
    to authenticated
    using (
        public.current_user_has_permission('course_bundle_cms', 'edit')
        or public.current_user_has_permission('cms_courses', 'edit')
    )
    with check (
        public.current_user_has_permission('course_bundle_cms', 'edit')
        or public.current_user_has_permission('cms_courses', 'edit')
    );

drop policy if exists "Staff can delete flagship programs with permission" on public.course_bundles;
create policy "Staff can delete flagship programs with permission"
    on public.course_bundles for delete
    to authenticated
    using (
        public.current_user_has_permission('course_bundle_cms', 'delete')
        or public.current_user_has_permission('cms_courses', 'delete')
    );
