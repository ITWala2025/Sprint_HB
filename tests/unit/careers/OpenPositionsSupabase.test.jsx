import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatPostedDate } from "@/components/careers/RoleDetailModal";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ from: mocks.from }),
}));

import OpenPositions from "@/components/careers/OpenPositions";

describe("OpenPositions Supabase listings", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    mocks.from.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockReturnValue({ order: mocks.order });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("loads published jobs in posted-date order and normalizes modal fields", async () => {
    mocks.order.mockResolvedValue({
      data: [
        {
          id: "job-1",
          title: "Database Career Role",
          type: "internship",
          location: "Remote",
          description: "A role from the careers CMS.",
          responsibilities: ["Build features", null],
          requirements: ["JavaScript"],
          duration: "6 months",
          stipend: "Paid",
          posted_date: "2026-10-20",
        },
      ],
      error: null,
    });

    render(<OpenPositions />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Database Career Role" }),
      ).toBeInTheDocument();
    });

    expect(mocks.from).toHaveBeenCalledWith("sprint_careers_jobs");
    expect(mocks.select).toHaveBeenCalledWith("*");
    expect(mocks.eq).toHaveBeenCalledWith("status", "published");
    expect(mocks.order).toHaveBeenCalledWith("posted_date", {
      ascending: false,
    });

    await userEvent.click(
      screen.getByRole("button", { name: "Database Career Role" }),
    );
    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText("Build features"),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("JavaScript"),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(formatPostedDate("2026-10-20")),
    ).toBeInTheDocument();
  });
});
