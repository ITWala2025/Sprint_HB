import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import OpenPositions from "@/components/careers/OpenPositions";
import { formatPostedDate } from "@/components/careers/RoleDetailModal";
import { careerRoles } from "@/data/careers";

const [firstRole, secondRole] = careerRoles;

const cardTrigger = (role) => screen.getByRole("button", { name: role.title });

const applyButtons = () => screen.getAllByRole("button", { name: /^apply$/i });

const openFromCardBody = async (user, role) => {
  await user.click(cardTrigger(role));
  return screen.getByRole("dialog");
};

const expectedApplyHref = (role) =>
  `mailto:info@sprint.naturalelements.co.in?subject=${encodeURIComponent(
    `Application for ${role.title}`,
  )}`;

describe("OpenPositions — job cards & role detail modal", () => {
  it("keeps one card per role with a dialog trigger and an Apply action", () => {
    render(<OpenPositions />);

    expect(cardTrigger(firstRole)).toHaveAttribute("aria-haspopup", "dialog");
    expect(cardTrigger(secondRole)).toHaveAttribute("aria-haspopup", "dialog");
    expect(applyButtons()).toHaveLength(careerRoles.length);

    // Card teaser stays clamped; the untruncated copy lives in the modal.
    expect(screen.getByText(firstRole.description)).toHaveClass(
      "line-clamp-3",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the full job details from the card body trigger", async () => {
    const user = userEvent.setup();
    render(<OpenPositions />);

    const dialog = await openFromCardBody(user, firstRole);

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName(firstRole.title);
    expect(within(dialog).getByText("Internship")).toBeInTheDocument();
    expect(within(dialog).getByText(firstRole.location)).toBeInTheDocument();
    expect(within(dialog).getByText(firstRole.duration)).toBeInTheDocument();
    expect(within(dialog).getByText(firstRole.stipend)).toBeInTheDocument();
    expect(
      within(dialog).getByText(formatPostedDate(firstRole.postedDate)),
    ).toBeInTheDocument();

    // Full, untruncated description inside the dialog.
    expect(within(dialog).getByText(firstRole.description)).not.toHaveClass(
      "line-clamp-3",
    );

    [...firstRole.responsibilities, ...firstRole.requirements].forEach(
      (item) => {
        expect(within(dialog).getByText(item)).toBeInTheDocument();
      },
    );

    expect(
      within(dialog).getByRole("link", { name: /apply for this role/i }),
    ).toHaveAttribute("href", expectedApplyHref(firstRole));
  });

  it("opens the same dialog from the Apply action", async () => {
    const user = userEvent.setup();
    render(<OpenPositions />);

    await user.click(applyButtons()[1]);

    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveAccessibleName(secondRole.title);
    // `selector: "span"` targets the type badge: this role's duration label is
    // also "Full-time", so a bare text query would match twice.
    expect(
      within(dialog).getByText("Full-time", { selector: "span" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("link", { name: /apply for this role/i }),
    ).toHaveAttribute("href", expectedApplyHref(secondRole));
  });

  it("dismisses via the close button, the Escape key and a backdrop click", async () => {
    const user = userEvent.setup();
    render(<OpenPositions />);

    // Close (X) button
    let dialog = await openFromCardBody(user, firstRole);
    await user.click(
      within(dialog).getByRole("button", { name: /close job details/i }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Escape key
    dialog = await openFromCardBody(user, firstRole);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Backdrop click (the fixed-position wrapper around the dialog panel)
    dialog = await openFromCardBody(user, firstRole);
    await user.click(dialog.parentElement);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("moves focus into the dialog and returns it to the trigger on close", async () => {
    const user = userEvent.setup();
    render(<OpenPositions />);

    const trigger = cardTrigger(firstRole);
    await user.click(trigger);

    expect(
      screen.getByRole("button", { name: /close job details/i }),
    ).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });

  it("locks page scroll while the dialog is open and releases it on close", async () => {
    const user = userEvent.setup();
    render(<OpenPositions />);

    await openFromCardBody(user, firstRole);
    expect(document.body.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");
    expect(document.body.style.overflow).toBe("");
  });
});
