import { Mail, Phone, User } from "lucide-react";

import AuthField from "@/components/student/auth/AuthField";

/**
 * Step 1 — Personal Information.
 *
 * The three fields an enrollment file cannot start without. Every field id is
 * `${idPrefix}-${fieldName}` (e.g. `personal-email`) because that is the
 * convention the wizard uses to move focus to the first invalid field after a
 * failed submit.
 *
 * Fields are controlled by the wizard, so re-visiting this step always shows
 * what was typed before.
 */
export default function PersonalInformationStep({ idPrefix, values = {}, errors = {}, onChange }) {
  return (
    <div className="space-y-5">
      <p className="text-xs font-medium text-brand-text-muted">
        All three fields are required — they open your student file.
      </p>

      <AuthField
        id={`${idPrefix}-name`}
        name="name"
        label="Full name"
        value={values.name ?? ""}
        onChange={onChange("name")}
        error={errors.name}
        placeholder="Ananya Sharma"
        autoComplete="name"
        icon={<User aria-hidden="true" className="size-4.5" />}
        hint="Spell it exactly as it should appear on your certificate."
        required
      />

      <AuthField
        id={`${idPrefix}-email`}
        name="email"
        type="email"
        label="Email address"
        value={values.email ?? ""}
        onChange={onChange("email")}
        error={errors.email}
        placeholder="you@example.com"
        autoComplete="email"
        inputMode="email"
        icon={<Mail aria-hidden="true" className="size-4.5" />}
        hint="Your enrollment confirmation and Student Portal login link arrive here."
        required
      />

      <AuthField
        id={`${idPrefix}-phone`}
        name="phone"
        type="tel"
        label="Mobile number"
        value={values.phone ?? ""}
        onChange={onChange("phone")}
        error={errors.phone}
        placeholder="98765 43210"
        autoComplete="tel"
        inputMode="tel"
        maxLength={16}
        icon={<Phone aria-hidden="true" className="size-4.5" />}
        hint="Class reminders and mentor calls are made to this number."
        required
      />
    </div>
  );
}
