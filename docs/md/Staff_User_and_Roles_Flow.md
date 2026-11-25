# Staff Accounts, Roles, and Login Flow

This document describes the staff account and role flow implemented in the current SPRINT application: how an administrator provisions a staff account, assigns permissions, how the staff member signs in and completes first-time setup, and how the application authorizes later requests.

## At a glance

1. An administrator with staff-management permission opens **Admin → Staff & User Directory**.
2. They enter a name, email, active role, and temporary password.
3. The server verifies the acting administrator and role, creates a confirmed Supabase Auth user with a temporary password, creates an active `staff` profile, records a one-hour invitation token, and attempts SMTP delivery.
4. The staff member opens the invitation URL, signs in at `/staff/login` with the email and temporary password, and is prompted to set a permanent password.
5. On successful setup, the profile's `must_change_password` and `first_login` flags are cleared, the matching invitation is marked used, and the staff member is sent to `/staff/dashboard`.
6. Their assigned role's permission map controls access to protected admin modules. A staff account and an admin account share underlying workspace components, but staff navigation and protected routes are permission-scoped.

## Core concepts and records

| Record | Purpose |
| --- | --- |
| `auth.users` | Supabase Auth identity and password. Its UUID is also the profile ID. |
| `public.profiles` | Application identity. Staff created through the current flow have `role = 'staff'`, an `email`, `full_name`, `role_id`, `is_active = true`, and first-login password flags. |
| `public.roles` | A reusable permission policy: name, slug, active/system flags, and a JSONB `permissions` map. |
| `public.staff_invitations` | Server-managed invitation token, status, expiry, user, and email. Client roles have no table access; the service role manages it. |

`profiles.role` identifies the broad account type (`staff`, `admin`, `student`, etc.). `profiles.role_id` points to a specific RBAC role such as “Admissions Officer.” The role name is not the account's authentication identity.

## 1. Set up roles and permissions

Roles are managed at `/admin/roles` in **Roles & Permissions**:

- The route and data actions require `access_control` permission. A profile whose broad role is `admin`, or whose permissions include `full_access`, is treated as an administrator for access checks.
- A new role has a name, slug, description, color, active/system flags, and a permission map. The slug is generated from the name by default and can be edited.
- The permission editor groups modules and provides `view`, `create`, `edit`, `delete`, and `export` capabilities. Presets include Super Admin (Full Access), Content Editor, Admissions Officer, Academic Mentor, and Read Only.
- Saving a role inserts or updates `public.roles`. Role permission data is stored as JSONB. `full_access: true` grants all permissions in the application checks.
- Existing staff can be assigned a role using the role selector in the user list. This updates `profiles.role_id`. Clearing the selector removes the assignment.
- Deleting a non-system role first attempts to clear that role from assigned profiles, then deletes the role. System roles cannot be deleted in the UI/action.

The route permission map lives in [`auth-types.ts`](../../src/app/admin/auth-types.ts). It maps admin routes to one or more module keys. Server route checks use [`authorization.ts`](../../src/app/admin/authorization.ts); database permission/RLS support is defined in the RBAC migrations.

### Role management entry points

- [`roles/page.tsx`](../../src/app/admin/roles/page.tsx): role catalog, user-role assignments, access matrix, and role editor.
- [`RoleModal.tsx`](../../src/components/admin/roles/RoleModal.tsx): role fields, presets, permission editor, and save action.
- [`roles/actions.ts`](../../src/app/admin/roles/actions.ts): role list, role create/update/delete, staff role assignment, and profile deletion.
- [`types.ts`](../../src/components/admin/roles/types.ts): role types, capability names, modules, and presets' permission shape.

The roles screen's **Assign Role** button currently opens the user-creation modal; existing users are assigned through the role selector in their row.

## 2. Administrator creates a staff account

### UI and authorization

1. The administrator opens `/admin/users` (**Staff & User Directory**).
2. The page requires view permission on `user_management` or `access_control`. It loads non-student profiles and active roles.
3. The **Invite / Create User** control is shown to an admin or a user with `create` on `user_management` or `access_control`.
4. The form collects full name, email, active role, and a temporary password. The browser generates a random 12-character default password; it can be regenerated or edited. The form requires at least 12 characters.
5. The form calls `provisionStaffUserAction` on the server. The server independently verifies the current Supabase Auth user and their active profile. It permits broad-role admins, or active-role users with `create` on `user_management` or `access_control`. It then re-checks that the selected role still exists, is active, and has the submitted name.

### Server provisioning sequence

In [`users/actions.ts`](../../src/app/admin/users/actions.ts), the action:

1. Normalizes the email to lowercase and trims the name and role fields; validates name, email, and temporary-password length.
2. Uses the server-only Supabase service client. The service key is never used in browser code.
3. Calls the service client's `check_auth_email_exists` RPC against `auth.users`. If the function is unavailable, it falls back to a case-insensitive profile email lookup; the Auth create operation also maps duplicate-email races to a clear error. Existing accounts are not automatically reused or re-invited.
4. Generates a cryptographically random invitation token, expiry timestamp (one hour), and invitation URL:
   `NEXT_PUBLIC_SITE_URL/staff/invitation/{token}` (falls back to `http://localhost:3000` if the site URL is unset).
5. Creates a confirmed Supabase Auth user directly with the supplied temporary password and metadata for the staff name and broad role. This avoids Supabase Auth invite-email rate limits.
6. Upserts the profile as `role = 'staff'`, assigns the selected `role_id`, sets `is_active = true`, and sets `must_change_password = true` and `first_login = true`.
7. Marks any prior pending invitations for that email expired, then inserts the new pending invitation with its one-hour expiry.
8. If SMTP is configured, sends the branded invitation using the existing SMTP mailer and staff invitation template. A mail failure is non-fatal: the action still returns the credentials and link, with a warning for the success dialog.
9. Revalidates `/admin/users` and returns the email, temporary password, invitation URL, and email-delivery status to the client.

If profile or invitation persistence fails after Auth user creation, the action attempts to delete the new Auth user (which cascades dependent records) and reports cleanup failures rather than returning success.

The success dialog shows the email, temporary password, and invitation URL with copy controls. If SMTP is missing or delivery fails, it displays a warning and leaves the credentials available to share manually. The email action uses [`mailer.ts`](../../src/lib/email/mailer.ts) and [`staff-invite-email.ts`](../../src/lib/email/templates/staff-invite-email.ts).

### Resend invitation

For an active staff profile that still has `first_login` or `must_change_password` set, an authorized administrator can choose **Resend invite**:

- A new temporary password and one-hour app invitation token are generated, and the Auth password plus first-login flags are reset.
- Prior pending invitation rows for that user are expired, and a new pending row is inserted.
- The SMTP mailer attempts to send the branded invitation regardless of Auth email confirmation state. Delivery failure is non-fatal and displayed as a warning; the new credentials/link remain available to the administrator.

## 3. Staff accepts the invitation and signs in

1. The invitation URL opens `/staff/invitation/{token}`.
2. The server looks up the token using the service client. Invalid, expired, used, or otherwise non-pending invitations show an explanatory message. A valid pending token redirects to `/staff/login?invitation={token}&email={email}`.
3. The email is prefilled and read-only on the login form. The staff member enters the temporary password and submits.
4. The browser calls Supabase Auth `signInWithPassword`, then loads the matching profile's broad `role`, `first_login`, `must_change_password`, and `is_active` fields.
5. A missing, unreadable, or inactive profile is signed out and shown an error. Student and other non-staff/non-admin profiles are also signed out; students are directed to the Student Portal.
6. If either first-login flag is true, the first-time password dialog opens. Otherwise, the browser goes to `/staff/dashboard`.
7. The first-time dialog requires a password of at least 8 characters, including an uppercase letter and a number, plus a matching confirmation. It calls `completeFirstTimeStaffSetupAction` with the password and optional invitation token; the server validates the password and updates Supabase Auth.
8. The server action resolves the user from the cookie-aware Supabase Auth session, falling back only to a valid signed admin-session cookie, then verifies an active staff/admin profile. It re-establishes the Supabase cookie session with the new password, clears `must_change_password` and `first_login`, keeps the profile active, and marks matching staff invitations `used` with `used_at`. If a supplied invitation cannot be marked used, it restores the prior password flags.
9. The browser performs a full navigation to `/staff/dashboard` (or `/admin/dashboard` for broad-role admins), loading fresh cookies and server-rendered layout props. If no valid session cookie or signed admin-session fallback exists, the modal redirects to `/staff/login`, preserving the invitation token and email query when present.

The principal UI files are [`StaffLoginForm.tsx`](../../src/app/staff/login/StaffLoginForm.tsx), [`page.tsx`](../../src/app/staff/invitation/[token]/page.tsx), [`FirstTimePasswordModal.tsx`](../../src/components/staff/auth/FirstTimePasswordModal.tsx), and [`login/actions.ts`](../../src/app/staff/login/actions.ts).

## 4. Authenticated requests and role-based access

- `/staff` redirects to `/staff/login`. The staff routes are included in the request middleware matcher.
- Supabase Auth remains the source of the authenticated user. On every matched admin/staff request, middleware validates the Auth user and re-reads the profile and assigned role from Supabase; it refreshes or clears the signed, HTTP-only `sprint_admin_session` cookie accordingly. The cookie is not trusted as an authorization fast path.
- An active staff user who has completed first-time setup and visits the login page is redirected to `/staff/dashboard`; staff with either first-login flag still set remain on `/staff/login` and are redirected there from protected staff workspace pages. An admin is redirected to `/admin/dashboard`. Login submissions and Server Actions are not redirected by Proxy. A `sprint_admin_session` cookie alone never authorizes a staff workspace request without a valid Supabase Auth user. An admin visiting a staff workspace route is redirected to its `/admin/...` counterpart.
- `/staff/dashboard` reuses the admin dashboard page component. Workspace navigation uses the same admin route list, but staff-facing links are rewritten to `/staff/...` and filtered by the staff permission map.
- Protected admin pages call `assertModuleAccess`. `getAdminSession` also revalidates the Auth user, profile, active state, broad role, and currently assigned active role from Supabase on the request. Admins and active `full_access` roles pass; other staff need the relevant current module capability, otherwise they are redirected to `/staff/dashboard`.
- Database RLS policies and `current_user_has_permission` provide another permission layer for browser/session-scoped queries. Service-role operations are server-side and must perform their own authorization checks.
- A role edit, role assignment, permission change, or profile deactivation is checked against current database state on the next protected request; an earlier signed-cookie permission snapshot cannot preserve revoked access.

Relevant files: [`middleware.ts`](../../src/lib/supabase/middleware.ts), [`admin-session.ts`](../../src/lib/auth/admin-session.ts), [`session.ts`](../../src/app/admin/session.ts), [`authorization.ts`](../../src/app/admin/authorization.ts), and [`AdminLayoutClient.tsx`](../../src/app/admin/AdminLayoutClient.tsx).

## 5. Ongoing administration

### Directory view and resend

`/admin/users` displays non-student profiles, assigned role, active state, and whether a password change is still required. Search and role filters are client-side. The page uses the service client when configured and falls back to the authenticated client for reads.

### Deletion paths

There are two distinct delete actions:

- The **Staff & User Directory** permanent delete calls `deleteStaffUserAction`. It prevents self-deletion, checks the actor's active profile and admin/super-admin or `delete` permission, removes invitation rows, deletes the profile, then deletes the Supabase Auth user. Invitation-table-not-found errors are tolerated for cleanup; other failures are surfaced.
- The **Roles & Access Control** user-list delete calls `deleteStaffProfileAction`, which delegates to the same full account-deletion action as the directory.

## 6. Database and environment setup

The current application flow expects the profile/RBAC and invitation schema to exist. The SQL files in `src/Supabase` should be reviewed/applied in this order for a fresh setup:

1. `Admin Auth Schema.sql` / the project's base schema, which defines `user_role` and `profiles`.
2. `Staff_Auth_And_RBAC_Migration.sql`, which adds roles, profile RBAC/active/password fields, permission functions and policies, and a service-role-only staff-provisioning RPC.
3. `Staff Invitations Migration.sql`, which adds `first_login`, `staff_invitations`, its RLS/service-role grants, and the first-login trigger.
4. `Staff First-Time Setup Migration.sql`, which adds `used` invitation status and `used_at`.

The current web provisioning action uses Supabase Auth Admin APIs and direct service-client table operations; it does **not** call the SQL `admin_create_staff_user` RPC. The RPC remains in the migration as a separate server-only provisioning option.
The `check_auth_email_exists` lookup function is defined in `Unified Registration Enrollment OTP Migration.sql`; make sure that migration (or an equivalent function migration) is applied for direct Auth duplicate checks.

Required runtime configuration includes:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or the supported anon-key fallback)
- `SUPABASE_SERVICE_ROLE_KEY` for provisioning, invitation lookup, and privileged staff-management operations
- `NEXT_PUBLIC_SITE_URL` set to the deployed site origin so generated invitation URLs point to the correct host
- SMTP settings (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`; optionally `SMTP_PORT`, `SMTP_SECURE`, and `SMTP_FROM`) for branded invitation email. If SMTP is not configured, staff credentials and links must be shared manually.

The invitation migration's initial status constraint does not include `used`; run the follow-on `Staff First-Time Setup Migration.sql` as well, because the current app writes `status = 'used'`.

## 7. Source and test map

| Concern | Main files |
| --- | --- |
| Directory page and account actions | [`users/page.tsx`](../../src/app/admin/users/page.tsx), [`users/actions.ts`](../../src/app/admin/users/actions.ts), [`UserDirectoryTable.tsx`](../../src/components/admin/users/UserDirectoryTable.tsx) |
| Create/resend UI | [`CreateUserModal.tsx`](../../src/components/admin/roles/CreateUserModal.tsx) |
| Roles and assignments | [`roles/page.tsx`](../../src/app/admin/roles/page.tsx), [`roles/actions.ts`](../../src/app/admin/roles/actions.ts), [`RoleModal.tsx`](../../src/components/admin/roles/RoleModal.tsx), [`types.ts`](../../src/components/admin/roles/types.ts) |
| Staff login and invitation | [`staff/login/page.tsx`](../../src/app/staff/login/page.tsx), [`StaffLoginForm.tsx`](../../src/app/staff/login/StaffLoginForm.tsx), [`invitation/[token]/page.tsx`](../../src/app/staff/invitation/[token]/page.tsx) |
| First-time password setup | [`FirstTimePasswordModal.tsx`](../../src/components/staff/auth/FirstTimePasswordModal.tsx), [`staff/login/actions.ts`](../../src/app/staff/login/actions.ts) |
| Auth/session/permissions | [`proxy.ts`](../../src/proxy.ts), [`middleware.ts`](../../src/lib/supabase/middleware.ts), [`session.ts`](../../src/app/admin/session.ts), [`authorization.ts`](../../src/app/admin/authorization.ts), [`auth-types.ts`](../../src/app/admin/auth-types.ts) |
| Database | [`Staff_Auth_And_RBAC_Migration.sql`](../../src/Supabase/Staff_Auth_And_RBAC_Migration.sql), [`Staff Invitations Migration.sql`](../../src/Supabase/Staff%20Invitations%20Migration.sql), [`Staff First-Time Setup Migration.sql`](../../src/Supabase/Staff%20First-Time%20Setup%20Migration.sql), [`RBAC Schema.sql`](../../src/Supabase/RBAC%20Schema.sql) |
| Focused tests | [`StaffLoginFlow.test.tsx`](../../tests/unit/staff/StaffLoginFlow.test.tsx), [`CreateUserModal.test.tsx`](../../tests/unit/admin/CreateUserModal.test.tsx), [`UserDirectoryTable.test.tsx`](../../tests/unit/admin/UserDirectoryTable.test.tsx), [`authorization.test.ts`](../../tests/unit/admin/authorization.test.ts) |
