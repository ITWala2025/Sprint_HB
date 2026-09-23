# SPRINT Student Portal --- Sign Up Page UI Specification

## 1. Page Overview

The SPRINT Student Portal Sign Up page is a professional, clean,
corporate-style student registration page.

The page uses a split-screen design on laptop/desktop and a
single-column authentication layout on mobile.

### Core design goals

-   Professional SPRINT branding
-   Modern education/corporate appearance
-   Realistic student imagery on desktop
-   Clean white registration panel
-   Red, blue, navy, and white brand colors
-   Responsive design
-   Accessible form controls
-   Email-based registration only
-   Production-ready validation and UX

------------------------------------------------------------------------

# 2. Responsive Layout

## Desktop / Laptop

The page uses two columns:

``` text
┌──────────────────────────────┬─────────────────────────────────────┐
│                              │                                     │
│      SPRINT HERO IMAGE       │          SIGN UP FORM               │
│                              │                                     │
│      Learn. Grow. Succeed.   │          Create your account        │
│                              │                                     │
│      Program Benefits        │          Registration fields        │
│                              │                                     │
│      Student / Campus        │          Create Account              │
│      Visual                  │                                     │
│                              │          Continue with Email         │
│                              │                                     │
└──────────────────────────────┴─────────────────────────────────────┘
```

Recommended proportions:

``` text
Left Hero: 45–50%
Right Form: 50–55%
```

The layout should fill the available viewport height.

------------------------------------------------------------------------

# 3. Mobile Layout

### IMPORTANT REQUIREMENT

**The hero image must NOT be displayed on mobile.**

On screens below the mobile breakpoint, the entire left hero panel
should be hidden.

``` text
Desktop:
Hero Image + Sign Up Form

Mobile:
Sign Up Form Only
```

Recommended breakpoint:

``` css
@media (max-width: 767px)
```

### Mobile structure

``` text
┌──────────────────────────────┐
│                              │
│        SPRINT LOGO           │
│                              │
│     Create your account      │
│                              │
│     Registration Form        │
│                              │
│     Create Account           │
│                              │
│     Continue with Email      │
│                              │
│     Sign In                  │
│                              │
└──────────────────────────────┘
```

The form should use the complete available width with appropriate
horizontal padding.

------------------------------------------------------------------------

# 4. Left Hero Panel --- Desktop Only

Hero image:

``` text
/public/images/student-portal/
sprint-student-signup-left-panel-final.webp
```

The image should be displayed only on laptop/desktop.

### Image behavior

Use:

``` css
object-fit: cover;
```

The image should fill the hero panel without distortion.

### Hero content

The approved design uses:

``` text
SPRINT
School of Professional Studies & Information Technology

Learn.
Grow.
Succeed.
```

Supporting message:

``` text
Empowering learners
for a brighter tomorrow.
```

### Program benefits

Display four benefits:

``` text
Industry Relevant Programs
Expert Trainers
Practical Learning
Career Support
```

### Bottom message

``` text
Your Future
Our Focus
```

Use subtle SPRINT red/blue decorative accents.

------------------------------------------------------------------------

# 5. SPRINT Branding

Use the official SPRINT logo asset.

Do not recreate the logo using plain text if the official logo asset is
available.

Recommended colors:

``` text
Primary Red:       #EF233C
Primary Blue:      #063B78
Dark Navy:         #062B57
White:             #FFFFFF
Text Dark:         #101828
Muted Text:        #667085
Border:            #D0D5DD
Light Background:  #F8FAFC
```

------------------------------------------------------------------------

# 6. Right Authentication Panel

The right side contains the complete registration experience.

### Top navigation

At the top-right:

``` text
Already have an account?
Sign In
```

`Sign In` should be a clickable link.

------------------------------------------------------------------------

# 7. Main Heading

Heading:

``` text
Create your account
```

Supporting text:

``` text
Join SPRINT and take the next step towards your future.
```

The heading should be prominent but not oversized.

------------------------------------------------------------------------

# 8. Registration Form

## First Name

Label:

``` text
First Name
```

Placeholder:

``` text
Enter your first name
```

Required.

------------------------------------------------------------------------

## Last Name

Label:

``` text
Last Name
```

Placeholder:

``` text
Enter your last name
```

Required.

### Desktop layout

First Name and Last Name can appear side by side:

``` text
┌─────────────────────┐  ┌─────────────────────┐
│ First Name          │  │ Last Name           │
│ Enter first name    │  │ Enter last name     │
└─────────────────────┘  └─────────────────────┘
```

On mobile, stack them vertically.

------------------------------------------------------------------------

# 9. Username / Student ID

Label:

``` text
Username / Student ID
```

Placeholder:

``` text
Choose a username or student ID
```

Required.

------------------------------------------------------------------------

# 10. Email Address

Label:

``` text
Email Address
```

Placeholder:

``` text
Enter your email address
```

Required.

The email will be used for:

-   Account verification
-   Login
-   Password recovery
-   Important student communication

------------------------------------------------------------------------

# 11. Password

Label:

``` text
Password
```

Placeholder:

``` text
Create a password
```

Required.

Include:

-   Password icon
-   Show/hide password button

Password should be hidden by default.

------------------------------------------------------------------------

# 12. Confirm Password

Label:

``` text
Confirm Password
```

Placeholder:

``` text
Confirm your password
```

Required.

Include:

-   Show/hide password button
-   Password match validation

------------------------------------------------------------------------

# 13. Password Requirements

Display a compact password requirement helper.

``` text
Your password should contain:

✓ At least 8 characters
✓ One uppercase letter
✓ One lowercase letter
✓ One number
✓ One special character
```

Requirements can update visually as the user types.

------------------------------------------------------------------------

# 14. Terms & Privacy

Required checkbox:

``` text
☐ I agree to the Terms & Conditions and Privacy Policy
```

Make both links clickable.

The checkbox must be accessible and keyboard navigable.

If terms are required, the Create Account button should not submit until
consent is provided.

------------------------------------------------------------------------

# 15. Create Account Button

Primary CTA:

``` text
Create Account →
```

Use SPRINT red.

Recommended:

``` css
background: #EF233C;
```

Button states:

### Default

``` text
Create Account →
```

### Hover

Slightly darker red with subtle elevation.

### Loading

``` text
Creating Account...
```

Include a small loading indicator.

### Disabled

Muted appearance with disabled cursor.

### Error

Keep the button available after validation errors so the user can
correct and retry.

------------------------------------------------------------------------

# 16. Authentication Method

## IMPORTANT REQUIREMENT

The Sign Up page must **NOT** include:

-   Google Sign Up
-   Microsoft Sign Up
-   Apple Sign Up
-   LinkedIn Sign Up

Only email-based registration should be available.

### Alternative registration section

``` text
──────── OR SIGN UP WITH ────────

┌──────────────────────────────────────────┐
│        ✉  Continue with Email            │
└──────────────────────────────────────────┘
```

The only alternative option is:

``` text
Continue with Email
```

The button should be styled consistently with the rest of the
authentication UI.

------------------------------------------------------------------------

# 17. Email Registration Flow

The intended flow is:

``` text
Sign Up
   ↓
Enter registration details
   ↓
Client-side validation
   ↓
Create Account
   ↓
Email verification
   ↓
Verify email
   ↓
Student account activated
   ↓
Login / Student Dashboard
```

------------------------------------------------------------------------

# 18. Existing Account Link

At the bottom of the form:

``` text
Already have an account?
Sign In
```

Clicking `Sign In` should navigate to:

``` text
/student/login
```

------------------------------------------------------------------------

# 19. Form Validation

Required fields:

``` text
First Name
Last Name
Username / Student ID
Email Address
Password
Confirm Password
Terms & Conditions
```

### First Name

``` text
Please enter your first name.
```

### Last Name

``` text
Please enter your last name.
```

### Username / Student ID

``` text
Please enter a username or student ID.
```

### Email

``` text
Please enter your email address.
```

Invalid email:

``` text
Please enter a valid email address.
```

### Password

``` text
Please create a password.
```

### Confirm Password

``` text
Passwords do not match.
```

### Terms

``` text
Please accept the Terms & Conditions and Privacy Policy.
```

------------------------------------------------------------------------

# 20. Server-Side Validation

Frontend validation is not sufficient.

The backend should also validate:

-   Required fields
-   Email format
-   Username / Student ID uniqueness
-   Email uniqueness
-   Password strength
-   Terms acceptance
-   Input length
-   Malicious input

Never trust values submitted by the browser.

------------------------------------------------------------------------

# 21. Security Requirements

The registration system should support:

-   Password hashing
-   Secure authentication
-   Email verification
-   Rate limiting
-   Secure session/JWT handling
-   Secure cookies where appropriate
-   Input sanitization/validation
-   Password reset flow
-   Account enumeration protection
-   HTTPS in production

Never store passwords as plain text.

Never expose secret keys in frontend code.

------------------------------------------------------------------------

# 22. Accessibility

The page should support:

-   Semantic HTML
-   Proper `<form>` structure
-   `<label>` associated with every input
-   Keyboard navigation
-   Visible focus states
-   Accessible checkbox
-   Accessible password visibility buttons
-   Screen-reader-friendly validation messages
-   Sufficient contrast
-   Touch-friendly controls

Icon-only buttons must have an accessible label.

------------------------------------------------------------------------

# 23. Mobile UX

Because the hero image is hidden on mobile:

``` css
.auth-hero {
  display: block;
}

@media (max-width: 767px) {
  .auth-hero {
    display: none;
  }

  .auth-page {
    grid-template-columns: 1fr;
  }

  .auth-form-panel {
    width: 100%;
    min-height: 100vh;
  }
}
```

### Mobile form

Use:

``` text
width: 100%;
padding: 24px 20px;
```

Avoid excessively wide input fields or tiny text.

Recommended minimum touch target:

``` text
44px
```

------------------------------------------------------------------------

# 24. Suggested Next.js Structure

``` text
src/
├── app/
│   └── student/
│       ├── signup/
│       │   └── page.jsx
│       ├── login/
│       │   └── page.jsx
│       ├── forgot-password/
│       │   └── page.jsx
│       └── dashboard/
│           └── page.jsx
│
├── components/
│   └── student-auth/
│       ├── AuthHero.jsx
│       ├── SignupForm.jsx
│       ├── PasswordField.jsx
│       ├── EmailSignup.jsx
│       └── AuthFooter.jsx
│
├── css/
│   └── student-auth.css
│
└── public/
    └── images/
        └── student-portal/
            ├── sprint-student-login-left-panel.webp
            ├── sprint-student-signup-left-panel-final.webp
            └── sprint-student-forgot-password-left-panel.webp
```

------------------------------------------------------------------------

# 25. Recommended Component Structure

## `AuthHero.jsx`

Desktop-only hero panel.

Responsibilities:

-   SPRINT logo
-   Hero image
-   Headline
-   Supporting copy
-   Benefits
-   Decorative design

The component should not render visibly on mobile.

------------------------------------------------------------------------

## `SignupForm.jsx`

Responsibilities:

-   Registration fields
-   Password validation
-   Confirm password
-   Terms checkbox
-   Create Account
-   Loading state
-   Error handling

------------------------------------------------------------------------

## `PasswordField.jsx`

Reusable password input.

Features:

-   Show password
-   Hide password
-   Accessible button
-   Validation state

------------------------------------------------------------------------

## `EmailSignup.jsx`

Contains:

``` text
Continue with Email
```

This is the only alternative registration method.

------------------------------------------------------------------------

## `AuthFooter.jsx`

Example:

``` text
© 2026 SPRINT - School of Professional Studies & Information Technology.
All rights reserved.

Learn | Grow | Succeed
```

------------------------------------------------------------------------

# 26. Page Route

Recommended route:

``` text
/student/signup
```

Login:

``` text
/student/login
```

Forgot password:

``` text
/student/forgot-password
```

Student dashboard:

``` text
/student/dashboard
```

------------------------------------------------------------------------

# 27. Final Sign Up UI

``` text
DESKTOP

┌──────────────────────────┬───────────────────────────────────────┐
│                          │ Already have an account? Sign In      │
│                          │                                       │
│       SPRINT             │       Create your account             │
│                          │       Join SPRINT and take the        │
│    Learn.                │       next step towards your future.  │
│    Grow.                 │                                       │
│    Succeed.              │ First Name       Last Name            │
│                          │ [____________]   [____________]       │
│                          │                                       │
│  Industry Relevant       │ Username / Student ID                │
│  Expert Trainers         │ [_______________________________]     │
│  Practical Learning      │                                       │
│  Career Support          │ Email Address                         │
│                          │ [_______________________________]     │
│     Student Image        │                                       │
│                          │ Password        Confirm Password      │
│                          │ [__________]    [__________]          │
│                          │                                       │
│                          │ Password requirements                 │
│                          │                                       │
│                          │ ☐ Terms & Conditions / Privacy        │
│                          │                                       │
│                          │ [       Create Account →       ]      │
│                          │                                       │
│                          │ ───── OR SIGN UP WITH ─────           │
│                          │                                       │
│                          │ [      ✉ Continue with Email      ]   │
│                          │                                       │
│                          │ Already have an account? Sign In      │
└──────────────────────────┴───────────────────────────────────────┘
```

------------------------------------------------------------------------

# 28. Mobile Final UI

``` text
┌──────────────────────────────┐
│                              │
│          SPRINT              │
│                              │
│    Create your account       │
│    Join SPRINT and take      │
│    the next step towards     │
│    your future.              │
│                              │
│    First Name                │
│    [____________________]    │
│                              │
│    Last Name                 │
│    [____________________]    │
│                              │
│    Username / Student ID     │
│    [____________________]    │
│                              │
│    Email Address             │
│    [____________________]    │
│                              │
│    Password                  │
│    [____________________]    │
│                              │
│    Confirm Password          │
│    [____________________]    │
│                              │
│    ☐ Terms & Privacy         │
│                              │
│    [ Create Account → ]      │
│                              │
│    ── OR SIGN UP WITH ──     │
│                              │
│    [ ✉ Continue with Email ] │
│                              │
│    Already have an account?  │
│             Sign In          │
│                              │
└──────────────────────────────┘
```

**No hero image is displayed on mobile.**

------------------------------------------------------------------------

# 29. Final Acceptance Checklist

### Design

-   [x] Professional SPRINT appearance
-   [x] Split-screen desktop design
-   [x] Realistic SPRINT hero image
-   [x] White authentication panel
-   [x] Red/blue/navy branding
-   [x] Clean typography
-   [x] Responsive design

### Desktop

-   [x] Hero image visible
-   [x] Sign Up form visible
-   [x] Two-column layout
-   [x] Hero WebP fills left panel

### Mobile

-   [x] Hero image hidden
-   [x] Single-column form
-   [x] Full-width authentication experience
-   [x] Touch-friendly controls
-   [x] Responsive typography

### Registration

-   [x] First Name
-   [x] Last Name
-   [x] Username / Student ID
-   [x] Email
-   [x] Password
-   [x] Confirm Password
-   [x] Password requirements
-   [x] Terms & Privacy
-   [x] Create Account

### Authentication

-   [x] Email-only registration
-   [x] Continue with Email
-   [x] No Google
-   [x] No Microsoft
-   [x] No Apple
-   [x] No LinkedIn
-   [x] Sign In link

### Security

-   [x] Frontend validation
-   [x] Backend validation
-   [x] Password hashing
-   [x] Email verification
-   [x] Rate limiting
-   [x] Secure authentication

------------------------------------------------------------------------

# 30. Final Product Direction

The SPRINT Student Sign Up page should feel like a natural extension of
the main SPRINT website.

The final experience is:

``` text
SPRINT Website
      ↓
Student Sign Up
      ↓
Email Registration
      ↓
Email Verification
      ↓
Student Login
      ↓
Student Dashboard
```

The desktop experience emphasizes SPRINT's professional education
identity through the realistic hero image.

The mobile experience prioritizes usability by removing the hero image
and giving the registration form the full screen.

**Primary registration method: Email only.**
