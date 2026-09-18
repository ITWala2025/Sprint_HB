import Image from "next/image";
import {
  Building2,
  MapPin,
  Navigation,
  Mail,
} from "lucide-react";

const GOOGLE_MAPS_URL =
  "https://maps.app.goo.gl/AYdTXi8gNagSVJss7?g_st=aw";

export default function LocationSection() {
  return (
    <section
      className="location-section"
      id="location"
      aria-labelledby="location-title"
    >
      <div className="location-section__container">

        {/* =========================
            SECTION HEADER
            ========================= */}
        <div className="location-section__header">
          <p className="location-section__eyebrow">
            <span aria-hidden="true">—</span>
            FIND US HERE
            <span aria-hidden="true">—</span>
          </p>

          <h2 id="location-title">
            Visit Our <span>Office</span>
          </h2>

          <p>
            Visit our campus for a guided tour, counselling session
            or any other assistance. We would be happy to welcome you
            to SPRINT.
          </p>
        </div>

        {/* =========================
            LOCATION CONTENT
            ========================= */}
        <div className="location-section__grid">

          {/* =========================
              LOCATION INFORMATION
              ========================= */}
          <article className="location-info-card">

            <div className="location-info-card__top">
              <div className="location-info-card__icon">
                <MapPin aria-hidden="true" />
              </div>

              <div>
                <p className="location-info-card__label">
                  OUR LOCATION
                </p>

                <h3>SPRINT</h3>
              </div>
            </div>

            <p className="location-info-card__institution">
              School of Professional Studies &amp;
              Information Technology
            </p>

            <div className="location-address">
              <MapPin aria-hidden="true" />

              <div>
                <span>Address</span>

                <p>
                  1st Floor, Plot No.- 283,
                  <br />
                  In front of Dhobiya Talab,
                  <br />
                  Ompuri, Matwari,
                  <br />
                  Hazaribagh, Jharkhand
                </p>
              </div>
            </div>

            <div className="location-info-card__divider" />

            <div className="location-info-card__note">
              <Building2 aria-hidden="true" />

              <p>
                Meet our team, explore our programs and
                experience the SPRINT learning environment.
              </p>
            </div>

            <div className="location-info-card__actions">

              {/* GET DIRECTIONS */}
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="location-button location-button--primary"
              >
                <Navigation aria-hidden="true" />

                <span className="location-button__text">
                  Get Directions
                </span>

                <span aria-hidden="true">
                  →
                </span>
              </a>

              {/* CONTACT TEAM */}
              <a
                href="#enquiry"
                className="location-button location-button--secondary"
              >
                <Mail aria-hidden="true" />

                <span className="location-button__text">
                  Contact Our Team
                </span>
              </a>

            </div>
          </article>

          {/* =========================
              OFFICE IMAGE
              ========================= */}
          <article className="location-image-card">

            <div className="location-image">

              <Image
                src="/images/contact/sprint-office.webp"
                alt="SPRINT School of Professional Studies and Information Technology office in Hazaribagh"
                fill
                priority={false}
                sizes="(max-width: 767px) 100vw, (max-width: 1100px) 50vw, 42vw"
                className="location-image__img"
              />

            </div>

            {/* IMAGE BADGE */}
            <div className="location-image__overlay">

              <div className="location-image__badge">
                <Building2 aria-hidden="true" />

                <div>
                  <strong>SPRINT Campus</strong>
                  <span>Hazaribagh, Jharkhand</span>
                </div>
              </div>

            </div>

          </article>

          {/* =========================
              GOOGLE MAP
              ========================= */}
          <article className="location-map-card">

            <div className="location-map">

              <iframe
                title="SPRINT office location on Google Maps"
                src="https://www.google.com/maps?q=23.989364,85.376275&z=17&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="location-map__iframe"
              />

              {/* MAP BADGE */}
              <div className="location-map__badge">

                <MapPin aria-hidden="true" />

                <div>
                  <strong>SPRINT Office</strong>
                  <span>Hazaribagh, Jharkhand</span>
                </div>

              </div>

              {/* OPEN GOOGLE MAPS */}
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="location-map__link"
              >
                <span>
                  Open in Google Maps
                </span>

                <span aria-hidden="true">
                  →
                </span>
              </a>

            </div>
          </article>

        </div>

      </div>
    </section>
  );
}