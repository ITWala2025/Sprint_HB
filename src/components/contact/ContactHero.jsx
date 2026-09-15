"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const trustPoints = [
  { icon: MessageCircle, label: "Quick Response" },
  { icon: UsersRound, label: "Expert Guidance" },
  { icon: ShieldCheck, label: "Trusted by Thousands" },
];

export default function ContactHero() {
  return (
    <main className="contact-hero" aria-labelledby="contact-hero-title">
      <picture className="contact-hero__media" aria-hidden="true">
        <source
          media="(max-width: 767px)"
          srcSet="/images/contact/contact-hero-mobile.webp"
        />
        <Image
          src="/images/contact/contact-hero-desktop.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="contact-hero__image"
        />
      </picture>

      <div className="contact-hero__overlay" aria-hidden="true" />

      <div className="contact-hero__content">
        <nav className="contact-hero__breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">Contact Us</span>
        </nav>

        <div className="contact-hero__copy">
          <p className="contact-hero__eyebrow">
            <span aria-hidden="true">›</span> CONTACT US
          </p>

          <h1 id="contact-hero-title">
            Let&apos;s Build Your{" "}
            <span>Future</span> Together
          </h1>

          <p className="contact-hero__description">
            Have questions about our programs, admissions or anything else?
            We&apos;re here to help.
          </p>

          <div
            className="contact-hero__trust"
            aria-label="Reasons to connect with SPRINT"
          >
            {trustPoints.map(({ icon: Icon, label }) => (
              <div className="contact-hero__trust-item" key={label}>
                <span className="contact-hero__trust-icon">
                  <Icon aria-hidden="true" />
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <Link className="contact-hero__cta" href="#enquiry">
            Start an Enquiry
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}
