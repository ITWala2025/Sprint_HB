import LegalLayout from "@/components/legal/LegalLayout";

export const metadata = {
  title: { absolute: "Privacy Policy | SPRINT" },
  description: "Privacy Policy for the SPRINT educational technology website.",
};

const sections = [
  {
    id: "introduction",
    title: "Introduction",
    content: (
      <>
        <p>
          This sample Privacy Policy explains how SPRINT, an educational and technology training demo website, may handle information in a typical learning experience. SPRINT is presented here as an institutional training hub for students, graduates, and working professionals.
        </p>
        <p>
          This page is fictional demonstration content for a website project. It is not legal advice and does not describe a verified production data practice.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    content: (
      <p>
        Depending on the features enabled in a particular demonstration, the website may present fields or interactions that represent information collection. The examples below describe sample categories only and should not be read as confirmation that SPRINT currently collects them.
      </p>
    ),
  },
  {
    id: "information-you-provide",
    title: "Information You Provide",
    content: (
      <>
        <p>Sample forms may invite you to enter details such as:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Name and contact details, such as an email address.</li>
          <li>Course interests, learning goals, or preferred contact channel.</li>
          <li>Messages submitted through an enquiry or feedback form.</li>
        </ul>
      </>
    ),
  },
  {
    id: "automatically-collected-information",
    title: "Automatically Collected Information",
    content: (
      <p>
        A production website may receive basic technical information such as browser type, device category, approximate region, referring page, and pages viewed. This demo does not claim to collect or store those details; they are listed only to make the sample policy realistic.
      </p>
    ),
  },
  {
    id: "how-we-use-information",
    title: "How We Use Information",
    content: (
      <>
        <p>If sample information is submitted, it could be used to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Respond to an enquiry or request for course information.</li>
          <li>Demonstrate enrolment, communication, or course preference workflows.</li>
          <li>Improve the structure, accessibility, and educational content of the website.</li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and Similar Technologies",
    content: (
      <p>
        Demonstration environments may use local storage, cookies, or similar browser technologies to remember preferences or support a sample sign-in flow. No particular cookie or tracking implementation is promised by this demo. Your browser settings can usually limit or remove these technologies.
      </p>
    ),
  },
  {
    id: "how-we-share-information",
    title: "How We Share Information",
    content: (
      <p>
        SPRINT would not intentionally sell personal information in this educational example. If a future demonstration connects to service providers, information would be shared only as needed to operate that feature, respond to requests, maintain security, or meet a legal obligation. This page does not claim that such sharing currently occurs.
      </p>
    ),
  },
  {
    id: "data-security",
    title: "Data Security",
    content: (
      <p>
        Reasonable technical and organizational safeguards are a common expectation for a production learning platform. Because this is sample content, SPRINT makes no claim that a live database, account system, or security program is connected to this website.
      </p>
    ),
  },
  {
    id: "data-retention",
    title: "Data Retention",
    content: (
      <p>
        If a production version received information, it would generally retain it only for as long as needed for the stated educational, support, operational, or legal purpose. Demo submissions should not be assumed to be stored or retained unless the relevant feature says so.
      </p>
    ),
  },
  {
    id: "third-party-services",
    title: "Third-Party Services",
    content: (
      <p>
        The site may display links to hosting, video, analytics, communication, or social platforms in a fuller implementation. Those services may process information under their own policies. Review a third party's terms before using an external service. This demo does not represent an endorsement or confirm an active integration.
      </p>
    ),
  },
  {
    id: "childrens-privacy",
    title: "Children's Privacy",
    content: (
      <p>
        SPRINT is designed as a general educational technology demo and is not knowingly directed at children under 13. A real program serving minors would establish age-appropriate notices, consent practices, and safeguards before collecting information from them.
      </p>
    ),
  },
  {
    id: "your-privacy-rights",
    title: "Your Privacy Rights",
    content: (
      <p>
        Depending on where you live, you may have rights to ask about, access, correct, delete, or limit the use of personal information. To ask a question about this sample policy, contact <a className="font-semibold text-brand-red hover:underline" href="mailto:privacy@example.com">privacy@example.com</a>. This sample address is not a promise that a live privacy request process exists.
      </p>
    ),
  },
  {
    id: "educational-demo-disclaimer",
    title: "Educational/Demo Disclaimer",
    content: (
      <p>
        For demonstration purposes, this website may include forms or features that simulate the collection of information such as name, email address, or course preferences. Do not submit sensitive, confidential, or real personal information to a demo form.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to This Privacy Policy",
    content: (
      <p>
        Sample policy text may be revised as the educational project changes. The date at the top of this page indicates the intended revision marker for this demonstration. A production operator would provide additional notice where required.
      </p>
    ),
  },
  {
    id: "contact-us",
    title: "Contact Us",
    content: (
      <p>
        Questions about this sample Privacy Policy may be directed to SPRINT at <a className="font-semibold text-brand-red hover:underline" href="mailto:privacy@example.com">privacy@example.com</a>. This is dummy contact information for educational use.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Legal & privacy"
      title="Privacy Policy"
      description="A clear sample policy for the SPRINT educational technology website. Read how a typical learning platform might describe information practices."
      effectiveDate="January 1, 2026"
      updatedDate="September 17, 2026"
      sections={sections}
      notice={
        <p>
          This is sample content for an educational/demo website, not a legal notice or a statement of actual SPRINT data practices.
        </p>
      }
    />
  );
}