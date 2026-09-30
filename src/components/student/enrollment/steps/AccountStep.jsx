import EnrollmentComingSoon from "../EnrollmentComingSoon";

/**
 * Step 5 — Account (scaffolded).
 *
 * When the form lands it reuses `PasswordInput` and `PasswordRequirements` from
 * the Phase 1 auth kit plus `validateNewPassword` / `validateConfirmPassword`
 * from `@/components/student/auth/auth-validation`.
 */
const UPCOMING_FIELDS = [
  "Portal password and confirmation",
  "Terms and privacy acceptance",
  "WhatsApp and email contact preferences",
];

export default function AccountStep() {
  return (
    <EnrollmentComingSoon
      note="The account step creates the credentials you will sign in with once enrollment is confirmed."
      fields={UPCOMING_FIELDS}
    />
  );
}
