import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ContactMethods from "@/components/contact/ContactMethods";

describe("ContactMethods", () => {
  it("renders the contact options and office hours information", () => {
    render(<ContactMethods />);

    expect(
      screen.getByRole("heading", { name: /we're here to help/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/call us/i)).toBeInTheDocument();
    expect(screen.getByText(/\+91 85212 83183/i)).toBeInTheDocument();
    expect(screen.getByText(/email us/i)).toBeInTheDocument();
    expect(screen.getByText(/info@sprintedu\.in/i)).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /call now/i }),
    ).toHaveAttribute("href", "tel:+918521283184");

    expect(
      screen.getByRole("link", { name: /send email/i }),
    ).toHaveAttribute("href", "mailto:info@sprint.naturalelements.co.in");

    expect(screen.getByText(/office hours/i)).toBeInTheDocument();
    expect(
      screen.getByText(/monday – saturday, 9:00 am – 5:00 pm/i),
    ).toBeInTheDocument();
  });
});
