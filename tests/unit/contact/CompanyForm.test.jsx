import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CompanyForm from "@/components/contact/CompanyForm";

describe("CompanyForm", () => {
  it("renders the form and allows selecting a purpose", () => {
    render(<CompanyForm />);

    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/official email address/i)).toBeInTheDocument();

    const purposeTrigger = screen.getByText(/select purpose\(s\)/i).closest("button");
    fireEvent.click(purposeTrigger);
    fireEvent.click(screen.getByRole("checkbox", { name: /partnership/i }));

    expect(screen.getAllByText(/partnership/i).length).toBeGreaterThan(0);
  });

  it("auto-generates a company message when multiple purposes are selected", () => {
    render(<CompanyForm />);

    fireEvent.click(screen.getByText(/select purpose\(s\)/i).closest("button"));
    fireEvent.click(screen.getByRole("checkbox", { name: /partnership/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /hiring/i }));

    const companyMessage = screen.getByLabelText(/message/i);
    expect(companyMessage.value).toContain(
      "We are interested in exploring Partnership and Hiring opportunities with SPRINT.",
    );
  });
});
