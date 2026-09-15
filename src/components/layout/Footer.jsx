import Link from "next/link";
import {
  ArrowUpRight,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Youtube,
} from "lucide-react";

import siteConfig from "@/config/site.config.json";

/**
 * Global Footer — 5-column institutional footer.
 * Spec: docs/md/FOOTER_DOCUMENTATION.md + About_Page.md §3.10 (FTR-01 … FTR-06).
 */

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "All Courses", href: "/courses" },
  { label: "About Us & Faculty", href: "/about" },
  { label: "Updates & Workshops", href: "/updates" },
  { label: "Careers & Internships", href: "/careers" },
  { label: "Contact & Directions", href: "/contact" },
];

const portalLinks = [
  { label: "Student Login", href: "/student/login", outbound: true },
  { label: "New Enrollment", href: "/register" },
  { label: "Admin Dashboard", href: "/admin/login", outbound: true },
  { label: "Scholarship Aid", href: "/courses#scholarship" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Center Support", href: "/contact" },
];

const socialIcons = {
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-navy text-brand-off-white">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.4fr]">
        {/* Brand identity & mission (columns 1 & 2) */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <span className="relative inline-block size-10 shrink-0" aria-hidden="true">
              <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-red to-brand-purple" />
              <span className="absolute inset-[2px] grid place-items-center rounded-[10px] bg-brand-navy-dark">
                <span className="text-base font-black leading-none text-white">S</span>
              </span>
            </span>
            <span className="text-xl font-bold tracking-tight text-white">SPRINT</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-off-white/80">
            Hands-on, production-level education in cloud, AI and software systems —
            bridging the academic–industry gap with job-ready, execution-first training.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-brand-off-white/90">
            <ShieldCheck className="size-4 text-brand-red" aria-hidden="true" />
            Verified Institutional Education Model
          </p>
          <ul className="mt-6 flex items-center gap-3">
            {siteConfig.socials.map((social) => {
              const Icon = socialIcons[social.icon] ?? Linkedin;
              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="sprint-focus grid size-11 place-items-center rounded-full border border-white/15 text-brand-off-white/80 transition-colors hover:border-brand-red hover:text-brand-red"
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Explore */}
        <nav aria-label="Explore">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
            Explore
          </h2>
          <ul className="mt-5 space-y-3">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="sprint-focus text-sm text-brand-off-white/75 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Portals */}
        <nav aria-label="Portals">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
            Portals
          </h2>
          <ul className="mt-5 space-y-3">
            {portalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="sprint-focus inline-flex items-center gap-1.5 text-sm text-brand-off-white/75 transition-colors hover:text-white"
                >
                  {link.label}
                  {link.outbound && (
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Center coordinates & contact */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
            Visit & Contact
          </h2>
          <ul className="mt-5 space-y-4">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-brand-red" aria-hidden="true" />
              <span className="text-sm text-brand-off-white/75">{siteConfig.address}</span>
            </li>
            <li>
              <a
                href={siteConfig.contact.telHref}
                className="sprint-focus inline-flex items-center gap-3 text-sm text-brand-off-white/75 transition-colors hover:text-white"
              >
                <Phone className="size-5 shrink-0 text-brand-red" aria-hidden="true" />
                {siteConfig.contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={siteConfig.contact.emailHref}
                className="sprint-focus inline-flex items-center gap-3 text-sm text-brand-off-white/75 transition-colors hover:text-white"
              >
                <Mail className="size-5 shrink-0 text-brand-red" aria-hidden="true" />
                {siteConfig.contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Compliance bar (FTR-02) — dynamic year, falls back to static markup */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">
          <p className="text-sm text-brand-off-white/60">
            © {year} SPRINT Institutional Hub. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="sprint-focus text-sm text-brand-off-white/60 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}