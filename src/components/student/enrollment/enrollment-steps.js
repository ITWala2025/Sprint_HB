import EducationStep from "./steps/EducationStep";
import PasswordSetupStep from "./steps/PasswordSetupStep";
import PersonalInformationStep from "./steps/PersonalInformationStep";
import { DEFAULT_COUNTRY } from "./enrollment-locations";
import {
  validateEducationProfile,
  validatePasswordSetup,
  validatePersonalInformation,
} from "./enrollment-validation";

/**
 * The enrollment wizard, described once.
 *
 * Contract every step keeps:
 * - `id` doubles as the key in the wizard's shared state (personal, password,
 *   education) *and* as the id prefix of its fields
 *   (`${id}-${fieldName}`), which is how the wizard focuses the first invalid
 *   field after a failed submit.
 * - `initialValues` seeds that slice of state, so switching steps back and forth
 *   always renders what the student already typed.
 * - `validate(values)` returns a `{ field: message }` map; `compactErrors` drops
 *   the valid entries.
 *
 * The personal step verifies the student's email before the password step.
 *
 * `isOptional` marks a step the student may skip: the wizard then renders the
 * third "Skip for now" action in the footer and shows `skipNotice` on the step
 * they land on, so a skip is visible rather than silent. `isOptional` also drives
 * the "Optional" chip in the step panel and the extra bottom spacing mobile
 * needs for the taller three-action bar.
 */
export const ENROLLMENT_STEPS = [
  {
    id: "personal",
    label: "Personal",
    title: "Personal Information",
    description: "Start with the details we need to open your enrollment file.",
    Component: PersonalInformationStep,
    // Country is pre-seeded with India so the State select opens enabled with
    // the Indian list; the other six fields start empty.
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      dob: "",
      country: DEFAULT_COUNTRY,
      state: "",
      phone: "",
    },
    validate: validatePersonalInformation,
    isScaffolded: false,
  },
  {
    id: "password",
    label: "Password",
    title: "Create Your Password",
    description:
      "Set a password for your new Student Portal account before continuing.",
    Component: PasswordSetupStep,
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validate: validatePasswordSetup,
    isScaffolded: false,
  },
  {
    id: "education",
    label: "Education",
    title: "Education & Career Profile",
    description:
      "Help us understand your background and career interests. You can skip this step and complete it later from your Student Dashboard.",
    Component: EducationStep,
    // Five optional fields map to college_institution, course_degree,
    // year_semester, employment_status, and registrations.course_id (the
    // course id the Course dropdown stores).
    initialValues: {
      collegeInstitution: "",
      courseDegree: "",
      semesterYear: "",
      currentRole: "",
      course: "",
    },
    validate: validateEducationProfile,
    isScaffolded: false,
    isOptional: true,
    skipNotice:
      "You can complete your education & career profile later from your Student Dashboard.",
  },
];

export const ENROLLMENT_STEP_COUNT = ENROLLMENT_STEPS.length;

export const ENROLLMENT_STEP_IDS = ENROLLMENT_STEPS.map((step) => step.id);

/** A pristine copy of the shared state, one key per step id. */
export const createEmptyEnrollment = () =>
  Object.fromEntries(ENROLLMENT_STEPS.map((step) => [step.id, { ...step.initialValues }]));
