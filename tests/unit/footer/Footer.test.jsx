import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  __esModule: true,
  default: function MockLink({ href, children, ...props }) {
    return (
      <a href={href} data-next-link="true" {...props}>
        {children}
      </a>
    );
  },
}));

import Footer from "@/components/footer/Footer";

describe("Footer portal navigation", () => {
  afterEach(() => cleanup());

  it("keeps Student Login as an intercepted app link without an external icon", () => {
    render(<Footer />);
    const login = screen.getByRole("link", { name: "Student Login" });

    expect(login).toHaveAttribute("href", "/student/login");
    expect(login).toHaveAttribute("data-next-link", "true");
    expect(login.querySelector("svg")).not.toBeInTheDocument();
  });

  it("opens New Enrollment as a full-page navigation", () => {
    render(<Footer />);
    const enrollment = screen.getByRole("link", { name: "New Enrollment" });

    expect(enrollment).toHaveAttribute("href", "/student/enroll");
    expect(enrollment).not.toHaveAttribute("data-next-link");
  });
});
