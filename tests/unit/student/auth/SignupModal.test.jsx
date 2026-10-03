import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SignupModal from "@/components/student/auth/SignupModal";

/*
 * The modal generates a throw-away password with `crypto.getRandomValues`.
 * happy-dom does not always expose it, so provide a deterministic stand-in.
 */
if (
  typeof globalThis.crypto === "undefined" ||
  typeof globalThis.crypto.getRandomValues !== "function"
) {
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: {
      getRandomValues: (array) => {
        for (let index = 0; index < array.length; index += 1) {
          array[index] = (Math.random() * 256) | 0;
        }
        return array;
      },
    },
  });
}

/*
 * The modal talks to Supabase through the shared browser client. Each test
 * swaps in a fresh fake via `createSupabaseMock()`.
 */
const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: {
    auth: {
      signUp: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn(),
  },
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => supabaseMock,
}));

const createSupabaseMock = () => {
  supabaseMock.auth.signUp.mockReset();
  supabaseMock.auth.signOut.mockReset();
  supabaseMock.auth.resetPasswordForEmail.mockReset();
  supabaseMock.from.mockReset();

  supabaseMock.from.mockReturnValue({
    upsert: vi.fn().mockResolvedValue({ error: null }),
  });

  return supabaseMock;
};

const renderModal = (isOpen = true, onClose = vi.fn()) =>
  render(<SignupModal isOpen={isOpen} onClose={onClose} />);

const fillValidForm = async (user) => {
  await user.type(screen.getByLabelText(/first name/i), "Asha");
  await user.type(screen.getByLabelText(/last name/i), "Kumari");
  await user.type(screen.getByLabelText(/email address/i), "Asha@Example.com");
  await user.type(screen.getByLabelText(/mobile number/i), "9876543210");
};

describe("SignupModal", () => {
  beforeEach(() => {
    createSupabaseMock();
  });

  it("renders nothing while closed", () => {
    renderModal(false);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens as an accessible dialog with the four required fields", () => {
    renderModal();

    const dialog = screen.getByRole("dialog", { name: /create your account/i });
    expect(dialog).toHaveAttribute("aria-modal", "true");

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it("does not ask for a password during sign-up", () => {
    renderModal();

    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });

  it("closes via the close button and the Escape key", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderModal(true, onClose);
    await user.click(screen.getByRole("button", { name: /close sign up/i }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("shows required-field errors when the form is submitted empty", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      screen.getByText("Please enter your first name."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please enter your last name."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please enter your email address."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please enter your mobile number."),
    ).toBeInTheDocument();
    expect(supabaseMock.auth.signUp).not.toHaveBeenCalled();
  });

  it("rejects an invalid email and invalid mobile number", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/first name/i), "Asha");
    await user.type(screen.getByLabelText(/last name/i), "Kumari");
    await user.type(screen.getByLabelText(/email address/i), "not-an-email");
    await user.type(screen.getByLabelText(/mobile number/i), "12345");

    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      screen.getByText("Please enter a valid email address."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please enter a valid 10-digit mobile number."),
    ).toBeInTheDocument();
  });

  it("creates the Auth user, signs out, upserts the profile and shows the success state", async () => {
    const user = userEvent.setup();

    supabaseMock.auth.signUp.mockResolvedValue({
      data: {
        user: { id: "user-123", email_confirmed_at: null },
        session: null,
      },
      error: null,
    });

    renderModal();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(supabaseMock.auth.signUp).toHaveBeenCalledTimes(1);

    const signUpArgs = supabaseMock.auth.signUp.mock.calls[0][0];
    expect(signUpArgs.email).toBe("asha@example.com");
    expect(signUpArgs.password).toBeTruthy();
    expect(signUpArgs.options.data).toMatchObject({
      first_name: "Asha",
      last_name: "Kumari",
      mobile_number: "9876543210",
      role: "student",
    });
    expect(signUpArgs.options.emailRedirectTo).toContain("/set-password");

    expect(supabaseMock.auth.signOut).toHaveBeenCalledTimes(1);

    const upsert = supabaseMock.from.mock.results[0].value.upsert;
    expect(supabaseMock.from).toHaveBeenCalledWith("profiles");
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "user-123",
        first_name: "Asha",
        last_name: "Kumari",
        email: "asha@example.com",
        mobile_number: "9876543210",
        role: "student",
        status: "active",
      }),
      { onConflict: "id" },
    );

    expect(
      await screen.findByRole("heading", { name: /account created successfully/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Check your email to set your password."),
    ).toBeInTheDocument();
  });

  it("maps 'already registered' errors to a student-friendly message", async () => {
    const user = userEvent.setup();

    supabaseMock.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "User already registered" },
    });

    renderModal();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/already registered/i);
    expect(
      screen.queryByRole("heading", { name: /account created successfully/i }),
    ).not.toBeInTheDocument();
  });
});