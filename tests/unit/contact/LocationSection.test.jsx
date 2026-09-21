import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import LocationSection from "@/components/contact/LocationSection";

describe("LocationSection", () => {
  it("renders address, directions, and map details", () => {
    render(<LocationSection />);

    expect(screen.getByRole("heading", { name: /visit our office/i })).toBeInTheDocument();
    expect(screen.getByText(/our location/i)).toBeInTheDocument();
    expect(screen.getByText(/school of professional studies/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /get directions/i })).toHaveAttribute(
      "href",
      "https://maps.app.goo.gl/AYdTXi8gNagSVJss7?g_st=aw",
    );
    expect(
      screen.getByTitle(/sprint office location on google maps/i),
    ).toBeInTheDocument();
  });
});
