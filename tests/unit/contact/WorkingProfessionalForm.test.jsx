import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import WorkingProfessionalForm from "@/components/contact/WorkingProfessionalForm";

describe("WorkingProfessionalForm", () => {
  it("renders the form and allows selecting a program", () => {
    render(<WorkingProfessionalForm />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current designation/i)).toBeInTheDocument();

    const programTrigger = screen.getByText(/select program\(s\)/i).closest("button");
    fireEvent.click(programTrigger);
    fireEvent.click(screen.getByRole("checkbox", { name: /full stack development/i }));

    expect(screen.getAllByText(/full stack development/i).length).toBeGreaterThan(0);
  });

  it("auto-generates a professional enquiry message for multiple chosen programs", () => {
    render(<WorkingProfessionalForm />);

    fireEvent.click(screen.getByText(/select program\(s\)/i).closest("button"));
    fireEvent.click(screen.getByRole("checkbox", { name: /artificial intelligence/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /data science/i }));

    const professionalMessage = screen.getByLabelText(/message \/ query/i);
    expect(professionalMessage.value).toContain(
      "I'm interested in the Artificial Intelligence and Data Science programs as a working professional.",
    );
  });
});
