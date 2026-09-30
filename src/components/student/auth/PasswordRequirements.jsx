import { CheckCircle2, Circle } from "lucide-react";

import { getPasswordRuleState } from "./auth-validation";

/**
 * Live password rule checklist shown under the "new password" field on the
 * reset screen. Rules come from `auth-validation.js`, so the hint text and the
 * actual validation can never drift apart.
 *
 * Each rule renders a word ("met" / "not met yet") for screen readers instead of
 * relying on the icon colour alone — colour is never the only signal.
 */
export default function PasswordRequirements({ id, password = "", title = "Your password must include:" }) {
  const rules = getPasswordRuleState(password);

  return (
    <div id={id} className="mt-3 rounded-xl border border-brand-border bg-brand-off-white p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-text-muted">
        {title}
      </p>
      <ul className="mt-2.5 grid gap-2 sm:grid-cols-2">
        {rules.map((rule) => (
          <li
            key={rule.id}
            className={`flex items-center gap-2 text-xs leading-snug ${
              rule.met ? "font-medium text-brand-navy" : "text-brand-text-muted"
            }`}
          >
            {rule.met ? (
              <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-brand-success" />
            ) : (
              <Circle aria-hidden="true" className="size-4 shrink-0" />
            )}
            <span>{rule.label}</span>
            <span className="sr-only">{rule.met ? " — met" : " — not met yet"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
