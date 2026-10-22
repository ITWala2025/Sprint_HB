import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
    select: vi.fn(),
    order: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
    createClient: () => ({ from: mocks.from }),
}));

import CareerManagementPage from "@/app/admin/careers/page";

describe("Career Management CMS", () => {
    beforeEach(() => {
        mocks.order.mockResolvedValue({
            data: [
                {
                    id: "job-1",
                    title: "CMS Career Role",
                    type: "internship",
                    location: "Hazaribagh",
                    description: "A role managed in the careers CMS.",
                    responsibilities: ["Build features"],
                    requirements: ["JavaScript"],
                    duration: "6 months",
                    stipend: "Paid",
                    status: "published",
                    posted_date: "2026-10-20",
                },
            ],
            error: null,
        });
        mocks.select.mockReturnValue({ order: mocks.order });
        mocks.from.mockReturnValue({ select: mocks.select });
    });

    it("loads career jobs into the metrics, table, and JSONB-backed details", async () => {
        const user = userEvent.setup();
        render(<CareerManagementPage />);

        expect(mocks.from).toHaveBeenCalledWith("sprint_careers_jobs");
        expect(mocks.select).toHaveBeenCalledWith("*");
        expect(mocks.order).toHaveBeenCalledWith("posted_date", {
            ascending: false,
        });

        const metrics = screen.getByRole("region", {
            name: "Job summary metrics",
        });
        await waitFor(() => {
            expect(
                within(metrics).getByText("Total Roles").closest("article"),
            ).toHaveTextContent("1");
            expect(
                within(metrics).getByText("Published (Live)").closest("article"),
            ).toHaveTextContent("1");
            expect(screen.getByText("CMS Career Role")).toBeInTheDocument();
        });

        await user.click(
            screen.getByRole("button", { name: "View CMS Career Role" }),
        );
        const details = screen.getByRole("dialog");
        expect(within(details).getByText("Build features")).toBeInTheDocument();
        expect(within(details).getByText("JavaScript")).toBeInTheDocument();
    });
});
