# SPRINT Contact Us Page --- Final  Requirements

**Document Status:** Final Design & Development Requirement\
**Project:** SPRINT Website\
**Page:** Contact Us\
**Quality Target:** Enterprise-grade, production-ready\
**Reference:** Approved visual direction and generated UI mockup

------------------------------------------------------------------------

## 1. Project Objective

Design and develop a **premium, modern, professional, enterprise-grade
Contact Us page** for the SPRINT website.

The page should feel like a real production website for an established
education and professional-skills organization. The design must
prioritize:

-   Clear user journeys
-   Professional visual hierarchy
-   Responsive/mobile-first behavior
-   Accessibility
-   Performance
-   Security readiness
-   Maintainable component architecture
-   Robust form UX
-   Production-quality error and success states
-   Consistent SPRINT branding

The implementation should use the provided UI references as inspiration
while making independent professional UX decisions where necessary.

------------------------------------------------------------------------

# 2. Page Structure

The final Contact Us page should follow this structure:

1.  Header / Navigation
2.  Hero Section
3.  Contact & Enquiry Section
4.  Location / Map Section
5.  FAQ Section
6.  Final CTA Section
7.  Footer

Overall flow:

**Header → Hero → Enquiry → Map → FAQs → CTA → Footer**


### 2.1 Final page order

```text
Header
  ↓
Minimal Hero
  ↓
Reach Us                    Enquiry Form
(left on desktop)           (right on desktop)
  ↓
Find Us / Map
  ↓
FAQ
  ↓
Footer
```

### 2.2 Desktop primary section

```text
┌──────────────────────────┬──────────────────────────────────┐
│ Reach Us                 │ Enquiry Form                     │
│                          │                                  │
│ Call Us                  │ Full Name                        │
│ Email Us                 │ Email Address                    │
│ WhatsApp                 │ Phone Number                     │
│ Visit Us                 │ Profession                       │
│ Office Timings           │ Interested Course(s)             │
│                          │ Message / Query                  │
│                          │ Submit Enquiry                   │
└──────────────────────────┴──────────────────────────────────┘
```

Recommended desktop balance:

- Reach Us: approximately **35–40%**
- Enquiry Form: approximately **60–65%**

### 2.3 Mobile order

```text
Header
↓
Hero
↓
Reach Us
↓
Enquiry Form
↓
Map
↓
FAQ
↓
Footer
```

---

------------------------------------------------------------------------

# 3. Header / Navigation


- The page MUST use the same approved global header/navigation .
- Contact Us MUST be identifiable as the current page where the global navigation supports active-state indication.
- Header behavior MUST remain responsive and keyboard accessible.

------------------------------------------------------------------------

# 4. Hero Section

The existing hero design should remain essentially the same.

### Hero Content

**Label:** \> CONTACT US

**Headline:** \> Let's Build Your Future Together

**Supporting Text:** \> Have questions about our programs, admissions or
anything else? We're here to help.

### Hero Image

Retain the existing professional education/collaboration imagery and
visual treatment.

### Social Media Addition

Add social media links/icons to the hero:

-   LinkedIn
-   Facebook
-   YouTube
-   Instagram

### Social UX

The icons should:

-   Be visually consistent
-   Have accessible labels
-   Have hover/focus states
-   Link to the appropriate official SPRINT social profiles
-   Work correctly on mobile
-   Avoid distracting from the hero CTA/content

### Important

**Do not redesign the hero unnecessarily.**

The existing hero layout is approved. The main requested enhancement is
the addition of the social media links.

------------------------------------------------------------------------

# 5. Contact & Enquiry Section

This is the primary interaction area of the Contact Us page.

Use the **third provided reference image** as the primary inspiration
for the enquiry form.

## Layout

Desktop:

**Contact Information \| Dynamic Enquiry Form**

Mobile:

**Contact Information → Enquiry Form**

------------------------------------------------------------------------

# 6. Contact Information

Use a clean set of actionable contact cards.

The Reach Us panel MUST contain verified SPRINT contact information and direct actions for:

1. **Call Us**
   - verified SPRINT phone number;
   - click-to-call behavior using an appropriate phone link.


2. **Email Us**
   - verified official SPRINT email address;
   - click-to-email behavior.

   Action: `mailto:`

3. **WhatsApp**
   - verified SPRINT WhatsApp number/link;
   - clearly labelled action such as `Chat on WhatsApp`.

    Action: Open WhatsApp conversation.

4. **Visit Us** 
   - verified office/company address;
   - verified office/walk-in timings;
   - `Get Directions` action pointing to the verified SPRINT location.

   Action: Open directions/map.


The Reach Us panel SHOULD use compact cards or clearly separated contact items. Contact actions MUST remain easy to tap on mobile.

Dummy contact information MUST NOT be used in production.
 
### UX Requirement

These are not static cards only. Where applicable, the cards should be
**interactive and actionable**.

------------------------------------------------------------------------

# 7. Dynamic Enquiry Form

The form must support four user audiences:

1.  Student
2.  Working Professional
3.  Institute
4.  Company / Enterprise

Use a prominent audience selector:

``` text
[ Student ]
[ Working Professional ]
[ Institute ]
[ Company ]
```

Selecting an audience should dynamically display the appropriate form
fields.

------------------------------------------------------------------------

# 8. Student Enquiry Form

Suggested fields:

-   Full Name \*
-   Email Address \*
-   Phone Number \*
-   Interested Course(s) \*
-   Message / Query
-   Privacy Consent \*

Submit button:

> Submit Enquiry →

The form should be simple and focused on student requirements.

------------------------------------------------------------------------

# 9. Working Professional Enquiry Form

Suggested fields:

-   Full Name \*
-   Current Company 
-   Current Designation \*
-   Total Experience 
-   Email Address \*
-   Phone Number \*
-   Interested Program / Course \*
-   Message / Query
-   Privacy Consent \*

The UX should support professionals looking for:

-   Upskilling
-   Reskilling
-   Career development
-   Professional training
-   Flexible learning

------------------------------------------------------------------------

# 10. Institute Enquiry Form

Suggested fields:

-   Institute Name \*
-   Contact Person Name \*
-   Designation / Role 
-   Official Email Address \*
-   Phone Number \*
-   Institute Website
-   Service(s) Interested In \*
    -   Training
    -   Workshop
    -   Course
-   Preferred Contact Time \*
-   Training / Requirement Message
-   Privacy Consent \*

The form should support partnership and institutional training
enquiries.

------------------------------------------------------------------------

# 11. Company / Enterprise Enquiry Form

Suggested fields:

-   Company Name \*
-   Domain of Company 
-   Contact Person Name \*
-   Role / Designation 
-   Official Email Address \*
-   Phone Number \*
-   Company Website
-   Available Time for Contact \*
-   Purpose Type \*
    -   Partnership
    -   Hiring
    -   Internships
    -   Personality Development
    -   SME / Skill Development
-   Message / Requirement
-   Privacy Consent \*

The company flow should feel appropriate for **B2B / enterprise
communication**.

------------------------------------------------------------------------

# 12. Form UX & Validation

The enquiry form must be production-quality.

### Required UX states

-   Default
-   Focus
-   Hover
-   Error
-   Disabled
-   Loading
-   Success
-   API/network failure

### Validation

Implement:

-   Required field validation
-   Email validation
-   Phone validation
-   Appropriate field length limits
-   Message character counter
-   Select/dropdown validation
-   Consent validation

### Error Messages

Errors should be specific and actionable.

Example:

> Please enter a valid email address.

Avoid generic messages such as:

> Something went wrong.

### Submission

Prevent:

-   Duplicate submissions
-   Invalid submission
-   Accidental multiple clicks

The architecture should be ready for backend/API integration.

------------------------------------------------------------------------



# 12A. Intelligent Course-to-Message Prefill

When a user selects an **Interested Course / Program**, the Message / Query field should automatically generate a professional enquiry message based on the selected course.

### Example

If the user selects:

> Artificial Intelligence

The Message / Query field should automatically contain:

> I'm interested in the Artificial Intelligence course. I would like to know more about the course details, eligibility, fees and upcoming batches.

### Multiple Course Selection

If multiple courses are selected, the message should dynamically mention all selected courses.

Example:

> I'm interested in Artificial Intelligence and Full Stack Development. I would like to know more about the course details, eligibility, fees and upcoming batches.

### Audience-Aware Message

The generated message should adapt to the selected audience.

#### Student

> I'm interested in the Artificial Intelligence program. I would like to know more about the course details, eligibility, fees and upcoming batches.

#### Working Professional

> I'm interested in the Artificial Intelligence program as a working professional. I would like to know about the curriculum, duration, schedule and learning options.

#### Institute

> We are interested in Artificial Intelligence training for our institute. Please share details about customized training options, duration and requirements.

#### Company / Enterprise

> We are interested in Artificial Intelligence training for our organization. Please share details about customized corporate training, duration and available programs.

### UX Rules

- The generated message must be **fully editable** by the user.
- Selecting or removing a course should update the generated content intelligently.
- Do not overwrite text that the user has substantially edited without an appropriate UX safeguard.
- The message should remain concise and professional.
- The feature should work for both single and multiple course selections.
- The generated text should be accessible and compatible with keyboard navigation.
- The implementation should keep course/message templates data-driven so new programs can be added without rewriting the form component.

### Example Interaction

```text
Interested Course(s) *

[ ✓ Artificial Intelligence ]

Message / Query

┌────────────────────────────────────────────┐
│ I'm interested in the Artificial           │
│ Intelligence course. I would like to know  │
│ more about the course details, eligibility,│
│ fees and upcoming batches.                 │
└────────────────────────────────────────────┘

The user can edit this message before submitting.
```

This is a **confirmed final UX requirement** for the SPRINT enquiry form.

# 13. Privacy & Security Readiness

The form should include:

> By submitting this form, you agree that SPRINT may contact you
> regarding your enquiry. Please read our Privacy Policy.

Requirements:

-   Do not expose API keys in frontend code.
-   Treat client-side validation as UX, not security.
-   Server-side validation should be expected when backend is connected.
-   Sanitize and validate submitted data.
-   Provide safe error handling.
-   Avoid exposing sensitive technical information to users.

------------------------------------------------------------------------

# 14. Location / Map Section

After the enquiry section, include a location section.

### Heading

> Find Us Here

### Supporting Text

> Visit our campus for a guided tour, counselling session or any other
> assistance.

### CTA

> Get Directions →

### Map

Use a clean map card with:

-   SPRINT location marker
-   Zoom controls where applicable
-   Responsive layout
-   Accessible fallback/location information
-   External directions link

Desktop layout:

**Location Information \| Map**

Mobile:

**Location Information → Map**

------------------------------------------------------------------------

# 15. FAQ Section

The FAQ section should appear after the map.

### Heading

> Frequently Asked Questions

### Audience Categories

Organize questions by:

-   Students
-   Working Professionals
-   Institutes
-   Companies / Enterprise

The initial Contact Us page should show **8 questions total**:

  Audience                  Visible Questions
  ----------------------- -------------------
  Students                                  2
  Working Professionals                     2
  Institutes                                2
  Companies                                 2

Use an accordion interaction.

------------------------------------------------------------------------

# 16. Initial FAQ Content

## Students

1.  How can I enquire about a course at SPRINT?
2.  Can I get counselling or guidance to choose the right course?

## Working Professionals

Add two professionally relevant questions, for example:

1.  Can working professionals join SPRINT programs?
2.  Does SPRINT offer flexible learning options for working
    professionals?

## Institutes

1.  How can an institute partner with SPRINT for training programs?
2.  Does SPRINT offer customized training programs for institutes?

## Companies / Enterprise

1.  Does SPRINT provide corporate training programs for companies?
2.  How can a company discuss its training or skill-development
    requirements with SPRINT?

------------------------------------------------------------------------

# 17. Complete FAQ Requirement

The **View All FAQs** action should provide a complete set of **30
FAQs**.

The FAQ library should cover:

-   Student enquiries
-   Course selection
-   Counselling
-   Programs
-   Learning modes
-   Professional development
-   Institute partnerships
-   Customized institutional training
-   Workshops
-   Corporate training
-   Skill-development requirements
-   Partnership proposals
-   Hiring/internship related enquiries
-   Contact information
-   Response timelines
-   General support

------------------------------------------------------------------------

# 18. Existing FAQ Content

## Student FAQs --- 7

1.  How can I enquire about a course at SPRINT?
2.  How can I choose the right course for my career goals?
3.  Can I get counselling or guidance before enrolling in a course?
4.  What training programs are available for students?
5.  Can working professionals join SPRINT programs?
6.  Do you offer online or flexible learning options?
7.  How will I know what happens after I submit an enquiry?

## Institute FAQs --- 6

8.  How can an institute partner with SPRINT?
9.  Does SPRINT provide customized training programs for institutes?
10. Can SPRINT conduct training programs at our institute?
11. Can institutes discuss their specific skill-development requirements
    with SPRINT?
12. How can an institute request a training or partnership proposal?
13. Who can institutes contact for partnership-related enquiries?

## Company FAQs --- 5

14. Does SPRINT provide corporate training programs for companies?
15. Can SPRINT create customized training programs for our company?
16. Can companies discuss their employee skill-development requirements
    with SPRINT?
17. How can a company request a corporate training proposal?
18. Who can companies contact for corporate training enquiries?

## General FAQs --- 2

19. How can I contact SPRINT?
20. How soon will the SPRINT team respond to my enquiry?

------------------------------------------------------------------------

# 19. Additional FAQs --- Add 10

The remaining 10 FAQs should be professionally written to reach a total
of 30.

Recommended additions:

21. What information should I include when submitting an enquiry?

22. Can I request a counselling session before selecting a program?

23. Can SPRINT recommend a program based on my current skills and career
    goals?

24. Are customized workshops available for professional teams?

25. Can organizations request a training program for a specific group of
    employees?

26. Can institutes request a campus-based workshop or seminar?

27. How can an organization discuss a long-term training partnership
    with SPRINT?

28. Can companies request training based on specific business or
    workforce requirements?

29. Can I update my enquiry after submitting the form?

30. What should I do if I do not receive a response after submitting an
    enquiry?

------------------------------------------------------------------------

# 20. FAQ Interaction

Each FAQ should support:

-   Expand
-   Collapse
-   Keyboard navigation
-   Visible focus state
-   Smooth but restrained animation
-   Accessible accordion semantics

Do not display all 30 FAQs directly on the Contact Us page.

The Contact Us page should remain concise.

 
------------------------------------------------------------------------

# 22. Footer
 
The page MUST use the same approved global footer as the rest of the SPRINT website.

The footer SHOULD include relevant:

- quick links;
- contact information;
- social media links;
- Privacy Policy; and
- Terms & Conditions.

Social media links SHOULD primarily live in the footer rather than compete with the enquiry CTA in the Hero.

------------------------------------------------------------------------

# 23. Responsive Design

The website must be mobile-first.

Test and optimize for:

-   Large desktop
-   Standard desktop
-   Laptop
-   Tablet
-   Large mobile
-   Standard mobile
-   Small mobile

Avoid:

-   Horizontal scrolling
-   Overlapping elements
-   Tiny touch targets
-   Desktop-only interactions
-   Broken form layouts

------------------------------------------------------------------------

# 24. Accessibility

Accessibility must be built into the implementation.

Requirements:

-   Semantic HTML
-   Correct heading hierarchy
-   Accessible labels
-   Keyboard navigation
-   Visible focus indicators
-   Accessible form errors
-   Accessible accordion
-   Appropriate color contrast
-   Screen-reader-friendly controls
-   Meaningful alt text
-   Reduced-motion consideration
-   Accessible mobile menu

------------------------------------------------------------------------

# 25. Performance

Optimize for real-world performance.

Requirements:

-   Optimized images
-   Responsive image loading
-   Lazy loading where appropriate
-   Avoid unnecessary JavaScript
-   Minimize dependencies
-   Optimize fonts
-   Avoid layout shifts
-   Efficient animations
-   Production build optimization

The page should feel fast even on average mobile devices.

------------------------------------------------------------------------

# 26. Component Architecture

Use reusable components instead of creating one large page component.

Suggested architecture:

``` text
ContactUs/
│
├── ContactHero/
├── SocialLinks/
├── ContactMethods/
├── EnquirySection/
│   ├── AudienceSelector/
│   ├── StudentForm/
│   ├── WorkingProfessionalForm/
│   ├── InstituteForm/
│   └── CompanyForm/
│
├── LocationSection/
├── FAQSection/
├── FAQAccordion/
└── Footer/
```

Form configuration and FAQ data should be structured so that future
updates do not require rewriting large amounts of UI code.

------------------------------------------------------------------------

# 27. Engineering Quality

The implementation should maintain:

-   Clean component architecture
-   Reusable UI patterns
-   Clear naming
-   Separation of UI and data
-   Maintainable CSS/design tokens
-   Minimal duplication
-   Predictable state management
-   Robust error handling
-   API-ready form architecture
-   Clean imports
-   No unnecessary packages
-   No console errors

------------------------------------------------------------------------

# 28. SEO

Implement appropriate:

-   Page title
-   Meta description
-   Semantic headings
-   Open Graph metadata
-   Descriptive image alt text
-   Crawlable links
-   Canonical URL readiness
-   Structured data where appropriate

------------------------------------------------------------------------

# 29. Visual Design Principles

The final design should feel:

**Professional + Premium + Modern + Trustworthy + Human**

Avoid:

-   Excessive glassmorphism
-   Excessive animations
-   Overuse of gradients
-   Random shadows
-   Inconsistent corner radii
-   Inconsistent icon styles
-   Excessive content density
-   Generic AI-looking layouts

The design should look like a **real institutional/enterprise product**,
not a template.

------------------------------------------------------------------------

# 30. Quality Assurance Checklist

Before final delivery, verify:

### UI

-   [ ] Header
-   [ ] Hero
-   [ ] Social links
-   [ ] Contact cards
-   [ ] Dynamic enquiry forms
-   [ ] Map
-   [ ] FAQ
-   [ ] Footer

### Functionality

-   [ ] Navigation works
-   [ ] Social links work
-   [ ] Phone link works
-   [ ] Email link works
-   [ ] WhatsApp link works
-   [ ] Directions link works
-   [ ] Audience selector works
-   [ ] Form validation works
-   [ ] FAQ accordion works
-   [ ] View All FAQs works

### Technical

-   [ ] No console errors
-   [ ] No broken imports
-   [ ] No broken assets
-   [ ] No horizontal overflow
-   [ ] Production build passes
-   [ ] Responsive layouts verified
-   [ ] API failure handling considered

### Accessibility

-   [ ] Keyboard navigation
-   [ ] Focus states
-   [ ] Accessible labels
-   [ ] Accessible errors
-   [ ] Contrast checked
-   [ ] Semantic structure

### Performance

-   [ ] Images optimized
-   [ ] Lazy loading where appropriate
-   [ ] Animations optimized
-   [ ] Unnecessary dependencies removed
-   [ ] Layout shifts minimized

------------------------------------------------------------------------

# 31. Final Design Direction

The final Contact Us page should combine:

**Existing SPRINT Branding** + **Approved Reference Layouts** +
**Improved UX** + **Enterprise-level Engineering** + **Responsive
Design** + **Accessibility** + **Performance** + **Security
Readiness** + **Production QA**

### Final Experience

> **Header → Existing Hero + Social Links → Smart Enquiry Experience →
> Location → Audience-based FAQs → 30-FAQ Library  →
> Institutional Footer**

------------------------------------------------------------------------

## Approval Standard

The page should only be considered **final** when it meets this
standard:

> **A real organization should be able to ship this page to production
> without the user immediately noticing amateur UX, inconsistent design,
> accessibility problems, or weak engineering decisions.**

**Status:** Final requirements baseline for SPRINT Contact Us page.
