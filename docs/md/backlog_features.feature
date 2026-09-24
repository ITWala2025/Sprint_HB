Feature: SPRINT Contact Us Page - Complete Implementation

  # --- PAGE STRUCTURE & LAYOUT ---
  Scenario: As a user, I want a structured Contact Us page with defined sections
    Given the page follows the sequence: Header → Hero → Enquiry → Map → FAQs → CTA → Footer
    When I load the Contact Us page
    Then the page displays sections in the correct order per desktop and mobile layouts

  # --- HEADER / NAVIGATION ---
  Scenario: As a visitor, I can identify the current page via navigation active state
    Given I am on the Contact Us page
    When the global navigation renders
    Then Contact Us has active-state indication reflecting current page

  Scenario: As a keyboard user, I can navigate the header responsively
    Given the header is focused via keyboard
    When I use Tab/Shift+Tab to navigate
    Then focus order remains logical and accessible

  # --- HERO SECTION ---
  Scenario: As a user, I see the approved hero design with social media links
    Given the Contact Us page loads
    Then the hero displays: "Let's Build Your Future Together" headline
    And supporting text: "Have questions about our programs, admissions or anything else? We're here to help."
    And social media icons: LinkedIn, Facebook, YouTube, Instagram
    And each icon has accessible labels, hover/focus states
    And links to official SPRINT social profiles

  Scenario: As a user, the hero maintains visual consistency without redesign
    Given the existing hero layout is approved
    When the page renders
    Then the hero layout remains unchanged except for social link addition

  # --- CONTACT & ENQUIRY SECTION ---
  Scenario: As a desktop user, I see Contact Information and Enquiry Form side-by-side
    Given the page renders on desktop
    Then Contact Information occupies approximately 35-40% width
    And Enquiry Form occupies approximately 60-65% width
    And they are displayed in a two-column layout

  Scenario: As a mobile user, I see Contact Information then Enquiry Form sequentially
    Given the page renders on mobile
    When viewing the Contact & Enquiry section
    Then Contact Information appears first
    Then Enquiry Form appears below

  # --- CONTACT INFORMATION CARDS ---
  Scenario: As a user, I can interact with actionable contact cards
    Given the Reach Us panel displays
    When I click "Call Us"
    Then a click-to-call link opens the verified SPRINT phone number
    When I click "Email Us"
    Then a mailto: link opens with the verified SPRINT email address
    When I click "WhatsApp"
    Then a WhatsApp conversation opens with the verified SPRINT number
    When I click "Visit Us"
    Then directions/map opens for the verified SPRINT location

  # --- DYNAMIC ENQUIRY FORM ---
  Scenario: As a visitor, I can select an audience and see appropriate form fields
    Given the Dynamic Enquiry Form is displayed
    When I select "Student" from the audience selector
    Then student-specific fields appear: Full Name, Email, Phone, Interested Courses, Message, Privacy Consent
    When I select "Working Professional"
    Then professional fields appear: Full Name, Current Company, Designation, Experience, Email, Phone, Interested Program, Message, Privacy Consent
    When I select "Institute"
    Then institute fields appear: Institute Name, Contact Person Name, Designation, Official Email, Phone, Institute Website, Service(s) Interested In, Preferred Contact Time, Training/Requirement Message, Privacy Consent
    When I select "Company/Enterprise"
    Then company fields appear: Company Name, Domain, Contact Person Name, Role/Designation, Official Email, Phone, Company Website, Available Time for Contact, Purpose Type, Message, Privacy Consent

  # --- FORM FIELDS BY AUDIENCE ---
  Scenario: As a student, I complete the student enquiry form
    Given I am on the Student Enquiry Form
    When I view the required fields
    Then I see: Full Name *, Email Address *, Phone Number *, Interested Course(s) *, Message / Query, Privacy Consent *

  Scenario: As a working professional, I complete the professional form
    Given I am on the Working Professional Enquiry Form
    When I view the required fields
    Then I see: Full Name *, Current Company, Current Designation *, Total Experience, Email Address *, Phone Number *, Interested Program / Course *, Message / Query, Privacy Consent *

  Scenario: As an institute representative, I complete the institute form
    Given I am on the Institute Enquiry Form
    When I view the required fields
    Then I see: Institute Name *, Contact Person Name *, Official Email Address *, Phone Number *, Institute Website, Service(s) Interested In *, Preferred Contact Time, Training / Requirement Message, Privacy Consent *

  Scenario: As a company representative, I complete the enterprise form
    Given I am on the Company Enquiry Form
    When I view the required fields
    Then I see: Company Name *, Domain of Company, Contact Person Name *, Role / Designation, Official Email Address *, Phone Number *, Company Website, Available Time for Contact *, Purpose Type *, Message / Requirement, Privacy Consent *

  # --- FORM VALIDATION ---
  Scenario: As a user, I receive specific validation errors for required fields
    Given the form is submitted with required fields empty
    Then I see specific error messages for each missing required field
    And generic "Something went wrong" messages are avoided

  Scenario: As a user, I validate email format
    Given I enter an invalid email address
    When the form validates
    Then I see: "Please enter a valid email address."

  Scenario: As a user, I validate phone number format
    Given I enter an invalid phone number
    When the form validates
    Then I see a specific phone validation error message

  Scenario: As a user, I see a character counter for the message field
    Given the Message / Query field is focused
    When I type characters
    Then a character counter displays the count and remaining limit

  Scenario: As a user, I cannot submit the form without consent
    Given the Privacy Consent field is unchecked
    When I click Submit
    Then submission is prevented and a consent validation error displays

  # --- INTELLIGENT COURSE-TO-MESSAGE PREFILL ---
  Scenario: As a student, I see auto-generated message when selecting a course
    Given I select "Artificial Intelligence" from Interested Course(s)
    When the selection changes
    Then the Message / Query field auto-populates: "I'm interested in the Artificial Intelligence course. I would like to know more about the course details, eligibility, fees and upcoming batches."
    And the message is fully editable by me

  Scenario: As a working professional, I see audience-aware prefill
    Given I select "Artificial Intelligence" and am a working professional
    When the selection changes
    Then the Message / Query field auto-populates: "I'm interested in the Artificial Intelligence program as a working professional. I would like to know about the curriculum, duration, schedule and learning options."

  Scenario: As an institute, I see institution-aware prefill
    Given I select "Artificial Intelligence" and am an institute
    When the selection changes
    Then the Message / Query field auto-populates: "We are interested in Artificial Intelligence training for our institute. Please share details about customized training options, duration and requirements."

  Scenario: As a company, I see company-aware prefill with multiple course selection
    Given I select "Artificial Intelligence" and "Full Stack Development" as a company
    When the selection changes
    Then the Message / Query field auto-populates: "We are interested in Artificial Intelligence and Full Stack Development training for our organization. Please share details about customized corporate training, duration and available programs."

  # --- PRIVACY & SECURITY ---
  Scenario: As a user, I see the privacy consent statement
    Given the form is displayed
    Then I see: "By submitting this form, you agree that SPRINT may contact you regarding your enquiry. Please read our Privacy Policy."

  # --- LOCATION / MAP SECTION ---
  Scenario: As a user, I see the Location/Map section after the enquiry form
    Given I scroll past the enquiry section
    Then I see heading: "Find Us Here"
    And supporting text: "Visit our campus for a guided tour, counselling session or any other assistance."
    And CTA: "Get Directions →"

  Scenario: As a desktop user, I see Location Information and Map side-by-side
    Given the page renders on desktop
    Then Location Information and Map are displayed in a two-column layout

  Scenario: As a mobile user, I see Location Information then Map sequentially
    Given the page renders on mobile
    When viewing the Location section
    Then Location Information appears first
    Then Map appears below

  # --- FAQ SECTION ---
  Scenario: As a user, I see FAQs organized by audience categories
    Given the FAQ section is displayed
    Then questions are organized by: Students, Working Professionals, Institutes, Companies/Enterprise
    And initially 8 questions are shown (2 per audience)

  Scenario: As a user, I can expand/collapse FAQ accordion items
    Given I interact with an FAQ item
    When I click to expand
    Then the answer displays with smooth animation
    And keyboard focus remains accessible
    When I click to collapse
    Then the answer hides

  Scenario: As a user, I can view all 30 FAQs via "View All" action
    Given I click "View All FAQs"
    Then a complete library of 30 FAQs is available
    And questions cover: Student enquiries, Course selection, Counselling, Programs, Learning modes, Professional development, Institute partnerships, Customized institutional training, Workshops, Corporate training, Skill-development requirements, Partnership proposals, Hiring/internship enquiries, Contact information, Response timelines, General support

  # --- FOOTER ---
  Scenario: As a user, I see the approved global footer
    Given the page renders
    Then the footer includes: quick links, contact information, social media links, Privacy Policy, Terms & Conditions
    And social media links primarily live in the footer (not competing with hero CTA)

  # --- RESPONSIVE DESIGN ---
  Scenario: As a user on any device, the page responds appropriately
    Given the page loads on: large desktop, standard desktop, laptop, tablet, large mobile, standard mobile, small mobile
    When I view the page
    Then no horizontal scrolling occurs
    And no overlapping elements appear
    And touch targets are appropriately sized
    And form layouts remain intact
    And no desktop-only interactions break on mobile

  # --- ACCESSIBILITY ---
  Scenario: As a screen reader user, I can navigate the page semantically
    Given the page renders
    Then semantic HTML is used throughout
    And correct heading hierarchy (H1, H2, H3) is maintained
    And all form fields have accessible labels
    And visible focus indicators are present
    And accessible form errors describe the problem
    And accordion components use accessible semantics
    And appropriate color contrast is maintained
    And meaningful alt text describes images
    And reduced-motion considerations are implemented
    And the mobile menu is accessible

  # --- PERFORMANCE ---
  Scenario: As a user on a mobile device, the page loads quickly
    Given the page loads on a typical mobile device
    When the page renders
    Then images are optimized
    And responsive image loading is implemented
    And lazy loading is used where appropriate
    And unnecessary JavaScript is avoided
    And fonts are optimized
    And layout shifts are minimized
    And animations are efficient

  # --- COMPONENT ARCHITECTURE ---
  Scenario: As a developer, I work with reusable, maintainable components
    Given the component structure:
    ContactUs/
    ├── ContactHero/
    ├── SocialLinks/
    ├── ContactMethods/
    ├── EnquirySection/
    │   ├── AudienceSelector/
    │   ├── StudentForm/
    │   ├── WorkingProfessionalForm/
    │   ├── InstituteForm/
    │   └── CompanyForm/
    ├── LocationSection/
    ├── FAQSection/
    ├── FAQAccordion/
    └── Footer/
    When I implement new features
    Then I use reusable components instead of large page components
    And form configuration and FAQ data are data-driven

  # --- SEO ---
  Scenario: As a search engine, I can index the page appropriately
    Given the page is rendered
    Then appropriate page title is set
    And meta description is provided
    And semantic headings structure is correct
    And Open Graph metadata is included
    And descriptive alt text is provided for images
    And crawlable links exist
    And canonical URL readiness is implemented
    And structured data is added where appropriate