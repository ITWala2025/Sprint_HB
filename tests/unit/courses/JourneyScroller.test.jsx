import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import JourneyScroller from "@/components/courses/JourneyScroller";

const cardTitles = ["Day One", "Technical Sessions", "Internship"];

function renderScroller() {
    render(
        <JourneyScroller label="Program milestones">
            {cardTitles.map((title) => (
                <li key={title} className="courses-signature-programs__milestone">
                    {title}
                </li>
            ))}
        </JourneyScroller>,
    );

    return screen.getByRole("list", { name: "Program milestones" });
}

function setTrackMetrics(track, { scrollWidth, clientWidth, scrollLeft = 0 }) {
    Object.defineProperties(track, {
        scrollWidth: { configurable: true, get: () => scrollWidth },
        clientWidth: { configurable: true, get: () => clientWidth },
        scrollLeft: {
            configurable: true,
            get: () => scrollLeft,
            set: () => {},
        },
    });
}

function emitScroll(track) {
    act(() => {
        track.dispatchEvent(new Event("scroll"));
    });
}

describe("JourneyScroller", () => {
    it("keeps the list scrollable and hides the arrows when every card fits", () => {
        const track = renderScroller();

        setTrackMetrics(track, { scrollWidth: 900, clientWidth: 300 });
        act(() => {
            window.dispatchEvent(new Event("resize"));
        });
        expect(screen.getByRole("button", { name: "Next step" })).toBeInTheDocument();

        setTrackMetrics(track, { scrollWidth: 420, clientWidth: 420 });
        act(() => {
            window.dispatchEvent(new Event("resize"));
        });

        expect(track).toHaveClass("courses-signature-programs__milestones");
        expect(track).toHaveAttribute("tabindex", "0");
        expect(
            screen.queryByRole("button", { name: "Previous step" }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Next step" }),
        ).not.toBeInTheDocument();
    });

    it("shows the chevrons when the row overflows and disables them at each end", async () => {
        const track = renderScroller();

        setTrackMetrics(track, { scrollWidth: 900, clientWidth: 300, scrollLeft: 0 });
        emitScroll(track);

        const previous = await screen.findByRole("button", {
            name: "Previous step",
        });
        const next = screen.getByRole("button", { name: "Next step" });

        expect(previous).toBeDisabled();
        expect(next).toBeEnabled();

        setTrackMetrics(track, { scrollWidth: 900, clientWidth: 300, scrollLeft: 600 });
        emitScroll(track);

        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: "Previous step" }),
            ).toBeEnabled();
        });
        expect(screen.getByRole("button", { name: "Next step" })).toBeDisabled();
    });

    it("scrolls the row by one card plus the gap on next", async () => {
        const user = userEvent.setup();
        const track = renderScroller();
        const scrollBy = vi.fn();
        track.style.columnGap = "12px";
        track.scrollBy = scrollBy;
        track.firstElementChild.getBoundingClientRect = () => ({ width: 180 });

        setTrackMetrics(track, { scrollWidth: 900, clientWidth: 300, scrollLeft: 0 });
        emitScroll(track);

        const next = await screen.findByRole("button", { name: "Next step" });
        await user.click(next);

        expect(scrollBy).toHaveBeenCalledTimes(1);
        expect(scrollBy.mock.calls[0][0]).toMatchObject({ left: 192 });
        expect(["auto", "smooth"]).toContain(
            scrollBy.mock.calls[0][0].behavior,
        );
    });
});
