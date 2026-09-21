import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FAQSection from "@/components/contact/FAQSection";

describe("FAQSection", () => {
  it("renders default student FAQs and switches categories", () => {
    render(<FAQSection />);

    expect(screen.getByRole("tab", { name: /students/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByText(/what courses and programs does sprint offer\?/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /working professionals/i }));
    expect(
      screen.getByText(/does sprint offer programs for working professionals\?/i),
    ).toBeInTheDocument();
  });
});
