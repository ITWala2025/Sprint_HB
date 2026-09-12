# SPRINT — Contact Us Page
## Final Page Requirement & Web Design Specification

> **Scope:** Contact Us page only.  
> **Source of truth:** SPRINT Website Master Requirements V2 + final Contact Us Form content.  
> **Note:** Phone, email, address, timings, WhatsApp number, map coordinates and approved imagery are intentionally not invented and must be replaced with verified SPRINT data before launch.

---

## 1. Page Objective

The Contact Us page should provide a clear path for visitors to contact SPRINT, submit a qualified enquiry, understand the available programs/courses, and locate the SPRINT office.

The page should prioritize:
- Contact information
- Smart enquiry/registration form
- Easy mobile contact actions
- Accurate location
- Contact/admission FAQ
- Trust-building content where verified assets are available

---

# 2. Master Requirement Mapping

### Global requirements applied
- Consistent header/navigation across public pages
- Mobile-first responsive design
- Consistent typography, spacing, buttons, cards and UI components
- Clear primary CTA hierarchy
- Accessible contrast and readable typography
- Keyboard-accessible interactive elements
- Click-to-call phone number on mobile
- Clickable email address
- WhatsApp enquiry/contact CTA
- Analytics/event tracking for important CTAs and forms

### Contact page requirements applied

| ID | Requirement | Design Treatment |
|---|---|---|
| CT-01 | Clear contact page introduction | Hero section with concise introduction |
| CT-02 | SPRINT office address | Contact information card + map |
| CT-03 | Phone numbers | Contact card with click-to-call |
| CT-04 | Email address | Contact card with click-to-email |
| CT-05 | Click-to-call | Mobile-friendly phone CTA |
| CT-06 | Click-to-email | Email CTA |
| CT-07 | WhatsApp CTA | Secondary contact action |
| CT-08 | Office/walk-in timings | Contact information card |
| CT-09 | Genuine SPRINT office/campus imagery | Optional verified image area |
| CT-10 | Name field | Included in final form |
| CT-11 | Mobile field | Included in final form |
| CT-12 | Email field | Included in final form |
| CT-13 | Course/program enquiry dropdown | Included through Program Type and course selection |
| CT-14 | Message field | Included in final form |
| CT-15 | Persistent field labels | Labels remain visible above inputs |
| CT-16 | Client-side validation | Required fields + format validation |
| CT-17 | Server-side validation | Required for production implementation |
| CT-18 | Submission success message | Success state included |
| CT-19 | Spam protection | Required for production implementation |
| CT-20 | Correct Google Maps integration | Map area reserved for verified integration |
| CT-21 | Accurate SPRINT location pin | Must use verified address/coordinates |
| CT-22 | Appropriate zoom level | Configure after verified location |
| CT-23 | Mobile-friendly map | Responsive map container |
| CT-24 | Directions action | Included as secondary map action |
| CT-25 | Trust-building content | Optional verified content section |
| CT-26 | Hiring partner logos | Optional; only verified logos |
| CT-27 | Student testimonial | Optional; only verified testimonial |
| CT-28 | Contact/admission FAQ | FAQ accordion included |

---

# 3. Final Page Structure

```text
Header
   ↓
Contact Us Hero
   ↓
Contact Information + Primary Enquiry Form
   ↓
Location / Google Maps
   ↓
Contact & Admission FAQ
   ↓
Trust / Verification Content (optional)
   ↓
Footer
```

### Important
The page should remain focused on **Contact Us**. Do not add unrelated homepage sections such as course marketing grids, alumni carousels, or generic product sections.

---

# 4. Hero Section

### Heading
**Get in Touch**

### Supporting copy
Use a short, direct introduction explaining that visitors can contact SPRINT for course, admission, program or support enquiries.

### UI
- Breadcrumb: `Home / Contact Us`
- Strong but compact heading
- Supporting text
- Optional genuine SPRINT office/campus visual
- No unnecessary promotional content

---

# 5. Contact Information Section

Use a compact information panel beside the form on desktop and above the form on mobile.

### Required information
- **Office Address**
- **Phone Number**
- **Email Address**
- **Office / Walk-in Timings**
- **WhatsApp Enquiry**

### Interaction
- Phone → `tel:` click-to-call
- Email → `mailto:` click-to-email
- WhatsApp → verified WhatsApp enquiry link
- Address → map/location

### Content rule
Do not use dummy contact details in production. The master requirement explicitly depends on verified SPRINT contact information.

---

# 6. Final Contact / Registration Form

The form content is based on the supplied final **Contact Us Form content** document.

## Form Architecture

```text
Step 1: Personal & Contact Info
        ↓
Step 2: Professional / Educational Profile
        ↓
Step 3: Program & Course Selection
        ↓
Step 4: Geographic Address & Final Submit
```

The UI uses a **4-step visual progress indicator** that matches the form architecture:
1. Personal
2. Background
3. Program & Course
4. Location & Submit

The geographic address fields are the fourth and final step of the form. This keeps the form architecture, progress indicator, navigation, validation and submission behavior consistent.

The supplied form specification states that the process should feel like it can be completed in **under two minutes**.

---

## Step 1 — Personal & Primary Contact

### Fields

**Full Name**
- Standard text input
- Placeholder: `John Doe`

**Date of Birth (DOB)**
- HTML5 datepicker
- Display format: `DD / MM / YYYY`

**Gender**
- Radio pill toggle or dropdown
- Options:
  - Male
  - Female
  - Other

**Mobile Number**
- Phone input
- Regional country code: `+91`
- Country-code validation

**Email Address**
- Email input
- Real-time format validation

---

# 7. Step 2 — Background & Qualification

### Profession Selector

Dropdown options:
- Working Professional
- Student

The selected profession controls the next fields.

## Branch A — Working Professional

### Current Working Position
Dropdown:
- Junior Developer
- Manager
- Other

If `Other` is selected:
- Show text input
- Label/placeholder: `Write your working position`

### Company Name & Location
Text input

Placeholder:
`e.g., TCS, Ranchi / Bengaluru`

---

## Branch B — Student

### Current Study / Qualification
Dropdown:
- Below 10th / 10th
- 11th / 12th
- BA
- B.Sc
- BCA
- B.Tech / MCA
- Other

If `Other` is selected:
- Show text input
- Label/placeholder: `Write your current qualification`

### School / College Name & Location
Text input

Placeholder:
`e.g., St. Columba's College, Hazaribagh`

---

# 8. Step 3 — Program & Course Selection

### Program Type

Options:
- **Expert Track (Full Specialization)**
- **Individual Modular Courses**

## Expert Track State

When Expert Track is selected, show a locked/read-only module container.

### Bundled Modules
- Cloud Architecture
- Containers & K8s
- Machine Learning
- Deep Learning
- GenAI & RAG
- Agentic AI
- CI/CD & Terraform

### Helper Text
**The Expert Track covers the full 24-week end-to-end industrial curriculum.**

The bundled modules should not behave like editable checkboxes.

---

## Individual Modular Courses State

Show a multi-select checkbox grid.

### Final course options

- Cloud Infrastructure & AWS — **4 Weeks**
- Containers, Kubernetes & CI/CD — **6 Weeks**
- Generative AI, Prompt Engineering & RAG — **6 Weeks**
- Full-Stack MERN Development — **6 Weeks**
- Data Analytics & Business Intelligence — **4 Weeks**
- Corporate Personality Development — **4 Weeks**

The grid should be responsive and easy to scan.

---

# 9. Step 4 — Geographic Address & Final Confirmation

### Fields

**State**
- Dropdown
- Default: `Jharkhand`

**District**
- Dynamic dropdown based on selected state
- Example districts:
  - Hazaribagh
  - Ranchi
  - Bokaro
  - Dhanbad

**City / Village / Local Address**
- Short text input
- Use for street/locality information

### Final CTA

**Complete Registration & Book Counseling**

This is the primary conversion CTA and should use the master requirement's specified **high-contrast Crimson/Red** treatment.

---

# 10. Form UX Rules

### Progress Indicator

Show at the top of the form:

```text
● Personal  ───  ○ Background  ───  ○ Program  ───  ○ Location
```

The active step should be visually prominent.

### Navigation
- `Continue` on intermediate steps
- `Back` available after Step 1
- Final submission only on Step 4 (Location & Submit)
- Preserve previously entered values when navigating back

### Conditional logic
- Profession controls Professional/Student branch
- `Other` reveals a custom text field
- Program Type controls Expert Track / Individual Courses
- State controls District options

### Validation
- Validate before allowing the next step
- Show inline errors close to the relevant field
- Keep labels persistent
- Do not rely on placeholder text as the only label

### Success
After successful submission:
- Show clear success confirmation
- Confirm that the enquiry/registration was received
- Keep the confirmation concise

### Production security
- Server-side validation
- Spam protection
- Server-side rate limiting for the form submission endpoint
- Secure form submission
- Analytics event for form start, step completion and final submission

### Rate Limiting & Abuse Protection

The Contact Us form submission endpoint must be protected against excessive, automated, or repeated submission attempts.

#### Requirements
- Apply server-side rate limiting to the form submission endpoint.
- Rate limiting should help prevent spam, automated submissions, email abuse and unnecessary database requests.
- The rate limit should be based on an appropriate server-side identifier such as IP address, session, user identifier, or another suitable mechanism.
- The exact request limit and time window should be configurable and finalized during technical implementation.
- Do not permanently block legitimate users solely because they exceed a temporary rate limit.
- When the rate limit is exceeded, the server should return an appropriate response such as HTTP `429 Too Many Requests`.
- The frontend should display a clear, user-friendly retry message, for example: `Too many submission attempts. Please wait a few minutes and try again.`
- Rate-limited requests must not create a new enquiry in the database.
- Rate-limited requests must not trigger a user acknowledgement email or administrator notification email.
- Rate limiting should work alongside server-side validation and other spam-protection mechanisms.

---

# 11. Post-Submission Workflow

After the user completes Step 4 and selects **Complete Registration & Book Counseling**, the application should follow the workflow below.

## Submission Flow

```text
User submits Step 4
        ↓
Client-side validation
        ↓
Send enquiry to backend API
        ↓
Server-side rate-limit check
        ↓
Server-side validation
        ↓
Save enquiry in database
        ↓
Generate enquiry/reference ID
        ↓
Trigger acknowledgement email to user
        ↓
Trigger new-enquiry notification email to SPRINT admin/team
        ↓
Return success response to frontend
        ↓
Show success confirmation
```

## Database / Lead Creation

A valid submission should be saved before email delivery is treated as complete. The enquiry should include the submitted form data together with system fields such as:

- Unique enquiry/reference ID
- Lead status, initially `NEW`
- Created timestamp
- Updated timestamp

Recommended lead lifecycle:

```text
NEW → CONTACTED → COUNSELLING SCHEDULED → CONVERTED / CLOSED
```

The exact database schema and backend technology may be defined during implementation.

## User Acknowledgement Email

After a successful database save, send an acknowledgement email to the email address submitted by the user.

The email should contain:
- User's name
- Confirmation that the enquiry was received
- Enquiry/reference ID
- Selected program/course summary where appropriate
- Clear statement that the SPRINT counselling team will follow up
- SPRINT contact/signature information

The acknowledgement must not claim that admission or a counselling appointment is confirmed unless the system actually performs such booking.

Example subject:

`We received your SPRINT enquiry`

## Admin / SPRINT Team Notification Email

After a successful database save, send a notification email to the verified SPRINT admin/team email address.

The notification should contain the information required for follow-up, including:
- Enquiry/reference ID
- Full name
- Mobile number
- Email address
- Student / Working Professional selection
- Relevant qualification or working details
- Program type
- Selected modular courses, when applicable
- State and district
- Lead status: `NEW`

Example subject:

`New SPRINT Enquiry - {Enquiry ID}`

Admin recipient addresses must come from verified server-side configuration and must not be hard-coded into public frontend code.

## Email Delivery Service / Integration

Email notifications must be triggered from the **server-side application**, not directly from browser/frontend code. The backend/server-side implementation should trigger email delivery only after the enquiry has been validated and stored successfully.

The implementation may use either of the following approaches:

- **SMTP-based delivery** using a server-side library such as **Nodemailer** with a verified SMTP provider.
- **Transactional email API/SDK** using a provider such as **Resend, SendGrid, Brevo, Amazon SES, Mailgun, or an equivalent approved service**.

The requirement does not mandate a specific provider. The development team may choose the email-delivery mechanism based on deployment, reliability, cost and SPRINT infrastructure requirements.

Recommended architecture:

```text
Contact Us Form
        ↓
Backend / Server-side API
        ↓
Validate enquiry
        ↓
Save enquiry in database
        ↓
Email delivery service
   (SMTP or Email API)
       ↙       ↘
User email   Admin email
```

### Security Requirements

- SMTP usernames/passwords and email-provider API keys must remain server-side.
- Secrets must be stored in environment variables or the deployment platform's secret-management mechanism.
- Email credentials/API keys must never be included in client-side JavaScript or exposed to the browser.
- Secrets must not be committed to the public source-code repository.
- Admin recipient addresses must come from verified server-side configuration.

### Delivery Behavior

Email delivery is a notification step and must not be the source of truth for the enquiry. The database record is the authoritative record. If email delivery fails after a successful database save, the enquiry must remain stored and the email failure should be logged for retry or administrative follow-up.

## Email Delivery Rule

The enquiry must not be lost because an email service is temporarily unavailable. The required order is:

```text
Validate → Save Database → Attempt Notifications → Return Result
```

If the database save succeeds but one or both emails fail, preserve the enquiry and log the email failure for retry or administrative follow-up. Email credentials, SMTP passwords and API keys must remain on the server and must never be exposed in frontend code or committed to the repository.

## Frontend Submission States

The form should support the following states:
- Idle
- Submitting
- Success
- Validation error
- Server/network error

While submitting:
- Disable the final submit button to prevent duplicate submissions
- Show a clear loading/submitting state

On success:
- Show a concise confirmation
- Display the enquiry/reference ID when available
- Inform the user that the counselling team will follow up
- Clear/reset the form only after confirmed successful submission

Suggested confirmation:

> **Thank you! Your enquiry has been submitted successfully.**  
> Our SPRINT counselling team will contact you regarding your enquiry.  
> Reference ID: `{Enquiry ID}`

On failure:
- Keep the user's entered form values
- Show an actionable error message
- Allow the user to retry
- Where appropriate, offer verified phone or WhatsApp contact as an alternative

## Submission Analytics

Recommended events:
- `contact_form_submit`
- `contact_form_success`
- `contact_form_error`

Do not send personal form values such as name, phone number, email address or DOB to analytics platforms.

---

# 12. Location Section

### Heading
**Find Us**

Use the verified SPRINT office/campus location.

### Requirements
- Correct Google Maps integration
- Accurate SPRINT location pin
- Appropriate zoom
- Mobile-friendly interaction
- Directions action

### Important
The current design uses a visual placeholder only. Before development/launch, replace it with the verified Google Maps embed/API and verified coordinates.

---

# 13. FAQ Section

### Heading
**Frequently Asked Questions**

Use accordion interaction.

Recommended contact/admission questions:
- How can I contact SPRINT?
- How can I enquire about a program?
- How can I book counseling?
- What information is required for registration?
- How can I get admission support?

Only publish approved/final FAQ answers.

---

# 14. Trust Section — Optional

The master requirements allow trust-building content on the Contact page.

Use only if verified assets/content are available:
- Genuine SPRINT office/campus imagery
- Verified hiring partner logos
- Verified student testimonial

Do not use placeholder company logos, fake testimonials, or stock imagery presented as SPRINT's actual campus.

---

# 15. Footer

Use the same global footer as the rest of the SPRINT website.

Include relevant:
- Quick links
- Contact information
- Social media links
- Privacy Policy
- Terms & Conditions

---

# 16. Responsive Design

## Desktop
Two-column primary layout:

```text
┌─────────────────────────┬─────────────────────────────┐
│ Contact Information     │ Registration / Enquiry Form │
│                         │                             │
│ Phone                   │ Step 1                      │
│ Email                   │ Step 2                      │
│ WhatsApp                │ Step 3                      │
│ Address                 │ Step 4                      │
│ Timings                 │                             │
└─────────────────────────┴─────────────────────────────┘
```

## Tablet
- Reduce column gap
- Maintain readable form widths
- Allow course checkbox grid to wrap

## Mobile
Stack in this order:

```text
Hero
↓
Contact Information
↓
Form / Step 1
↓
Step 2
↓
Step 3
↓
Step 4
↓
Map
↓
FAQ
↓
Trust (if used)
↓
Footer
```

Mobile phone/email/WhatsApp actions should be easy to tap.

---

# 17. Visual Design Direction

### Style
- Professional
- Modern
- Education / career focused
- Clean
- Conversion-oriented
- Minimal visual clutter

### Components
- Rounded input fields
- Persistent labels
- Clear section headings
- Compact information cards
- Step indicator
- Responsive checkbox grid
- High-contrast primary CTA
- Accessible focus states

### CTA hierarchy
Primary:
**Complete Registration & Book Counseling**

Secondary:
**WhatsApp Enquiry**

Utility:
**Call Us / Email Us / Get Directions**

---

# 18. Content Decisions

### Added
- Contact information block
- WhatsApp action
- Location section
- Contact/admission FAQ
- Success state
- Responsive/mobile interaction states
- Trust section as optional, based on verified assets

### Not added
- Generic course marketing sections
- Alumni section
- Large promotional course cards
- Unrelated homepage content
- Fake testimonials/logos
- Unverified contact details

This keeps the page aligned specifically with the **Contact Us** scope.

---

# 19. Acceptance Criteria

The Contact Us page is ready for development handoff when:

- [ ] Header matches the global SPRINT design
- [ ] Contact Us is clearly identified as the current page
- [ ] Hero introduction is present
- [ ] Verified address, phone, email and timings are available
- [ ] Phone is clickable on mobile
- [ ] Email is clickable
- [ ] WhatsApp CTA is present with verified number
- [ ] Form follows the supplied final content
- [ ] 4-step progress indicator is visible and matches Personal → Background → Program → Location
- [ ] Professional/Student conditional branching works
- [ ] `Other` fields appear dynamically
- [ ] Expert Track locked modules display correctly
- [ ] Individual course checkbox grid works
- [ ] Jharkhand is the default state
- [ ] District changes according to state
- [ ] Final CTA text is exactly:
  **Complete Registration & Book Counseling**
- [ ] Client-side validation is implemented
- [ ] Server-side validation is planned/implemented
- [ ] Spam protection is included for production
- [ ] Form submission endpoint includes server-side rate limiting
- [ ] Rate-limited requests do not create enquiries or trigger emails
- [ ] Users receive a clear retry-later message when the rate limit is exceeded
- [ ] Success message is implemented
- [ ] Google Maps uses verified SPRINT location
- [ ] Directions action works
- [ ] FAQ accordion works
- [ ] Desktop/tablet/mobile layouts are tested
- [ ] Accessibility and keyboard interaction are tested
- [ ] Successful submissions are saved to the database before notification email delivery is considered
- [ ] A unique enquiry/reference ID is generated and returned after successful submission
- [ ] User acknowledgement email is sent using verified server-side email configuration
- [ ] Admin/team notification email is sent using verified server-side email configuration
- [ ] Email failure does not delete or lose an already-saved enquiry
- [ ] Submit button prevents duplicate submissions while a request is in progress
- [ ] Failed submissions preserve entered form data and allow retry
- [ ] Email/SMTP/API credentials are never exposed in frontend code

---

## Source References

### Final form content
The supplied document defines the 4-step form architecture, conditional professional/student branches, Expert Track vs Individual Courses logic, course list, geographic fields, final CTA, progress indicator, and smart defaults.

### Master requirements
The SPRINT Website Master Requirements V2 defines the Contact page requirements CT-01 through CT-28 and global requirements such as responsive design, accessibility, click-to-call, clickable email, WhatsApp CTA, analytics, and consistent design system.

