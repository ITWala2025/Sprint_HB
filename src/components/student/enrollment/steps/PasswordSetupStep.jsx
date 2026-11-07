import { CheckCircle2 } from "lucide-react";

import AuthField from "@/components/student/auth/AuthField";
import PasswordInput from "@/components/student/auth/PasswordInput";
import PasswordRequirements from "@/components/student/auth/PasswordRequirements";

export default function PasswordSetupStep({
  idPrefix,
  values = {},
  errors = {},
  onChange,
  isPasswordSet = false,
}) {
  if (isPasswordSet) {
    return (
      <div
        role="status"
        className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-900"
      >
        <CheckCircle2 aria-hidden="true" className="size-5 shrink-0" />
        Your Student Portal password is set.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PasswordInput
        id={`${idPrefix}-newPassword`}
        name="newPassword"
        label="Create Password"
        value={values.newPassword ?? ""}
        onChange={onChange("newPassword")}
        error={errors.newPassword}
        autoComplete="new-password"
        required
        describedByIds={[`${idPrefix}-password-requirements`]}
      />
      <PasswordRequirements
        id={`${idPrefix}-password-requirements`}
        password={values.newPassword ?? ""}
      />
      <AuthField
        id={`${idPrefix}-confirmPassword`}
        name="confirmPassword"
        type="password"
        label="Confirm Password"
        value={values.confirmPassword ?? ""}
        onChange={onChange("confirmPassword")}
        error={errors.confirmPassword}
        autoComplete="new-password"
        required
      />
      <p className="text-xs leading-relaxed text-brand-text-muted">
        This password is managed securely by Supabase Auth and is never stored
        in SPRINT&apos;s application tables.
      </p>
    </div>
  );
}
