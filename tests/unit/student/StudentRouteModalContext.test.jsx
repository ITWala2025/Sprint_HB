import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useContext } from "react";

import StudentRouteModal from "@/components/student/StudentRouteModal";
import {
  StudentRouteModalContext,
  StudentRouteModalProvider,
} from "@/components/student/StudentRouteModalContext";

const { back, replace, historyGo } = vi.hoisted(() => ({
  back: vi.fn(),
  replace: vi.fn(),
  historyGo: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back, replace }),
}));

function HistoryDepth() {
  const { backgroundPath, historyDepth } = useContext(StudentRouteModalContext);
  return (
    <output data-testid="modal-navigation">
      {`${backgroundPath ?? "none"}|${historyDepth}`}
    </output>
  );
}

function renderStudentFlow(pathname) {
  return render(
    <StudentRouteModalProvider pathname={pathname}>
      <StudentRouteModal title="Student Portal">
        <p>Student content</p>
      </StudentRouteModal>
      <HistoryDepth />
    </StudentRouteModalProvider>,
  );
}

describe("StudentRouteModal close navigation", () => {
  beforeEach(() => {
    vi.spyOn(window.history, "go").mockImplementation(historyGo);
  });

  afterEach(() => {
    cleanup();
    back.mockClear();
    replace.mockClear();
    historyGo.mockClear();
    vi.restoreAllMocks();
  });

  it("treats the dashboard as a page, not a modal background", () => {
    render(
      <StudentRouteModalProvider pathname="/student/dashboard">
        <HistoryDepth />
      </StudentRouteModalProvider>,
    );

    expect(screen.getByTestId("modal-navigation")).toHaveTextContent(
      "/student/dashboard|0",
    );
  });

  it.each(["close button", "Escape", "backdrop"])(
    "closes all nested student routes to the original public page via %s",
    async (dismissal) => {
      const { rerender } = renderStudentFlow("/home");

      rerender(
        <StudentRouteModalProvider pathname="/student/login">
          <StudentRouteModal title="Student Portal">
            <p>Student content</p>
          </StudentRouteModal>
          <HistoryDepth />
        </StudentRouteModalProvider>,
      );
      rerender(
        <StudentRouteModalProvider pathname="/student/forgot-password">
          <StudentRouteModal title="Student Portal">
            <p>Student content</p>
          </StudentRouteModal>
          <HistoryDepth />
        </StudentRouteModalProvider>,
      );

      await waitFor(() =>
        expect(screen.getByTestId("modal-navigation")).toHaveTextContent(
          "/home|2",
        ),
      );
      if (dismissal === "close button") {
        fireEvent.click(
          screen.getByRole("button", { name: "Close student page" }),
        );
      } else if (dismissal === "Escape") {
        fireEvent.keyDown(document, { key: "Escape" });
      } else {
        fireEvent.mouseDown(
          document.querySelector(".student-route-modal-backdrop"),
        );
      }

      expect(historyGo).toHaveBeenCalledWith(-2);
      expect(back).not.toHaveBeenCalled();
    },
  );

  it("closes only the current student page after back navigation", async () => {
    const { rerender } = renderStudentFlow("/home");

    rerender(
      <StudentRouteModalProvider pathname="/student/login">
        <StudentRouteModal title="Student Portal">
          <p>Student content</p>
        </StudentRouteModal>
        <HistoryDepth />
      </StudentRouteModalProvider>,
    );
    rerender(
      <StudentRouteModalProvider pathname="/student/forgot-password">
        <StudentRouteModal title="Student Portal">
          <p>Student content</p>
        </StudentRouteModal>
        <HistoryDepth />
      </StudentRouteModalProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("modal-navigation")).toHaveTextContent(
        "/home|2",
      ),
    );
    fireEvent.popState(window);
    rerender(
      <StudentRouteModalProvider pathname="/student/login">
        <StudentRouteModal title="Student Portal">
          <p>Student content</p>
        </StudentRouteModal>
        <HistoryDepth />
      </StudentRouteModalProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("modal-navigation")).toHaveTextContent(
        "/home|1",
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Close student page" }));
    expect(historyGo).toHaveBeenCalledWith(-1);
  });

  it("returns a directly loaded student route to home", () => {
    renderStudentFlow("/student/login");

    fireEvent.click(screen.getByRole("button", { name: "Close student page" }));

    expect(replace).toHaveBeenCalledWith("/home");
    expect(historyGo).not.toHaveBeenCalled();
  });
});
