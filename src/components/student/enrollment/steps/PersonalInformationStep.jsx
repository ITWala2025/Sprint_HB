import { CalendarDays, Globe, Mail, Map, Phone, User, UserRound } from "lucide-react";

import AuthField from "@/components/student/auth/AuthField";

import { DEFAULT_COUNTRY, COUNTRY_OPTIONS, getStatesForCountry } from "../enrollment-locations";
import { normalizeMobile } from "../enrollment-validation";

/**
 * Step 1 — Personal Information.
 *
 * Seven required fields in a two-column grid (single column below `md`):
 * First Name | Last Name, Email | Date of Birth, Country | State, then Phone
 * Number alone in the left column of the last row. Every field id is
 * `${idPrefix}-${fieldName}` (e.g. `personal-email`) because that is the
 * convention the wizard uses to move focus to the first invalid field after a
 * failed submit.
 *
 * Country defaults to India, so the State select starts enabled with the full
 * Indian list; picking a different country (including the empty placeholder)
 * replaces the State options and clears the previous answer, because a state
 * chosen under the old country no longer exists in the new list. The phone box
 * keeps the `+91` prefix and holds digits only — the handler normalises typed
 * or pasted input (`+91 98765 43210` → `9876543210`) and caps it at ten digits
 * so `validateMobileField` always sees the raw number.
 *
 * Fields are controlled by the wizard, so re-visiting this step always shows
 * what was typed before.
 */
export default function PersonalInformationStep({ idPrefix, values = {}, errors = {}, onChange }) {
  const country = values.country ?? DEFAULT_COUNTRY;
  const stateOptions = getStatesForCountry(country);

  // Changing country invalidates the previous state answer, so both writes go
  // through the wizard's shared updater in one handler.
  const handleCountryChange = (event) => {
    onChange("country")(event);
    onChange("state")({ target: { value: "" } });
  };

  const handlePhoneChange = (event) => {
    onChange("phone")({ target: { value: normalizeMobile(event.target.value).slice(0, 10) } });
  };

  return (
    <div className="space-y-5">
      <p className="text-xs font-medium text-brand-text-muted">
        All seven fields are required — they open your student file.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <AuthField
          id={`${idPrefix}-firstName`}
          name="firstName"
          label="First Name"
          value={values.firstName ?? ""}
          onChange={onChange("firstName")}
          error={errors.firstName}
          placeholder="Ananya"
          autoComplete="given-name"
          icon={<User aria-hidden="true" className="size-4.5" />}
          hint="Spell it exactly as it should appear on your certificate."
          required
        />

        <AuthField
          id={`${idPrefix}-lastName`}
          name="lastName"
          label="Last Name"
          value={values.lastName ?? ""}
          onChange={onChange("lastName")}
          error={errors.lastName}
          placeholder="Sharma"
          autoComplete="family-name"
          icon={<UserRound aria-hidden="true" className="size-4.5" />}
          required
        />

        <AuthField
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          label="Email Address"
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
          id={`${idPrefix}-dob`}
          name="dob"
          type="date"
          label="Date of Birth"
          value={values.dob ?? ""}
          onChange={onChange("dob")}
          error={errors.dob}
          autoComplete="bday"
          icon={<CalendarDays aria-hidden="true" className="size-4.5" />}
          showIcon={false}
          required
        />

        <AuthField
          id={`${idPrefix}-country`}
          name="country"
          label="Country"
          value={country}
          onChange={handleCountryChange}
          error={errors.country}
          placeholder="Select a country"
          autoComplete="country-name"
          options={COUNTRY_OPTIONS}
          icon={<Globe aria-hidden="true" className="size-4.5" />}
          required
        />

        <AuthField
          id={`${idPrefix}-state`}
          name="state"
          label="State"
          value={values.state ?? ""}
          onChange={onChange("state")}
          error={errors.state}
          placeholder={country ? "Select a state" : "Select a country first"}
          autoComplete="address-level1"
          options={stateOptions}
          icon={<Map aria-hidden="true" className="size-4.5" />}
          disabled={!country}
          hint={
            country
              ? "The list matches the country selected next to it."
              : "Choose a Country above to unlock the State list."
          }
          required
        />

        <AuthField
          id={`${idPrefix}-phone`}
          name="phone"
          type="tel"
          label="Phone Number"
          value={values.phone ?? ""}
          onChange={handlePhoneChange}
          error={errors.phone}
          placeholder="9876543210"
          autoComplete="tel"
          inputMode="tel"
          prefix="+91"
          icon={<Phone aria-hidden="true" className="size-4.5" />}
          hint="Class reminders and mentor calls are made to this number."
          required
        />
      </div>
    </div>
  );
}
