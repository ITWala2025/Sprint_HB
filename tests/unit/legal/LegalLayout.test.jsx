import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import LegalLayout from "@/components/legal/LegalLayout";

describe("LegalLayout", () => {
  it("renders a compact single-column document without the sidebar", () => {
    render(
      <LegalLayout
        eyebrow="Legal"
        title="Privacy Policy"
        description="Privacy and data handling information."
        effectiveDate="January 1, 2026"
        updatedDate="September 22, 2026"
        notice={<p>Educational demo notice.</p>}
        sections={[
          {
            id: "introduction",
            title: "Introduction",
            content: <p>Policy introduction.</p>,
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Privacy Policy", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Document index")).not.toBeInTheDocument();
    const article = screen.getByRole("article");
    expect(article.parentElement).toHaveClass("max-w-4xl");
    expect(article).toHaveClass("rounded-xl", "p-5");
    expect(screen.getByRole("heading", { name: "Introduction", level: 2 })).toBeInTheDocument();
  });
});
