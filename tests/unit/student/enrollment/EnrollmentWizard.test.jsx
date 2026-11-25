import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EnrollmentWizard from "@/components/student/enrollment/EnrollmentWizard";

const mocks = vi.hoisted(() => ({
  routerPush: vi.fn(),
  getSession: vi.fn(),
  signInWithOtp: vi.fn(),
  verifyOtp: vi.fn(),
  updateUser: vi.fn(),
  checkEnrollmentEmailAction: vi.fn(),
  submitStudentEnrollmentAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.routerPush }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: mocks.getSession,
      signInWithOtp: mocks.signInWithOtp,
      verifyOtp: mocks.verifyOtp,
      updateUser: mocks.updateUser,
    },
  }),
}));

vi.mock("@/app/student/enroll/actions", () => ({
  checkEnrollmentEmailAction: mocks.checkEnrollmentEmailAction,
  submitStudentEnrollmentAction: mocks.submitStudentEnrollmentAction,
}));

const VALID = {
  firstName: "Ananya",
  lastName: "Sharma",
  email: "ananya@sprint.co.in",
  phone: "9876543210",
  dob: "2004-06-15",
  city: "Ranchi",
  state: "Jharkhand",
};
const PASSWORD = "SprintPass1!";

describe("EnrollmentWizard", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mocks.checkEnrollmentEmailAction.mockResolvedValue({
      success: true,
      exists: false,
    });
    mocks.signInWithOtp.mockResolvedValue({ error: null });
    mocks.verifyOtp.mockResolvedValue({
      data: {
        session: {
          user: {
            email: VALID.email,
            email_confirmed_at: "2026-01-01T00:00:00.000Z",
          },
        },
      },
      error: null,
    });
    mocks.updateUser.mockResolvedValue({ error: null });
    mocks.submitStudentEnrollmentAction.mockResolvedValue({
      success: true,
      applicationId: "SPR-APP-2611-0001",
      message: "Registration saved.",
      hasCourseEnrollment: false,
    });
  });

  const fillPersonalStep = async (user, overrides = {}) => {
    const values = { ...VALID, ...overrides };
    for (const [label, value] of [
      [/^first name/i, values.firstName],
      [/^last name/i, values.lastName],
      [/email address/i, values.email],
      [/phone number/i, values.phone],
      [/^town \/ city/i, values.city],
    ]) {
      if (value) await user.type(screen.getByLabelText(label), value);
    }
    fireEvent.change(screen.getByLabelText(/date of birth/i), {
      target: { value: values.dob },
    });
    await user.selectOptions(screen.getByLabelText(/^state/i), values.state);
  };

  const verifyEmail = async (user) => {
    await user.click(
      await screen.findByRole("button", { name: /send verification code/i }),
    );
    expect(mocks.signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: VALID.email,
        options: expect.objectContaining({ shouldCreateUser: true }),
      }),
    );
    await user.type(await screen.findByLabelText(/digit 1/i), "123456");
    await user.click(screen.getByRole("button", { name: /verify code/i }));
    await screen.findByText(/email verified/i);
  };

  const continueButton = () =>
    screen.getByRole("button", { name: /^continue$/i });

  const createAndSubmitPassword = async (user) => {
    await user.type(
      screen.getByLabelText(/create password/i, { selector: "input" }),
      PASSWORD,
    );
    await user.type(
      screen.getByLabelText(/confirm password/i, { selector: "input" }),
      PASSWORD,
    );
    await user.click(
      screen.getByRole("button", { name: /complete registration/i }),
    );
    await screen.findByText("Registration complete");
  };

  it("uses only the personal-details/OTP and password steps, then confirms manually", async () => {
    const user = userEvent.setup();
    const { container } = render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    await verifyEmail(user);
    await user.click(continueButton());

    expect(
      screen.getByRole("heading", { name: /create your password/i }),
    ).toBeInTheDocument();
    expect(container.querySelector('input[name="email"][autocomplete="username"]')).toHaveValue(
      VALID.email,
    );
    expect(container.querySelector('input[name="email"][autocomplete="username"]')).toHaveAttribute(
      "hidden",
    );

    await createAndSubmitPassword(user);
    expect(mocks.updateUser).toHaveBeenCalledWith({ password: PASSWORD });
    expect(mocks.submitStudentEnrollmentAction).toHaveBeenCalledWith({
      personal: expect.objectContaining({ ...VALID, country: "India" }),
      education: {},
    });
    expect(screen.getByRole("button", { name: /go to dashboard/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /education/i })).not.toBeInTheDocument();
  });

  it("validates all personal fields before email lookup or OTP requests", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);
    await user.type(screen.getByLabelText(/email address/i), VALID.email);

    expect(mocks.getSession).not.toHaveBeenCalled();
    expect(mocks.checkEnrollmentEmailAction).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /send verification code/i })).not.toBeInTheDocument();

    await user.click(continueButton());
    expect(await screen.findByText(/please enter your first name/i)).toBeInTheDocument();
    expect(mocks.signInWithOtp).not.toHaveBeenCalled();
  });

  it("shows a clear verification error when the user tries to advance before verifying", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);
    await fillPersonalStep(user);
    await waitFor(() => expect(mocks.checkEnrollmentEmailAction).toHaveBeenCalled());
    await user.click(continueButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /verify your email address before continuing/i,
    );
    expect(screen.getByRole("heading", { name: /personal information/i })).toBeInTheDocument();
  });

  it("routes an existing email to login while preserving the requested course", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard nextPath="/courses/cloud-engineering" />);
    mocks.checkEnrollmentEmailAction.mockResolvedValue({
      success: true,
      exists: true,
    });
    await fillPersonalStep(user);

    await user.click(
      await screen.findByRole("button", { name: /log in to existing account/i }),
    );
    expect(mocks.routerPush).toHaveBeenCalledWith(
      "/student/login?next=%2Fcourses%2Fcloud-engineering",
    );
    expect(mocks.signInWithOtp).not.toHaveBeenCalled();
  });

  it("does not accept an OTP response without a matching verified session", async () => {
    const user = userEvent.setup();
    mocks.verifyOtp.mockResolvedValue({
      data: {
        user: {
          email: VALID.email,
          email_confirmed_at: "2026-01-01T00:00:00.000Z",
        },
      },
      error: null,
    });
    render(<EnrollmentWizard />);
    await fillPersonalStep(user);
    await user.click(
      await screen.findByRole("button", { name: /send verification code/i }),
    );
    await user.type(await screen.findByLabelText(/digit 1/i), "123456");
    await user.click(screen.getByRole("button", { name: /verify code/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /did not create a verified session/i,
    );
    expect(continueButton()).toBeEnabled();
  });
});
