import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ContactHero from "@/components/contact/ContactHero";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: (props) => <img {...props} />,
}));

describe("ContactHero", () => {
  it("renders the heading, trust points, and primary contact links", () => {
    render(<ContactHero />);

    expect(
      screen.getByRole("heading", {
        name: /let's build your future together/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/quick response/i)).toBeInTheDocument();
    expect(screen.getByText(/expert guidance/i)).toBeInTheDocument();
    expect(screen.getByText(/trusted by thousands/i)).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /sprint on linkedin/i }),
    ).toHaveAttribute(
      "href",
      "https://www.linkedin.com/company/sprint-institute",
    );

    expect(
      screen.getByRole("link", { name: /start an enquiry/i }),
    ).toHaveAttribute("href", "#enquiry");
  });
});
