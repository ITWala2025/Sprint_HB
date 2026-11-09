import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import StudentProfilePage from "@/app/student/(portal)/profile/page";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  maybeSingle: vi.fn(),
  updateEq: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { getUser: mocks.getUser },
    from: mocks.from,
  }),
}));

const savedProfile = {
  full_name: "Student Example",
  email: "student@example.com",
  phone: "9876543210",
  college: "Saved College",
  degree: "B.Tech",
  semester: "4",
};

async function openProfileEditor(user) {
  render(<StudentProfilePage />);
  await user.click(await screen.findByRole("button", { name: "Edit Profile" }));
}

describe("Student profile save", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user: { id: "student-1" } } });
    mocks.from.mockReturnValue({
      select: mocks.select,
      update: mocks.update,
    });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockReturnValue({ maybeSingle: mocks.maybeSingle });
    mocks.maybeSingle.mockResolvedValue({ data: savedProfile });
    mocks.update.mockReturnValue({ eq: mocks.updateEq });
    mocks.updateEq.mockResolvedValue({ error: null });
  });

  it("shows success after a successful update", async () => {
    const user = userEvent.setup();
    await openProfileEditor(user);
    await user.clear(screen.getByLabelText("College/University"));
    await user.type(screen.getByLabelText("College/University"), "New College");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Your changes were saved.",
    );
    expect(screen.getByText("New College")).toBeInTheDocument();
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ college: "New College" }),
    );
  });

  it("stays in edit mode with a generic message when Supabase returns an error", async () => {
    const user = userEvent.setup();
    mocks.updateEq.mockResolvedValue({ error: { message: "private details" } });
    await openProfileEditor(user);
    await user.clear(screen.getByLabelText("College/University"));
    await user.type(screen.getByLabelText("College/University"), "Typed College");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not save your changes. Please try again.",
    );
    expect(screen.getByLabelText("College/University")).toHaveValue(
      "Typed College",
    );
    expect(screen.queryByText("private details")).not.toBeInTheDocument();
  });

  it("shows the same generic message when the update rejects", async () => {
    const user = userEvent.setup();
    mocks.updateEq.mockRejectedValue(new Error("network unavailable"));
    await openProfileEditor(user);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not save your changes. Please try again.",
    );
    expect(screen.getByLabelText("College/University")).toHaveValue(
      "Saved College",
    );
  });

  it("restores the saved values when Cancel is clicked", async () => {
    const user = userEvent.setup();
    await openProfileEditor(user);
    await user.clear(screen.getByLabelText("College/University"));
    await user.type(screen.getByLabelText("College/University"), "Unsaved College");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(await screen.findByRole("button", { name: "Edit Profile" }));

    expect(screen.getByLabelText("College/University")).toHaveValue(
      "Saved College",
    );
  });

  it("disables Save while submitting and ignores repeat clicks", async () => {
    const user = userEvent.setup();
    let resolveUpdate;
    mocks.updateEq.mockReturnValue(
      new Promise((resolve) => {
        resolveUpdate = resolve;
      }),
    );
    await openProfileEditor(user);
    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    const savingButton = await screen.findByRole("button", { name: "Saving…" });
    expect(savingButton).toBeDisabled();
    expect(mocks.updateEq).toHaveBeenCalledTimes(1);

    resolveUpdate({ error: null });
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Your changes were saved.",
      );
    });
    expect(mocks.updateEq).toHaveBeenCalledTimes(1);
  });
});
