import { afterEach, describe, expect, it, vi } from "vitest";
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

const { back } = vi.hoisted(() => ({ back: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back }),
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
  let historyGo;

  afterEach(() => {
    cleanup();
    back.mockClear();
    historyGo?.mockRestore();
  });

  it("closes all nested student routes to the original public page", async () => {
    historyGo = vi.spyOn(window.history, "go").mockImplementation(() => {});
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
    fireEvent.click(screen.getByRole("button", { name: "Close student page" }));

    expect(historyGo).toHaveBeenCalledWith(-2);
  });

  it("closes only the current student page after back navigation", async () => {
    historyGo = vi.spyOn(window.history, "go").mockImplementation(() => {});
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
});
