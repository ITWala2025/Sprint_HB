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
    expect(back).toHaveBeenCalledOnce();
  });

  it("returns to the previous page when Escape or the backdrop is used", () => {
    const { container } = render(
      <StudentRouteModal title="Student profile">
        <p>Profile content</p>
      </StudentRouteModal>,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.mouseDown(container.querySelector(".student-route-modal-backdrop"));

    expect(back).toHaveBeenCalledTimes(2);
  });
});
