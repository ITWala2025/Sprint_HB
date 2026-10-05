import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LogoutButton from "@/components/student/LogoutButton";
import {
  LOGOUT_REDIRECT_PATH,
  STUDENT_SESSION_STORAGE_KEYS,
  STUDENT_SIGNOUT_FLAG,
  clearStudentSessionCache,
  consumeStudentSignOutFlag,
} from "@/components/student/student-session";

/* The button talks to Supabase through the shared browser client. */
const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: {
    auth: {
      signOut: vi.fn(),
    },
  },
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => supabaseMock,
}));

const logoutButton = () => screen.getByRole("button", { name: /logout/i });

describe("LogoutButton", () => {
  let assign;

  beforeEach(() => {
    supabaseMock.auth.signOut.mockReset();
    supabaseMock.auth.signOut.mockResolvedValue({ error: null });

    /* The redirect is a hard navigation; intercept it so the suite stays put. */
    assign = vi.fn();
    vi.spyOn(window.location, "assign").mockImplementation(assign);

    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it("renders a clearly labelled Logout control", () => {
    render(<LogoutButton />);

    const button = logoutButton();
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveTextContent("Logout");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("invalidates the session and returns the student to Sign In", async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);

    await user.click(logoutButton());

    await waitFor(() => {
      expect(supabaseMock.auth.signOut).toHaveBeenCalledTimes(1);
    });
    expect(assign).toHaveBeenCalledWith(LOGOUT_REDIRECT_PATH);
    expect(LOGOUT_REDIRECT_PATH).toBe("/student/login");
  });

  it("clears learner-scoped cached data on the way out", async () => {
    const user = userEvent.setup();
    STUDENT_SESSION_STORAGE_KEYS.forEach((key) => {
      window.sessionStorage.setItem(key, "learner@example.com");
      window.localStorage.setItem(key, "learner@example.com");
    });
    /* Unrelated browser state must survive the purge. */
    window.localStorage.setItem("theme", "dark");

    render(<LogoutButton />);
    await user.click(logoutButton());

    await waitFor(() => expect(assign).toHaveBeenCalled());
    STUDENT_SESSION_STORAGE_KEYS.forEach((key) => {
      expect(window.sessionStorage.getItem(key)).toBeNull();
      expect(window.localStorage.getItem(key)).toBeNull();
    });
    expect(window.localStorage.getItem("theme")).toBe("dark");
  });

  it("flags the sign-out so Sign In can confirm it, and clears cached data", async () => {
    const user = userEvent.setup();
    window.sessionStorage.setItem(
      "student_recovery_email",
      "learner@example.com",
    );

    render(<LogoutButton />);
    await user.click(logoutButton());

    await waitFor(() => expect(assign).toHaveBeenCalled());
    /* The recovery email is purged... */
    expect(window.sessionStorage.getItem("student_recovery_email")).toBeNull();
    /* ...but the notice marker written afterwards survives for Sign In. */
    expect(window.sessionStorage.getItem(STUDENT_SIGNOUT_FLAG)).toBe("1");
  });

  it("blocks repeat submissions while the sign-out is in flight", async () => {
    const user = userEvent.setup();
    let resolveSignOut;
    supabaseMock.auth.signOut.mockReturnValue(
      new Promise((resolve) => {
        resolveSignOut = resolve;
      }),
    );

    render(<LogoutButton />);
    await user.click(logoutButton());

    /* The label switches while the request is in flight, so target the
       sole button rather than the "Logout" name. */
    const pending = screen.getByRole("button");
    expect(pending).toBeDisabled();
    expect(pending).toHaveAttribute("aria-busy", "true");
    expect(pending).toHaveTextContent("Signing out…");

    await user.click(pending);
    expect(supabaseMock.auth.signOut).toHaveBeenCalledTimes(1);

    resolveSignOut({ error: null });
    await waitFor(() => expect(assign).toHaveBeenCalled());
  });

  it("surfaces an error and keeps the student signed in when sign-out fails", async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    supabaseMock.auth.signOut.mockResolvedValue({
      error: { message: "Network request failed" },
    });

    render(<LogoutButton />);
    await user.click(logoutButton());

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/couldn't sign you out/i);

    /* No redirect and no notice: the session may still be live. */
    expect(assign).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem(STUDENT_SIGNOUT_FLAG)).toBeNull();

    /* The button is usable again so the student can retry. */
    expect(logoutButton()).toBeEnabled();
    expect(logoutButton()).toHaveTextContent("Logout");

    consoleError.mockRestore();
  });

  it("recovers when a retry succeeds", async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    supabaseMock.auth.signOut.mockResolvedValueOnce({
      error: { message: "Network request failed" },
    });

    render(<LogoutButton />);
    await user.click(logoutButton());
    await screen.findByRole("alert");

    supabaseMock.auth.signOut.mockResolvedValueOnce({ error: null });
    await user.click(logoutButton());

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith(LOGOUT_REDIRECT_PATH),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    consoleError.mockRestore();
  });

  it("treats a thrown sign-out rejection as a failure too", async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    supabaseMock.auth.signOut.mockRejectedValue(new Error("offline"));

    render(<LogoutButton />);
    await user.click(logoutButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /couldn't sign you out/i,
    );
    expect(assign).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it("keeps an accessible name when the sidebar is collapsed", () => {
    render(<LogoutButton collapsed />);

    const button = logoutButton();
    expect(button).toHaveTextContent("Logout");
    /* Visually the rail shows only the icon. */
    expect(button.querySelector("span")).toHaveClass("sr-only");
  });

  it("still signs out when browser storage is unavailable", async () => {
    const user = userEvent.setup();
    const setItem = vi
      .spyOn(window.sessionStorage, "setItem")
      .mockImplementation(() => {
        throw new Error("SecurityError: storage is disabled");
      });
    const removeItem = vi
      .spyOn(window.sessionStorage, "removeItem")
      .mockImplementation(() => {
        throw new Error("SecurityError: storage is disabled");
      });

    render(<LogoutButton />);
    await user.click(logoutButton());

    await waitFor(() => expect(assign).toHaveBeenCalled());
    expect(removeItem).toHaveBeenCalled();

    setItem.mockRestore();
    removeItem.mockRestore();
  });

  it("purges storage defensively when a key cannot be removed", () => {
    const removeItem = vi
      .spyOn(window.sessionStorage, "removeItem")
      .mockImplementation(() => {
        throw new Error("SecurityError");
      });

    expect(() => clearStudentSessionCache()).not.toThrow();

    removeItem.mockRestore();
  });

  it("consumes the sign-out marker only once", () => {
    window.sessionStorage.setItem(STUDENT_SIGNOUT_FLAG, "1");

    expect(consumeStudentSignOutFlag()).toBe(true);
    /* A later manual visit to Sign In must not repeat the notice. */
    expect(consumeStudentSignOutFlag()).toBe(false);
  });
});