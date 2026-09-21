import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import EnquirySection from "@/components/contact/EnquirySection";

describe("EnquirySection", () => {
  it("renders the enquiry section and switches audience forms", () => {
    render(<EnquirySection />);

    expect(
      screen.getByRole("heading", { name: /how can we help you\?/i }),
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /^student$/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /working professional/i }),
    );
    expect(screen.getByLabelText(/current designation/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^institute$/i }));
    expect(screen.getByLabelText(/institute name/i)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /company \/ enterprise/i }),
    );
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
  });
});
