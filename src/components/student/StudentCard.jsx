/**
 * Shared card shell for the Student Portal.
 *
 * Mirrors the public site's card language (see Home/About/Careers):
 * `rounded-3xl`, `border-brand-border`, white surface, soft shadow,
 * `font-display` heading and the red-light icon tile.
 */
export default function StudentCard({
  title,
  description,
  icon: Icon,
  badge,
  action,
  children,
  className = "",
  bodyClassName = "",
  as: Tag = "section",
  ...rest
}) {
  const hasHeader = Boolean(title || action);

  return (
    <Tag
      className={`flex flex-col rounded-3xl border border-brand-border bg-brand-white p-5 shadow-sm sm:p-6 ${className}`}
      {...rest}
    >
      {hasHeader ? (
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title ? (
              <h2 className="flex items-center gap-2.5 font-display text-base font-bold text-brand-navy">
                {Icon ? (
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-red-light text-brand-red">
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                ) : null}
                <span className="min-w-0 truncate">{title}</span>
                {badge ? (
                  <span className="shrink-0 rounded-full bg-brand-red px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                    {badge}
                  </span>
                ) : null}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1.5 text-xs leading-relaxed text-brand-text-muted">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}

      <div className={`${hasHeader ? "mt-4 " : ""}flex flex-1 flex-col ${bodyClassName}`}>
        {children}
      </div>
    </Tag>
  );
}
