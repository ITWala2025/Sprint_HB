import { AlertCircle, ChevronDown } from "lucide-react";

/**
 * Accessible labelled input used by every Student Portal auth form.
 *
 * Wiring handled here once, so no form can forget it:
 * - <label htmlFor> bound to the input id
 * - `aria-describedby` pointing at the hint and/or the error message
 * - `aria-invalid` only when there is an error
 * - the error itself rendered with `role="alert"` so screen readers announce it
 *
 * `trailing` renders inside the input's relative wrapper — that is how
 * PasswordInput places its show/hide toggle.
 *
 * Passing `options` (an array of `{ value, label }`) switches the control to a
 * `<select>` while keeping exactly the same label, hint, error and `aria-*`
 * wiring — the enrollment wizard uses it for its known-value questions. The
 * empty option uses `placeholder` as its label, and a chevron is rendered
 * automatically unless `trailing` supplies its own.
 *
 * `prefix` renders a static box attached to the left of a text input (the
 * enrollment wizard's `+91` country-code box): the box shares the field's
 * border colour, and the input's left corners flatten against it so the two read
 * as one control. The icon, trailing slot and every piece of wiring stay exactly
 * where they are without a prefix.
 */
export default function AuthField({
  id,
  label,
  name,
  type = "text",
  value = "",
  onChange,
  placeholder,
  autoComplete,
  error,
  hint,
  icon,
  showIcon = true,
  trailing,
  options,
  prefix,
  labelAction,
  required = false,
  disabled = false,
  inputMode,
  maxLength,
  autoFocus = false,
  describedByIds = [],
  inputRef,
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId, ...describedByIds].filter(Boolean).join(" ");

  const isSelect = Array.isArray(options) && options.length > 0;
  // A select paints its own chevron unless the caller supplies a trailing node.
  const trailingSlot =
    isSelect && !trailing ? (
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 grid w-11 place-items-center text-brand-text-muted"
      >
        <ChevronDown className="size-4" />
      </span>
    ) : (
      trailing
    );

  const fieldClasses = `sprint-focus h-12 w-full rounded-xl border bg-brand-white text-sm text-brand-text shadow-sm outline-none transition-colors placeholder:text-brand-text-muted focus:ring-4 disabled:cursor-not-allowed disabled:bg-brand-surface ${
    icon && showIcon ? "pl-11" : "pl-4"
  } ${trailingSlot ? "pr-12" : "pr-4"} ${
    error
      ? "border-brand-red focus:border-brand-red focus:ring-brand-red/15"
      : "border-brand-border focus:border-brand-red focus:ring-brand-red/10"
  }`;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="block text-sm font-semibold text-brand-navy">
          {label}
          {required ? (
            <span aria-hidden="true" className="ml-0.5 text-brand-red">
              *
            </span>
          ) : null}
        </label>
        {labelAction}
      </div>

      <div className="relative mt-2">
        {icon && showIcon && !prefix ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 grid w-11 place-items-center text-brand-text-muted"
          >
            {icon}
          </span>
        ) : null}

        {!isSelect && prefix ? (
          <div className="flex items-stretch">
            <span
              className={`flex h-12 shrink-0 items-center rounded-l-xl border border-r-0 bg-brand-surface px-3 text-sm font-semibold text-brand-text-secondary ${
                error ? "border-brand-red" : "border-brand-border"
              }`}
            >
              {prefix}
            </span>
            <div className="relative min-w-0 flex-1">
              {icon && showIcon ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 grid w-11 place-items-center text-brand-text-muted"
                >
                  {icon}
                </span>
              ) : null}
              <input
                id={id}
                ref={inputRef}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                inputMode={inputMode}
                maxLength={maxLength}
                autoFocus={autoFocus}
                disabled={disabled}
                required={required}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={describedBy || undefined}
                className={`${fieldClasses} rounded-l-none`}
              />
              {trailing}
            </div>
          </div>
        ) : isSelect ? (
          <select
            id={id}
            ref={inputRef}
            name={name}
            value={value}
            onChange={onChange}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            disabled={disabled}
            required={required}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={describedBy || undefined}
            className={`${fieldClasses} appearance-none`}
          >
            <option value="">{placeholder ?? "Select an option"}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            ref={inputRef}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
            inputMode={inputMode}
            maxLength={maxLength}
            autoFocus={autoFocus}
            disabled={disabled}
            required={required}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={describedBy || undefined}
            className={fieldClasses}
          />
        )}

        {/* A prefix field renders its own trailing slot inside the input row. */}
        {prefix && !isSelect ? null : trailingSlot}
      </div>

      {hint ? (
        <p id={hintId} className="mt-1.5 text-xs leading-relaxed text-brand-text-muted">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-brand-red"
        >
          <AlertCircle aria-hidden="true" className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
