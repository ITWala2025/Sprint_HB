import { Linkedin, ShieldCheck } from "lucide-react";

/**
 * Shared profile card for Leadership (§3.5) and Faculty (§3.6).
 * - Verified badge (AB-18), hover lift (LDR-03), initials avatar placeholder
 *   that can be swapped for a real photo via `profile.image`.
 * - Expected fields: name, designation, bio, verified, tags[], socials[].
 */
export default function ProfileCard({ profile, showTags = false }) {
  const initials = profile.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <article className="sprint-card-interactive flex h-full flex-col rounded-3xl border border-brand-border bg-white p-6 shadow-sm hover:shadow-[0_16px_32px_-12px_rgba(1,31,62,0.22)]">
      <div className="flex items-start justify-between gap-3">
        {/* Photo / initials avatar — reserved aspect box prevents CLS (LDR-05) */}
        {profile.image ? (
          <img
            src={profile.image}
            alt={`${profile.name} — ${profile.designation}`}
            width={80}
            height={80}
            loading="lazy"
            className="size-20 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-navy to-brand-blue text-2xl font-bold text-white"
          >
            {initials || "SP"}
          </span>
        )}

        {profile.verified && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue-light px-3 py-1.5 text-xs font-semibold text-brand-blue">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Verified
          </span>
        )}
      </div>

      <h4 className="mt-5 text-lg font-bold leading-tight text-brand-navy">
        {profile.name}
      </h4>
      <p className="mt-1 text-sm font-medium text-brand-red">{profile.designation}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-text-secondary">
        {profile.bio}
      </p>

      {showTags && profile.tags?.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Expertise">
          {profile.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-brand-surface px-3 py-1 text-xs font-medium text-brand-text"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      {profile.socials?.length > 0 && (
        <ul className="mt-4 flex items-center gap-2">
          {profile.socials.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${profile.name} on ${social.label}`}
                className="sprint-focus grid size-10 place-items-center rounded-full text-brand-text-muted transition-colors hover:bg-brand-surface hover:text-brand-navy"
              >
                <Linkedin className="size-5" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}