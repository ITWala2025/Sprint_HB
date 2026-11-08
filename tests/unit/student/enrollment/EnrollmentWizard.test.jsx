import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EnrollmentWizard from "@/components/student/enrollment/EnrollmentWizard";
import { catalogueItems } from "@/data/courses";

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
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    }),
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
  dob: "2004-06-15",
  state: "Jharkhand",
  phone: "9876543210",
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
        user: {
          email: VALID.email,
          email_confirmed_at: "2026-01-01T00:00:00.000Z",
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
    await user.type(screen.getByLabelText(/^first name/i), values.firstName);
    await user.type(screen.getByLabelText(/^last name/i), values.lastName);
    await user.type(screen.getByLabelText(/email address/i), values.email);
    fireEvent.change(screen.getByLabelText(/date of birth/i), {
      target: { value: values.dob },
    });
    await user.selectOptions(screen.getByLabelText(/^state/i), values.state);
    await user.type(screen.getByLabelText(/phone number/i), values.phone);
  };

  const verifyEmail = async (user) => {
    await user.click(await screen.findByRole("button", { name: /send verification code/i }));
    expect(mocks.signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: VALID.email,
        options: expect.objectContaining({ shouldCreateUser: true }),
      }),
    );
const firstOtp = await screen.findByLabelText(/digit 1/i);
await user.type(firstOtp, "123456");
    await user.click(screen.getByRole("button", { name: /verify code/i }));
    await screen.findByText(/email verified/i);
  };

  const continueButton = () => screen.getByRole("button", { name: /^continue$/i });

  const createPassword = async (user) => {
    await user.type(
      screen.getByLabelText(/create password/i, { selector: "input" }),
      PASSWORD,
    );
    await user.type(
      screen.getByLabelText(/confirm password/i, { selector: "input" }),
      PASSWORD,
    );
    await user.click(continueButton());
    await waitFor(() => expect(mocks.updateUser).toHaveBeenCalledWith({ password: PASSWORD }));
  };

  const finishPersonalAndPassword = async (user) => {
    await fillPersonalStep(user);
    await verifyEmail(user);
    await user.click(continueButton());
    expect(screen.getByRole("heading", { name: /create your password/i })).toBeInTheDocument();
    await createPassword(user);
  };

  it("verifies a new email with OTP and sets a password before education", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    expect(continueButton()).toBeDisabled();
    await verifyEmail(user);
    await user.click(continueButton());

    expect(screen.getByRole("heading", { name: /create your password/i })).toBeInTheDocument();
    expect(
      screen.getByLabelText(/create password/i, { selector: "input" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    await createPassword(user);

    expect(
      screen.getByRole("heading", { name: "Education & Career Profile" }),
    ).toBeInTheDocument();
  });

  it("treats a missing auth session as unauthenticated and still offers OTP", async () => {
    const user = userEvent.setup();
    mocks.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);

    expect(
      await screen.findByRole("button", { name: /send verification code/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("routes existing emails to login or recovery without sending an OTP", async () => {
    const user = userEvent.setup();
    mocks.checkEnrollmentEmailAction.mockResolvedValue({
      success: true,
      exists: true,
    });
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);

    const login = await screen.findByRole("button", {
      name: /log in to existing account/i,
    });
    await user.click(login);
    expect(mocks.signInWithOtp).not.toHaveBeenCalled();
    expect(mocks.routerPush).toHaveBeenCalledWith(
      "/student/login?next=%2Fstudent%2Fdashboard",
    );
  });

  it("allows changing the email after requesting a code", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await fillPersonalStep(user);
    await user.click(await screen.findByRole("button", { name: /send verification code/i }));

    const emailField = screen.getByLabelText(/email address/i);
    expect(emailField).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /use a different email/i }));
    expect(emailField).toBeEnabled();
    expect(screen.queryByLabelText(/six-digit verification code/i)).not.toBeInTheDocument();

    await user.clear(emailField);
    await user.type(emailField, "new-student@sprint.co.in");
    await screen.findByRole("button", { name: /send verification code/i });
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
    await user.click(await screen.findByRole("button", { name: /send verification code/i }));
    await user.type(await screen.findByLabelText(/digit 1/i), "123456");
    await user.click(screen.getByRole("button", { name: /verify code/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /did not create a verified session/i,
    );
    expect(continueButton()).toBeDisabled();
  });

  it("allows skipping education and submits empty course and bundle arrays", async () => {
    const user = userEvent.setup();
    render(<EnrollmentWizard />);

    await finishPersonalAndPassword(user);
    await user.click(screen.getByRole("button", { name: /skip for now/i }));

    await screen.findByText(/your registration has been saved/i);
    expect(mocks.submitStudentEnrollmentAction).toHaveBeenCalledWith(
      expect.objectContaining({
        education: expect.objectContaining({
          courseIds: [],
          bundleIds: [],
        }),
      }),
    );
    expect(screen.getByRole("link", { name: /go to student dashboard/i })).toHaveAttribute(
      "href",
      "/student/dashboard",
    );
    await waitFor(
      () => expect(mocks.routerPush).toHaveBeenCalledWith("/student/dashboard"),
      { timeout: 3000 },
    );
  });

  it("submits a selected course as an enrollment product", async () => {
    const user = userEvent.setup();
    mocks.submitStudentEnrollmentAction.mockResolvedValue({
      success: true,
      applicationId: "SPR-APP-2611-0002",
      message: "Enrollment submitted.",
      hasCourseEnrollment: true,
    });
    render(<EnrollmentWizard />);

    await finishPersonalAndPassword(user);
    await user.type(
      screen.getByLabelText(/college \/ institution/i),
      "SPRINT Test College",
    );
    const courseSelect = await screen.findByLabelText(/^course$/i);
    await waitFor(() => expect(courseSelect).toBeEnabled());
    const course = catalogueItems.find((item) => item.kind === "course");
    await user.selectOptions(courseSelect, course.slug);
    await user.click(screen.getByRole("button", { name: /submit enrollment/i }));

    await screen.findByText(/registration and course enrollment have been submitted/i);
    expect(mocks.submitStudentEnrollmentAction).toHaveBeenCalledWith(
      expect.objectContaining({
        education: expect.objectContaining({
          collegeInstitution: "SPRINT Test College",
          courseIds: [course.slug],
          bundleIds: [],
        }),
      }),
    );
  });
});
