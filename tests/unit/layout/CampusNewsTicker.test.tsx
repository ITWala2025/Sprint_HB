import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CampusNewsTicker from "@/components/layout/CampusNewsTicker";

describe("CampusNewsTicker", () => {
  it("uses the branded megaphone icon instead of the alert icon", () => {
    const { container } = render(<CampusNewsTicker />);
    const icon = container.querySelector("svg");

    expect(icon).not.toBeNull();
    expect(icon?.getAttribute("class")).toContain("lucide-megaphone");
    expect(icon?.getAttribute("class")).not.toContain("lucide-alert-triangle");
    expect(icon?.parentElement).toHaveClass("bg-brand-blue/15", "text-brand-blue-light");
  });
});
