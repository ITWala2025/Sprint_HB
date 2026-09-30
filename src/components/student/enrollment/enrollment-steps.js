import AccountStep from "./steps/AccountStep";
import EducationStep from "./steps/EducationStep";
import LearningPathStep from "./steps/LearningPathStep";
import PersonalInformationStep from "./steps/PersonalInformationStep";
import SpecializationStep from "./steps/SpecializationStep";
import {
  validateEducationProfile,
  validateNoFieldsYet,
  validatePersonalInformation,
} from "./enrollment-validation";

/**
 * The enrollment wizard, described once.
 *
 * Contract every step keeps:
 * - `id` doubles as the key in the wizard's shared state (personal, education,
 *   specialization, learningPath, account) *and* as the id prefix of its fields
 *   (`${id}-${fieldName}`), which is how the wizard focuses the first invalid
 *   field after a failed submit.
 * - `initialValues` seeds that slice of state, so switching steps back and forth
 *   always renders what the student already typed.
 * - `validate(values)` returns a `{ field: message }` map; `compactErrors` drops
 *   the valid entries.
 *
 * Steps 3-5 are still scaffolded in this phase (`isScaffolded`) — they already
 * own their label, copy, state slice and navigation slot, so landing their forms
 * is a change inside `steps/*.jsx` only.
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
    initialValues: { name: "", email: "", phone: "" },
    validate: validatePersonalInformation,
    isScaffolded: false,
  },
  {
    id: "education",
    label: "Education",
    title: "Education & Career Profile",
    description:
      "Help us understand your background and career interests. You can skip this step and complete it later from your Student Dashboard.",
    Component: EducationStep,
    initialValues: {
      level: "",
      institution: "",
      degree: "",
      year: "",
      graduationYear: "",
      city: "",
      state: "",
      currentRole: "",
    },
    validate: validateEducationProfile,
    isScaffolded: false,
    isOptional: true,
    skipNotice:
      "You can complete your education & career profile later from your Student Dashboard.",
  },
  {
    id: "specialization",
    label: "Specialization",
    title: "Specialization",
    description: "Choose the program and track you want to specialise in.",
    Component: SpecializationStep,
    // `track` is the answer Step 2 collects (see steps/EducationStep.jsx) and the
    // state this step will read when its own form lands.
    initialValues: { track: "" },
    validate: validateNoFieldsYet,
    isScaffolded: true,
  },
  {
    id: "learningPath",
    label: "Learning Path",
    title: "Learning Path",
    description: "Decide how and when you want to attend classes.",
    Component: LearningPathStep,
    initialValues: {},
    validate: validateNoFieldsYet,
    isScaffolded: true,
  },
  {
    id: "account",
    label: "Account",
    title: "Account",
    description: "Set up the Student Portal account you will sign in with.",
    Component: AccountStep,
    initialValues: {},
    validate: validateNoFieldsYet,
    isScaffolded: true,
  },
];

export const ENROLLMENT_STEP_COUNT = ENROLLMENT_STEPS.length;

export const ENROLLMENT_STEP_IDS = ENROLLMENT_STEPS.map((step) => step.id);

/** A pristine copy of the shared state, one key per step id. */
export const createEmptyEnrollment = () =>
  Object.fromEntries(ENROLLMENT_STEPS.map((step) => [step.id, { ...step.initialValues }]));
