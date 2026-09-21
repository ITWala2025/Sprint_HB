import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { FcElectronics, FcSettings, FcSimCard } from "react-icons/fc";
import { BiLogoLinkedin } from "react-icons/bi";
import { SiInstagram, SiYoutube } from "react-icons/si";

import siteConfig from "@/config/site.config.json";

/**
 * Global Footer — 5-column institutional footer.
 * Spec: docs/md/FOOTER_DOCUMENTATION.md + About_Page.md §3.10 (FTR-01 … FTR-06).
 */

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "All Courses", href: "/courses" },
  { label: "About Us & Faculty", href: "/about" },
  { label: "Careers & Internships", href: "/careers" },
  { label: "Contact & Directions", href: "/contact" },
];

const portalLinks = [
  { label: "Student Login", href: "/student/login", outbound: true },
  { label: "New Enrollment", href: "/register" },
  { label: "Scholarship Aid", href: "/courses#scholarship" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

const socialIcons = {
  linkedin: { component: BiLogoLinkedin, color: "#0a66c2" },
  instagram: { component: SiInstagram, color: "#e4405f" },
  youtube: { component: SiYoutube, color: "#ff0000" },
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="sprint-footer text-brand-off-white"
      style={{
        backgroundImage: "url('/images/header&footer/footer_background_img.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#011f3e",
      }}
    >
      <div className="mx-auto grid grid-cols-2 gap-x-10 gap-y-8 px-4 py-12 sm:gap-10 sm:px-6 sm:py-16 lg:max-w-300 lg:grid-cols-[2fr_1fr_1fr_1.4fr]">
        {/* Brand identity & mission (columns 1 & 2) */}
        <div className="col-span-2 lg:col-span-1">
          <div className="flex items-center gap-4">
            <Image
              src="/images/header&footer/sprintlogo1.jpeg"
              alt="Sprint Institutional Hub logo"
              width={96}
              height={96}
              className="size-20 shrink-0 rounded-full bg-white p-2 object-contain sm:size-24"
              priority
            />
            <div className="flex flex-col gap-0.5">
              <span
                className="text-2xl font-black uppercase tracking-[0.3em] text-white"
                style={{ fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif", letterSpacing: "0.35em" }}
              >
                SPRINT
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-brand-off-white/50 font-medium">
                Institutional Hub
              </span>
              <div className="mt-1 h-0.5 w-10 rounded-full bg-brand-red" />
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-off-white/80">
           Hands-on, production-level education in Cloud, AI, and Software Systems —
           bridging the academic industry gap with job-ready, execution-first training.

          </p>
          {/*
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-brand-off-white/90">
            <FcSettings className="size-4" aria-hidden="true" />
            Verified Institutional Education Model
          </p>
          */}
          <ul className="mt-6 flex flex-wrap items-center gap-3">
            {siteConfig.socials.map((social) => {
              const socialIcon = socialIcons[social.icon] ?? {
                component: Linkedin,
                color: "currentColor",
              };
              const Icon = socialIcon.component;
              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="sprint-focus  grid size-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white text-brand-off-white/80 transition-colors hover:border-brand-blue hover:text-brand-blue"
                  >
                    <Icon
                      className="size-8"
                      color={socialIcon.color}
                      aria-hidden="true"
                
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Explore */}
        <nav aria-label="Explore">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white">
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
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white">
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
        <div className="col-span-2 lg:col-span-1">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white">
            Visit & Contact
          </h2>
          <ul className="mt-5 space-y-4">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-brand-red" aria-hidden="true" />
              <span className="min-w-0 wrap-break-word text-sm text-brand-off-white/75">{siteConfig.address}</span>
            </li>
            <li>
              <a
                href={siteConfig.contact.telHref}
                className="sprint-focus min-w-0 inline-flex items-center gap-3 text-sm text-brand-off-white/75 transition-colors hover:text-white"
              >
                <Phone className="size-5 shrink-0 text-brand-red" aria-hidden="true" />
                <span className="wrap-break-word">{siteConfig.contact.phoneDisplay}</span>
              </a>
            </li>
            <li>
              <a
                href={siteConfig.contact.emailHref}
                className="sprint-focus min-w-0 inline-flex items-center gap-3 text-sm text-brand-off-white/75 transition-colors hover:text-white"
              >
                <Mail className="size-5 shrink-0 text-brand-red" aria-hidden="true" />
                <span className="break-all">{siteConfig.contact.email}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Compliance bar (FTR-02) — dynamic year, falls back to static markup */}
      <div className="border-t border-white/10    ">
        <div className="mx-auto flex max-w-300 flex-col items-center justify-between gap-4 px-4 py-5 text-center sm:px-6 sm:py-6 md:flex-row md:text-left ">
          <p className="text-xs leading-relaxed text-brand-off-white/60 sm:text-sm">
            © {year} SPRINT. All rights reserved
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-6">
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
