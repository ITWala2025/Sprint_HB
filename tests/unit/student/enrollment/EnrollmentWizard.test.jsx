import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import EnrollmentWizard from "@/components/student/enrollment/EnrollmentWizard";

const VALID = {
  name: "Ananya Sharma",
  email: "ananya@sprint.co.in",
  phone: "98765 43210",
};

describe("EnrollmentWizard", () => {
  const fillPersonalStep = async (user, overrides = {}) => {
    const values = { ...VALID, ...overrides };
    if (values.name) await user.type(screen.getByLabelText(/full name/i), values.name);
    if (values.email) await user.type(screen.getByLabelText(/email address/i), values.email);
    if (values.phone) await user.type(screen.getByLabelText(/mobile number/i), values.phone);
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
    expect(screen.getAllByText(/step 1 of 5/i).length).toBeGreaterThan(0);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();

    // Step 1 has nothing to go back to.
    expect(continueButton()).toBeEnabled();
    expect(screen.queryByRole("button", { name: /^back$/i })).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: /already enrolled\? sign in/i })).toHaveAttribute(
      "href",
      "/student/login",
    );
  });

  it("blocks Continue until the three required fields are filled and focuses the first one", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await clickContinue(user);

    expect(await screen.findByText("Please enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Please enter your email.")).toBeInTheDocument();
    expect(screen.getByText("Please enter your mobile number.")).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toHaveFocus();

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
    expect(screen.getAllByText(/step 2 of 5/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /^back$/i }));

    stepAppears("Personal Information");
    expect(screen.getByLabelText(/full name/i)).toHaveValue(VALID.name);
    expect(screen.getByLabelText(/email address/i)).toHaveValue(VALID.email);
    expect(screen.getByLabelText(/mobile number/i)).toHaveValue(VALID.phone);
  });

  it("clears a field error as soon as the student corrects it", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await clickContinue(user);
    expect(await screen.findByText("Please enter your full name.")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/full name/i), VALID.name);

    await waitFor(() =>
      expect(screen.queryByText("Please enter your full name.")).not.toBeInTheDocument(),
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
    expect(screen.getByLabelText(/full name/i)).toHaveValue(VALID.name);
  });

  it("describes the scaffolded steps until their forms land", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    await clickContinue(user);
    await clickContinue(user); // Step 2 is real now — the scaffold lives one step further on.

    expect(screen.getByText("This step is scaffolded for now.")).toBeInTheDocument();
    expect(screen.getByText("Preferred cohort start date")).toBeInTheDocument();
    expect(screen.getByText("Scaffolded")).toBeInTheDocument();
  });

  it("walks all five steps and ends on the summary of everything collected", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    for (let clicks = 0; clicks < 4; clicks += 1) await clickContinue(user);

    stepAppears("Account");
    expect(screen.getByRole("button", { name: /submit enrollment/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /submit enrollment/i }));

    expect(screen.getByText("Enrollment complete")).toBeInTheDocument();
    stepAppears("Your enrollment details are ready");
    expect(screen.getByText(VALID.name)).toBeInTheDocument();
    expect(screen.getByText(VALID.email)).toBeInTheDocument();
    expect(screen.getByText(VALID.phone)).toBeInTheDocument();
    expect(screen.getByText(/nothing has been submitted/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^continue$/i })).not.toBeInTheDocument();
  });

  it("reopens the wizard with every answer intact from the summary", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    for (let clicks = 0; clicks < 4; clicks += 1) await clickContinue(user);
    await user.click(screen.getByRole("button", { name: /submit enrollment/i }));

    await user.click(screen.getByRole("button", { name: /review my details/i }));

    stepAppears("Personal Information");
    expect(screen.getByLabelText(/full name/i)).toHaveValue(VALID.name);
    expect(screen.getByLabelText(/mobile number/i)).toHaveValue(VALID.phone);
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
    stepAppears("Specialization");
  });

  it("skips past the optional step and says where the profile can be finished later", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    await clickContinue(user);
    await user.click(screen.getByRole("button", { name: /skip for now/i }));

    stepAppears("Specialization");
    expect(
      screen.getByText(
        "You can complete your education & career profile later from your Student Dashboard.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
    // The skip is a decision, not a dead end — the wizard kept walking.
    expect(screen.getByRole("button", { name: /^continue$/i })).toBeInTheDocument();
  });

  it("keeps partial answers through a skip and back again", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    await clickContinue(user);

    await user.type(screen.getByLabelText(/city/i), "Bengaluru");
    await user.click(screen.getByLabelText("AI Engineer"));
    await user.click(screen.getByRole("button", { name: /skip for now/i }));

    // Jump back from the progress indicator — everything typed is still there.
    await user.click(screen.getByRole("button", { name: /education/i }));

    stepAppears("Education & Career Profile");
    expect(screen.getByLabelText(/city/i)).toHaveValue("Bengaluru");
    expect(screen.getByLabelText("AI Engineer")).toBeChecked();
    // The notice belonged to the landing step, so it is gone again.
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("validates graduation year on Continue but never lets it block a skip", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    await clickContinue(user);

    await user.type(screen.getByLabelText(/graduation year/i), "20");
    await clickContinue(user);

    expect(await screen.findByText(/please enter a 4-digit year/i)).toBeInTheDocument();
    stepAppears("Education & Career Profile");
    expect(screen.getByLabelText(/graduation year/i)).toHaveFocus();

    // Same broken answer must not trap the student: skip bypasses validation.
    await user.click(screen.getByRole("button", { name: /skip for now/i }));
    stepAppears("Specialization");
  });
});
