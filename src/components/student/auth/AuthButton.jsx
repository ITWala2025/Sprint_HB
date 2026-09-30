import { Loader2 } from "lucide-react";

/**
 * The single button used across the auth screens and the enrollment wizard.
 *
 * `variant="primary"` is the red submit CTA, `variant="secondary"` the outlined
 * navy action (used by "Resend Email" and the wizard's Back) and
 * `variant="ghost"` the quietest tertiary action (the wizard's "Skip for now"),
 * which trades the border for a soft surface on hover. While `loading` is set the
 * button disables itself and announces `aria-busy`, which is what every form
 * relies on to prevent double submits during the mock network delay.
 */
const VARIANT_CLASSES = {
  primary:
    "bg-brand-red text-white shadow-brand-cta hover:bg-brand-red-dark disabled:bg-brand-red/70 disabled:shadow-none",
  secondary:
    "border border-brand-border bg-brand-white text-brand-navy shadow-sm hover:bg-brand-off-white disabled:opacity-60",
  ghost: "bg-transparent text-brand-navy hover:bg-brand-surface disabled:opacity-50",
};

export default function AuthButton({
  children,
  variant = "primary",
  type = "submit",
  loading = false,
  loadingLabel = "Please wait…",
  icon,
  className = "",
  disabled = false,
  ...rest
}) {
  return (
    <button
      type={type}
      {...rest}
      disabled={loading || disabled}
      aria-busy={loading ? "true" : undefined}
      className={`sprint-focus inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary
      } ${className}`}
    >
      {loading ? (
        <>
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
          {children}
          {icon}
        </>
      )}
    </button>
  );
}
