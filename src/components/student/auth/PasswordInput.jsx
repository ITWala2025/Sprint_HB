"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

import AuthField from "./AuthField";

/**
 * Password field with an icon-only show/hide toggle.
 *
 * Every prop other than the toggle-specific ones is forwarded to AuthField, so
 * labelling, hint and error wiring stay in one place. The toggle is a real
 * button (`type="button"` so it never submits the form) with a dynamic
 * `aria-label`, and its state is local — the value itself still lives in the
 * parent form.
 */
export default function PasswordInput({
  label = "Password",
  icon = <Lock aria-hidden="true" className="size-4.5" />,
  showToggle = true,
  toggleAriaLabel,
  ...fieldProps
}) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleLabel =
    toggleAriaLabel ?? `${isVisible ? "Hide" : "Show"} ${label}`;

  const trailing = showToggle ? (
    <button
      type="button"
      onClick={() => setIsVisible((current) => !current)}
      aria-label={toggleLabel}
      aria-controls={fieldProps.id}
      title={toggleLabel}
      className="sprint-focus absolute inset-y-1 right-1 grid w-10 place-items-center rounded-lg text-brand-text-muted transition-colors hover:text-brand-navy"
    >
      {isVisible ? (
        <EyeOff aria-hidden="true" className="size-4.5" />
      ) : (
        <Eye aria-hidden="true" className="size-4.5" />
      )}
    </button>
  ) : null;

  return (
    <AuthField
      {...fieldProps}
      label={label}
      icon={icon}
      trailing={trailing}
      type={isVisible ? "text" : "password"}
    />
  );
}
