import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EnrollmentWizard from "@/components/student/enrollment/EnrollmentWizard";
import { catalogueItems } from "@/data/courses";

// Step 2 loads its Course dropdown through the shared Supabase client; the
// mock answers with an empty table so the step falls back to the local
// catalogue without touching the network.
const supabaseMocks = vi.hoisted(() => ({
  from: vi.fn(() => ({
    select: () => ({
      eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
    }),
  })),
  getUser: vi.fn(),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
  signInWithOtp: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: supabaseMocks.from,
    auth: {
      getUser: supabaseMocks.getUser,
      onAuthStateChange: supabaseMocks.onAuthStateChange,
      signInWithOtp: supabaseMocks.signInWithOtp,
    },
  }),
}));

vi.mock("@/app/student/enroll/actions", () => ({
  submitStudentEnrollmentAction: vi.fn().mockResolvedValue({
    success: true,
    applicationId: "application-id",
    message: "Enrollment submitted.",
    passwordSetupEmailSent: true,
  }),
}));

const VALID = {
  firstName: "Ananya",
  lastName: "Sharma",
  email: "ananya@sprint.co.in",
  dob: "2004-06-15",
  state: "Karnataka",
  phone: "9876543210",
};

describe("EnrollmentWizard", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    supabaseMocks.getUser.mockResolvedValue({
      data: {
        user: {
          email: VALID.email,
          email_confirmed_at: "2026-01-01T00:00:00.000Z",
        },
      },
      error: null,
    });
    supabaseMocks.signInWithOtp.mockResolvedValue({ error: null });
  });

  const fillPersonalStep = async (user, overrides = {}) => {
    const values = { ...VALID, ...overrides };
    if (values.firstName)
      await user.type(screen.getByLabelText(/^first name/i), values.firstName);
    if (values.lastName)
      await user.type(screen.getByLabelText(/^last name/i), values.lastName);
    if (values.email)
      await user.type(screen.getByLabelText(/email address/i), values.email);
    // The date input takes its value directly — the keyboard types into the
    // individual date segments in a browser and not at all in jsdom.
    if (values.dob) {
      fireEvent.change(screen.getByLabelText(/date of birth/i), {
        target: { value: values.dob },
      });
    }
    if (values.state)
      await user.selectOptions(screen.getByLabelText(/^state/i), values.state);
    if (values.phone)
      await user.type(screen.getByLabelText(/phone number/i), values.phone);
  };

  const stepAppears = (name) =>
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: name === "Account" ? "Verify Your Email" : name,
      }),
    ).toBeInTheDocument();
  const continueButton = () =>
    screen.getByRole("button", { name: /^continue$/i });
  const clickContinue = async (user) => user.click(continueButton());

  it("opens on step 1 with the progress indicator and the fields to start an enrollment", () => {
    render(<EnrollmentWizard />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Start your enrollment" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Enrollment progress" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/step 1 of 3/i).length).toBeGreaterThan(0);

    expect(screen.getByLabelText(/^first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^country/i)).toHaveValue("India");
    expect(screen.getByLabelText(/^state/i)).toBeEnabled();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();

    // Step 1 has nothing to go back to.
    expect(continueButton()).toBeEnabled();
    expect(
      screen.queryByRole("button", { name: /^back$/i }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /already enrolled\? sign in/i }),
    ).toHaveAttribute("href", "/student/login");
  });

  it("blocks Continue until the required fields are filled and focuses the first one", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await clickContinue(user);

    expect(
      await screen.findByText("Please enter your first name."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please enter your last name."),
    ).toBeInTheDocument();
    expect(screen.getByText("Please enter your email.")).toBeInTheDocument();
    expect(
      screen.getByText("Please enter your date of birth."),
    ).toBeInTheDocument();
    expect(screen.getByText("Please select your state.")).toBeInTheDocument();
    expect(
      screen.getByText("Please enter your mobile number."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^first name/i)).toHaveFocus();

    stepAppears("Personal Information");
    expect(
      screen.queryByRole("heading", {
        level: 2,
        name: "Education & Career Profile",
      }),
    ).not.toBeInTheDocument();
  });

  it("rejects a malformed email and mobile number before moving on", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user, { email: "ananya@sprint", phone: "12345" });
    await clickContinue(user);

    expect(
      await screen.findByText("Please enter a valid email address."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please enter a valid 10-digit mobile number."),
    ).toBeInTheDocument();
    stepAppears("Personal Information");
  });

  it("carries the answers into the next step and brings them back", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    await clickContinue(user);

    stepAppears("Education & Career Profile");
    expect(screen.getAllByText(/step 2 of 3/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /^back$/i }));

    stepAppears("Personal Information");
    expect(screen.getByLabelText(/^first name/i)).toHaveValue(VALID.firstName);
    expect(screen.getByLabelText(/^last name/i)).toHaveValue(VALID.lastName);
    expect(screen.getByLabelText(/email address/i)).toHaveValue(VALID.email);
    expect(screen.getByLabelText(/date of birth/i)).toHaveValue(VALID.dob);
    expect(screen.getByLabelText(/^country/i)).toHaveValue("India");
    expect(screen.getByLabelText(/^state/i)).toHaveValue(VALID.state);
    expect(screen.getByLabelText(/phone number/i)).toHaveValue(VALID.phone);
  });

  it("clears a field error as soon as the student corrects it", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await clickContinue(user);
    expect(
      await screen.findByText("Please enter your first name."),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^first name/i), VALID.firstName);

    await waitFor(() =>
      expect(
        screen.queryByText("Please enter your first name."),
      ).not.toBeInTheDocument(),
    );
  });

  it("revisits a completed step from the progress indicator but cannot skip ahead", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    await clickContinue(user);

    expect(screen.getByRole("button", { name: /account/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /personal/i }));

    stepAppears("Personal Information");
    expect(screen.getByLabelText(/^first name/i)).toHaveValue(VALID.firstName);
  });

  it("shows the entered enrollment data in the account summary", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    await clickContinue(user);
    const courseSelect = await screen.findByLabelText(/^course$/i);
    await waitFor(() => expect(courseSelect).toBeEnabled());
    const selectedCourse = catalogueItems.find(
      (item) => item.kind === "course",
    );
    await user.selectOptions(courseSelect, selectedCourse.slug);
    await clickContinue(user);

    expect(screen.getByText("STEP 03")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Verify Your Email" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/verify that you can access this email address/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("Scaffolded")).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Verify your email address with a secure magic link before submitting your enrollment.",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Verify Your Email" }),
    ).toHaveAttribute("id", "enrollment-step-heading");

    const summary = screen.getByRole("region", { name: "Enrollment Summary" });
    expect(within(summary).getByText("Ananya Sharma")).toBeInTheDocument();
    expect(within(summary).getByText(VALID.email)).toBeInTheDocument();
    expect(within(summary).getByText(`+91 ${VALID.phone}`)).toBeInTheDocument();
    expect(within(summary).getByText(selectedCourse.title)).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Email verified" }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/is verified/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^back$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit enrollment/i }),
    ).toBeInTheDocument();
  });

  it("walks all three steps and ends on the summary of everything collected", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    for (let clicks = 0; clicks < 2; clicks += 1) await clickContinue(user);

    stepAppears("Account");
    expect(await screen.findByText(/is verified/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit enrollment/i }),
    ).toBeEnabled();

    await user.click(
      screen.getByRole("button", { name: /submit enrollment/i }),
    );

    expect(screen.getByText("Enrollment complete")).toBeInTheDocument();
    stepAppears("Your enrollment details are ready");
    expect(screen.getByText(VALID.firstName)).toBeInTheDocument();
    expect(screen.getByText(VALID.lastName)).toBeInTheDocument();
    expect(screen.getByText(VALID.email)).toBeInTheDocument();
    expect(screen.getByText(VALID.phone)).toBeInTheDocument();
    expect(
      screen.getByText(/your enrollment has been submitted/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^continue$/i }),
    ).not.toBeInTheDocument();
  });

  it("reopens the wizard with every answer intact from the summary", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    for (let clicks = 0; clicks < 2; clicks += 1) await clickContinue(user);
    await screen.findByText(/is verified/i);
    await user.click(
      screen.getByRole("button", { name: /submit enrollment/i }),
    );

    await user.click(
      screen.getByRole("button", { name: /review my details/i }),
    );

    stepAppears("Personal Information");
    expect(screen.getByLabelText(/^first name/i)).toHaveValue(VALID.firstName);
    expect(screen.getByLabelText(/phone number/i)).toHaveValue(VALID.phone);
    expect(continueButton()).toBeInTheDocument();
  });

  it("explains that email verification is required before submission", () => {
    render(<EnrollmentWizard />);

    expect(
      screen.getByText(/your email must be verified before your enrollment is submitted/i),
    ).toBeInTheDocument();
  });

  it("offers Skip for now on the optional step without blocking Continue", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    await clickContinue(user);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Education & Career Profile",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Optional")).toBeInTheDocument();
    expect(
      screen.getByText(/You can skip this step and complete it later/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^back$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /skip for now/i }),
    ).toHaveAttribute("type", "button");
    expect(continueButton()).toBeInTheDocument();

    // An untouched optional step must pass Continue — nothing is mandatory.
    await clickContinue(user);
    stepAppears("Account");
  });

  it("skips past the optional step and says where the profile can be finished later", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    await clickContinue(user);
    await user.click(screen.getByRole("button", { name: /skip for now/i }));

    stepAppears("Account");
    expect(
      screen.getByText(
        "You can complete your education & career profile later from your Student Dashboard.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
    // The skip is a decision, not a dead end — the wizard kept walking, and the
    // profile step now hands straight over to the last step (Account).
    expect(
      screen.getByRole("button", { name: /submit enrollment/i }),
    ).toBeInTheDocument();
  });

  it("keeps partial answers through a skip and back again", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    await clickContinue(user);

    await user.type(
      screen.getByLabelText(/course \/ degree/i),
      "B.Tech Computer Science",
    );
    await user.click(screen.getByRole("button", { name: /skip for now/i }));

    // Jump back from the progress indicator — everything typed is still there.
    await user.click(screen.getByRole("button", { name: /education/i }));

    stepAppears("Education & Career Profile");
    expect(screen.getByLabelText(/course \/ degree/i)).toHaveValue(
      "B.Tech Computer Science",
    );
    // The notice belonged to the landing step, so it is gone again.
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("lets the student start the optional step and still skip it, keeping the answers", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    await clickContinue(user);

    await user.type(screen.getByLabelText(/course \/ degree/i), "BCA");
    await user.selectOptions(
      screen.getByLabelText(/^current role/i),
      "Student",
    );
    await user.click(screen.getByRole("button", { name: /skip for now/i }));

    stepAppears("Account");

    // A started step is still skippable, and skipping never discards answers.
    await user.click(screen.getByRole("button", { name: /education/i }));
    stepAppears("Education & Career Profile");
    expect(screen.getByLabelText(/course \/ degree/i)).toHaveValue("BCA");
    expect(screen.getByLabelText(/^current role/i)).toHaveValue("Student");
  });

  it("sends a magic link and preserves the enrollment draft until verification", async () => {
    const user = userEvent.setup();
    supabaseMocks.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    await clickContinue(user);
    await clickContinue(user);

    await user.click(
      await screen.findByRole("button", { name: /send verification link/i }),
    );

    expect(supabaseMocks.signInWithOtp).toHaveBeenCalledWith({
      email: VALID.email,
      options: {
        data: {
          full_name: `${VALID.firstName} ${VALID.lastName}`,
          first_name: VALID.firstName,
          last_name: VALID.lastName,
          mobile_number: VALID.phone,
        },
        emailRedirectTo: new URL(
          "/student/enroll?email_verified=1",
          window.location.origin,
        ).toString(),
      },
    });
    expect(
      await screen.findByText(/a secure link was sent/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit enrollment/i }),
    ).toBeDisabled();
    expect(window.sessionStorage.getItem("student_enrollment_draft")).toContain(
      VALID.email,
    );
  });

  it("explains when Supabase rejects the magic-link redirect URL", async () => {
    const user = userEvent.setup();
    supabaseMocks.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });
    supabaseMocks.signInWithOtp.mockResolvedValue({
      error: {
        message: "Redirect URL is not allowed",
        code: "validation_failed",
      },
    });
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    await clickContinue(user);
    await clickContinue(user);
    await user.click(
      await screen.findByRole("button", { name: /send verification link/i }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      `Add this URL (or its wildcard form) under Authentication → URL Configuration → Redirect URLs`,
    );
    expect(
      screen.getByRole("button", { name: /submit enrollment/i }),
    ).toBeDisabled();
    expect(window.sessionStorage.getItem("student_enrollment_draft")).toContain(
      VALID.email,
    );
  });
});
