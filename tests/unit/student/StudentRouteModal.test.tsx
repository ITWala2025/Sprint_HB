import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const { back, replace } = vi.hoisted(() => ({
  back: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back, replace }),
}));

import StudentRouteModal from "@/components/student/StudentRouteModal";

describe("StudentRouteModal", () => {
  afterEach(() => {
    cleanup();
    back.mockClear();
    replace.mockClear();
  });

  it("renders route content in a labelled modal with a close action", () => {
    render(
      <StudentRouteModal title="Student dashboard">
        <p>Dashboard content</p>
      </StudentRouteModal>,
    );

    expect(
      screen.getByRole("dialog", { name: "Student dashboard" }),
    ).toHaveTextContent("Dashboard content");
    fireEvent.click(screen.getByRole("button", { name: "Close student page" }));
    expect(replace).toHaveBeenCalledWith("/home");
    expect(back).not.toHaveBeenCalled();
  });

  it("uses the configured fallback when no background route exists", () => {
    render(
      <StudentRouteModal
        title="Set password"
        fallbackHref="/student/login"
      >
        <p>Password form</p>
      </StudentRouteModal>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Close student page" }));

    expect(replace).toHaveBeenCalledWith("/student/login");
  });

  it("locks document scrolling only while the modal is mounted", () => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow =
      document.documentElement.style.overflow;
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "scroll";

    const { unmount } = render(
      <StudentRouteModal title="Student portal">
        <p>Student content</p>
      </StudentRouteModal>,
    );

    expect(document.body).toHaveClass("student-route-modal-open");
    expect(document.documentElement).toHaveClass("student-route-modal-open");
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");

    unmount();

    expect(document.body).not.toHaveClass("student-route-modal-open");
    expect(document.documentElement).not.toHaveClass(
      "student-route-modal-open",
    );
    expect(document.body.style.overflow).toBe("auto");
    expect(document.documentElement.style.overflow).toBe("scroll");

    document.body.style.overflow = previousBodyOverflow;
    document.documentElement.style.overflow = previousDocumentOverflow;
  });

  it("returns to the previous page when Escape or the backdrop is used", () => {
    const { container } = render(
      <StudentRouteModal title="Student profile">
        <p>Profile content</p>
      </StudentRouteModal>,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.mouseDown(container.querySelector(".student-route-modal-backdrop"));

    expect(replace).toHaveBeenCalledTimes(2);
    expect(replace).toHaveBeenCalledWith("/home");
    expect(back).not.toHaveBeenCalled();
  });
});
