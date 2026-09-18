"use client";

import {
  Clock3,
  Mail,
  Phone,
} from "lucide-react";

const contactMethods = [
  {
    id: "call",
    icon: Phone,
    title: "Call Us",
    value: "+91 85212 83183",
    description: "Mon – Sat, 9:00 AM – 6:00 PM",
    href: "tel:+918521283183",
    action: "Call Now",
  },
  {
    id: "email",
    icon: Mail,
    title: "Email Us",
    value: "info@sprintedu.in",
    description: "We reply within 24 hours",
    href: "mailto:info@sprintedu.in",
    action: "Send Email",
  },
];

export default function ContactMethods() {
  return (
    <section
      className="contact-methods"
      aria-labelledby="contact-methods-title"
    >
      <div className="contact-methods__intro">
        <p className="contact-methods__eyebrow">
          <span aria-hidden="true">›</span> REACH US
        </p>

        <h2 id="contact-methods-title">
          We&apos;re Here to Help
        </h2>

        <p className="contact-methods__description">
          Have a question or need guidance? Reach out to the SPRINT team
          and we&apos;ll help you take the next step.
        </p>
      </div>

      <div className="contact-methods__list">
        {contactMethods.map(
          ({
            id,
            icon: Icon,
            title,
            value,
            description,
            href,
            action,
          }) => (
            <article className="contact-method" key={id}>
              <div className="contact-method__icon">
                <Icon aria-hidden="true" />
              </div>

              <div className="contact-method__content">
                <h3>{title}</h3>

                <p className="contact-method__value">
                  {value}
                </p>

                <p className="contact-method__description">
                  {description}
                </p>

                <a
                  href={href}
                  className="contact-method__action"
                >
                  {action}
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          )
        )}
      </div>

      <div className="contact-methods__hours">
        <div className="contact-methods__hours-icon">
          <Clock3 aria-hidden="true" />
        </div>

        <div>
          <h3>Office Hours</h3>
          <p>Monday – Saturday, 9:00 AM – 6:00 PM</p>
          <p>Sunday: Closed</p>
        </div>
      </div>
    </section>
  );
}