import PasswordSetupStep from "./steps/PasswordSetupStep";
import PersonalInformationStep from "./steps/PersonalInformationStep";
import { DEFAULT_COUNTRY } from "./enrollment-locations";
import {
  validatePasswordSetup,
  validatePersonalInformation,
} from "./enrollment-validation";

/** The two-step registration: validated personal details/OTP, then password. */
export const ENROLLMENT_STEPS = [
  {
    id: "personal",
    label: "Personal",
    title: "Personal Information",
    description: "Enter your personal details and verify your email address.",
    Component: PersonalInformationStep,
    // Country is pre-seeded with India so the State select opens enabled with
    // the Indian list; the other seven fields start empty.
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      dob: "",
      city: "",
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
];

export const ENROLLMENT_STEP_COUNT = ENROLLMENT_STEPS.length;

export const ENROLLMENT_STEP_IDS = ENROLLMENT_STEPS.map((step) => step.id);

/** A pristine copy of the shared state, one key per step id. */
export const createEmptyEnrollment = () =>
  Object.fromEntries(ENROLLMENT_STEPS.map((step) => [step.id, { ...step.initialValues }]));
