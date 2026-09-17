"use client";

import {
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
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
  {
    id: "whatsapp",
    icon: MessageCircle,
    title: "WhatsApp",
    value: "Chat with our team",
    description: "Quick assistance for your enquiry",
    href: "https://wa.me/918521283183",
    action: "Chat on WhatsApp",
  },
  {
    id: "visit",
    icon: MapPin,
    title: "Visit Us",
    value: "SPRINT, Hazaribagh, Jharkhand",
    description: "India – 825301",
    href: "https://www.google.com/maps/search/?api=1&query=SPRINT%20School%20of%20Professional%20Studies%20%26%20Information%20Technology%2C%20Hazaribagh%2C%20Jharkhand%2C%20India",
    action: "Get Directions",
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
                  target={
                    id === "whatsapp" || id === "visit"
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    id === "whatsapp" || id === "visit"
                      ? "noopener noreferrer"
                      : undefined
                  }
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