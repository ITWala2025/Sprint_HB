import LegalLayout from "@/components/legal/LegalLayout";

export const metadata = {
  title: { absolute: "Terms & Conditions | SPRINT" },
  description: "Terms and Conditions for the SPRINT educational technology website.",
};

const sections = [
  {
    id: "introduction",
    title: "Introduction",
    content: (
      <p>
        These sample Terms & Conditions describe the intended use of SPRINT, an educational and technology training demo website. They are written to show how a professional learning platform might organize its terms and are not a binding legal agreement for a real service.
      </p>
    ),
  },
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    content: (
      <p>
        By browsing this demo, you acknowledge that you have read this sample text. In a production service, continued use of the website after an updated version becomes available may constitute acceptance where permitted by law.
      </p>
    ),
  },
  {
    id: "educational-purpose",
    title: "Educational Purpose",
    content: (
      <p>
        SPRINT is presented as a training hub for hands-on learning in areas such as AI/ML, Cloud, DevOps, and software systems. Course descriptions, schedules, faculty profiles, outcomes, and calls to action shown in a demo may be illustrative and may not represent a currently available offering.
      </p>
    ),
  },
  {
    id: "use-of-website",
    title: "Use of the Website",
    content: (
      <p>
        You may use the website for personal, informational, and educational exploration. You must not interfere with its operation, attempt unauthorized access, introduce malicious code, scrape content in a harmful manner, or use the website for unlawful activity.
      </p>
    ),
  },
  {
    id: "user-responsibilities",
    title: "User Responsibilities",
    content: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Provide accurate information if you choose to interact with a sample form.</li>
        <li>Keep any real account credentials private and use only accounts you are authorized to access.</li>
        <li>Evaluate educational material appropriately before relying on it for academic or professional decisions.</li>
      </ul>
    ),
  },
  {
    id: "courses-content",
    title: "Courses and Educational Content",
    content: (
      <p>
        Educational content is provided for general learning and may contain errors, omissions, or outdated examples. Course availability, dates, instructors, pricing, certificates, and outcomes may change without notice in a real implementation. No enrollment, admission, employment, or certification result is guaranteed by this demo.
      </p>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    content: (
      <p>
        Unless otherwise stated, the SPRINT name, page structure, original text, visual design, and educational materials shown here are presented as project content. You may view the site for personal reference, but you should not copy, republish, modify, or commercially exploit protected content without permission.
      </p>
    ),
  },
  {
    id: "user-submitted-information",
    title: "User-Submitted Information",
    content: (
      <p>
        If a sample feature accepts a message, you are responsible for having the right to submit it and for excluding confidential or sensitive information. A production service might use submitted information to answer an enquiry or improve its programs; this demo does not promise that submissions are stored, reviewed, or answered.
      </p>
    ),
  },
  {
    id: "third-party-links",
    title: "Third-Party Links and Services",
    content: (
      <p>
        The website may link to external websites, social networks, videos, or learning tools. External services operate independently and may have their own terms, privacy practices, availability, and content. SPRINT is not responsible for information or services provided by a third party.
      </p>
    ),
  },
  {
    id: "website-availability",
    title: "Website Availability",
    content: (
      <p>
        We may update, pause, remove, or restrict parts of the demo at any time. A production website would also depend on hosting, networks, browsers, and third-party services, so uninterrupted availability could not be promised.
      </p>
    ),
  },
  {
    id: "disclaimer",
    title: "Disclaimer",
    content: (
      <p>
        This educational/demo website and its content are provided for illustration on an "as is" and "as available" basis. Nothing on the site is legal, financial, academic, employment, or professional advice, and no real institutional accreditation or service commitment should be inferred.
      </p>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of Liability",
    content: (
      <p>
        To the maximum extent permitted by applicable law, a demo project and its contributors would not be responsible for loss arising from reliance on sample content, inability to access the site, third-party services, or information submitted to an illustrative form. This paragraph is sample drafting only and does not replace legal advice.
      </p>
    ),
  },
  {
    id: "changes-to-terms",
    title: "Changes to Terms",
    content: (
      <p>
        These sample terms may be updated as the project evolves. The updated date shown above is a demonstration marker. A live service would communicate material changes using methods appropriate to its users and applicable requirements.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "Governing Law",
    content: (
      <p>
        <strong>Dummy/sample information:</strong> For this demonstration only, disputes are imagined to be governed by the laws of the fictional state of Example State, with courts in Example City having exclusive jurisdiction. This provision is not intended to identify a real governing law or venue.
      </p>
    ),
  },
  {
    id: "contact-us",
    title: "Contact Us",
    content: (
      <p>
        Questions about these sample Terms & Conditions may be sent to SPRINT at <a className="font-semibold text-brand-red hover:underline" href="mailto:privacy@example.com">privacy@example.com</a>. This is dummy contact information for educational use.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalLayout
      eyebrow="Legal & terms"
      title="Terms & Conditions"
      description="Sample terms for using the SPRINT educational technology website and exploring its illustrative courses and resources."
      effectiveDate="January 1, 2026"
      updatedDate="September 17, 2026"
      sections={sections}
      notice={
        <p>
          These are dummy/sample terms for an educational website project. They are not legal advice and do not create a real service agreement.
        </p>
      }
    />
  );
}