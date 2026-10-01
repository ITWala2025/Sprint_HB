import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import EnrollmentWizard from "@/components/student/enrollment/EnrollmentWizard";

// Step 2 loads its Course dropdown through the shared Supabase client; the
// mock answers with an empty table so the step falls back to the local
// catalogue without touching the network.
const supabaseMocks = vi.hoisted(() => ({
  from: vi.fn(() => ({
    select: () => ({
      eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
    }),
  })),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ from: supabaseMocks.from }),
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
  const fillPersonalStep = async (user, overrides = {}) => {
    const values = { ...VALID, ...overrides };
    if (values.firstName) await user.type(screen.getByLabelText(/^first name/i), values.firstName);
    if (values.lastName) await user.type(screen.getByLabelText(/^last name/i), values.lastName);
    if (values.email) await user.type(screen.getByLabelText(/email address/i), values.email);
    // The date input takes its value directly — the keyboard types into the
    // individual date segments in a browser and not at all in jsdom.
    if (values.dob) {
      fireEvent.change(screen.getByLabelText(/date of birth/i), {
        target: { value: values.dob },
      });
    }
    if (values.state) await user.selectOptions(screen.getByLabelText(/^state/i), values.state);
    if (values.phone) await user.type(screen.getByLabelText(/phone number/i), values.phone);
  };

  const stepAppears = (name) =>
    expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
  const continueButton = () => screen.getByRole("button", { name: /^continue$/i });
  const clickContinue = async (user) => user.click(continueButton());

  it("opens on step 1 with the progress indicator and the fields to start an enrollment", () => {
    render(<EnrollmentWizard />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Start your enrollment" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Enrollment progress" })).toBeInTheDocument();
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
    expect(screen.queryByRole("button", { name: /^back$/i })).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: /already enrolled\? sign in/i })).toHaveAttribute(
      "href",
      "/student/login",
    );
  });

  it("blocks Continue until the required fields are filled and focuses the first one", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await clickContinue(user);

    expect(await screen.findByText("Please enter your first name.")).toBeInTheDocument();
    expect(screen.getByText("Please enter your last name.")).toBeInTheDocument();
    expect(screen.getByText("Please enter your email.")).toBeInTheDocument();
    expect(screen.getByText("Please enter your date of birth.")).toBeInTheDocument();
    expect(screen.getByText("Please select your state.")).toBeInTheDocument();
    expect(screen.getByText("Please enter your mobile number.")).toBeInTheDocument();
    expect(screen.getByLabelText(/^first name/i)).toHaveFocus();

    stepAppears("Personal Information");
    expect(
      screen.queryByRole("heading", { level: 2, name: "Education & Career Profile" }),
    ).not.toBeInTheDocument();
  });

  it("rejects a malformed email and mobile number before moving on", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user, { email: "ananya@sprint", phone: "12345" });
    await clickContinue(user);

    expect(await screen.findByText("Please enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Please enter a valid 10-digit mobile number.")).toBeInTheDocument();
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
    expect(await screen.findByText("Please enter your first name.")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^first name/i), VALID.firstName);

    await waitFor(() =>
      expect(screen.queryByText("Please enter your first name.")).not.toBeInTheDocument(),
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

  it("describes the scaffolded step until its form lands", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    await clickContinue(user);
    await clickContinue(user); // Step 2 is real; the scaffold lives on the last step.

    expect(screen.getByText("This step is scaffolded for now.")).toBeInTheDocument();
    expect(screen.getByText("Portal password and confirmation")).toBeInTheDocument();
    expect(screen.getByText("Scaffolded")).toBeInTheDocument();
  });

  it("walks all three steps and ends on the summary of everything collected", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    for (let clicks = 0; clicks < 2; clicks += 1) await clickContinue(user);

    stepAppears("Account");
    expect(screen.getByRole("button", { name: /submit enrollment/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /submit enrollment/i }));

    expect(screen.getByText("Enrollment complete")).toBeInTheDocument();
    stepAppears("Your enrollment details are ready");
    expect(screen.getByText(VALID.firstName)).toBeInTheDocument();
    expect(screen.getByText(VALID.lastName)).toBeInTheDocument();
    expect(screen.getByText(VALID.email)).toBeInTheDocument();
    expect(screen.getByText(VALID.phone)).toBeInTheDocument();
    expect(screen.getByText(/nothing has been submitted/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^continue$/i })).not.toBeInTheDocument();
  });

  it("reopens the wizard with every answer intact from the summary", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    for (let clicks = 0; clicks < 2; clicks += 1) await clickContinue(user);
    await user.click(screen.getByRole("button", { name: /submit enrollment/i }));

    await user.click(screen.getByRole("button", { name: /review my details/i }));

    stepAppears("Personal Information");
    expect(screen.getByLabelText(/^first name/i)).toHaveValue(VALID.firstName);
    expect(screen.getByLabelText(/phone number/i)).toHaveValue(VALID.phone);
    expect(continueButton()).toBeInTheDocument();
  });

  it("keeps the preview notice on the page", () => {
    render(<EnrollmentWizard />);

    expect(screen.getByText(/nothing is submitted to SPRINT/i)).toBeInTheDocument();
  });

  it("offers Skip for now on the optional step without blocking Continue", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    await clickContinue(user);

    expect(screen.getByRole("heading", { level: 2, name: "Education & Career Profile" })).toBeInTheDocument();
    expect(screen.getByText("Optional")).toBeInTheDocument();
    expect(screen.getByText(/You can skip this step and complete it later/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^back$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /skip for now/i })).toHaveAttribute("type", "button");
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
    expect(screen.getByRole("button", { name: /submit enrollment/i })).toBeInTheDocument();
  });

  it("keeps partial answers through a skip and back again", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    await clickContinue(user);

    await user.type(screen.getByLabelText(/course \/ degree/i), "B.Tech Computer Science");
    await user.click(screen.getByRole("button", { name: /skip for now/i }));

    // Jump back from the progress indicator — everything typed is still there.
    await user.click(screen.getByRole("button", { name: /education/i }));

    stepAppears("Education & Career Profile");
    expect(screen.getByLabelText(/course \/ degree/i)).toHaveValue("B.Tech Computer Science");
    // The notice belonged to the landing step, so it is gone again.
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("lets the student start the optional step and still skip it, keeping the answers", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    await clickContinue(user);

    await user.type(screen.getByLabelText(/course \/ degree/i), "BCA");
    await user.selectOptions(screen.getByLabelText(/^current role/i), "Student");
    await user.click(screen.getByRole("button", { name: /skip for now/i }));

    stepAppears("Account");

    // A started step is still skippable, and skipping never discards answers.
    await user.click(screen.getByRole("button", { name: /education/i }));
    stepAppears("Education & Career Profile");
    expect(screen.getByLabelText(/course \/ degree/i)).toHaveValue("BCA");
    expect(screen.getByLabelText(/^current role/i)).toHaveValue("Student");
  });
});
