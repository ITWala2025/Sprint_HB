import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";

const CTA_POINTS = [
  {
    icon: MessageCircle,
    text: "Quick & Easy Enquiry",
  },
  {
    icon: PhoneCall,
    text: "Talk to Our Team",
  },
  {
    icon: ShieldCheck,
    text: "Professional Guidance",
  },
];

export default function FinalCTA() {
  return (
    <section
      className="final-cta"
      aria-labelledby="final-cta-title"
    >
      <div className="final-cta__container">

        <div className="final-cta__content">

          <p className="final-cta__eyebrow">
            <span aria-hidden="true">—</span>
            LET&apos;S CONNECT
            <span aria-hidden="true">—</span>
          </p>

          <h2 id="final-cta-title">
            Ready to Take the{" "}
            <span>Next Step?</span>
          </h2>

          <p className="final-cta__description">
            Whether you are a student, working professional,
            institute or company, our team is here to understand
            your requirements and help you move forward.
          </p>

          <div
            className="final-cta__points"
            aria-label="Why contact SPRINT"
          >
            {CTA_POINTS.map(({ icon: Icon, text }) => (
              <div
                className="final-cta__point"
                key={text}
              >
                <span className="final-cta__point-icon">
                  <Icon aria-hidden="true" />
                </span>

                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className="final-cta__actions">

            <Link
              href="#enquiry"
              className="final-cta__button final-cta__button--primary"
            >
              Start an Enquiry
              <ArrowRight aria-hidden="true" />
            </Link>

            <Link
              href="#location"
              className="final-cta__button final-cta__button--secondary"
            >
              Visit Our Office
            </Link>

          </div>

        </div>

      </div>
    </section>
  );
}