import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import StudentForm from "@/components/contact/StudentForm";

describe("StudentForm", () => {
  it("renders the form and allows selecting a course", () => {
    render(<StudentForm />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();

    const courseTrigger = screen.getByText(/select course\(s\)/i).closest("button");
    fireEvent.click(courseTrigger);
    fireEvent.click(screen.getByRole("checkbox", { name: /artificial intelligence/i }));

    expect(screen.getAllByText(/artificial intelligence/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /submit enquiry/i })).toBeInTheDocument();
  });

  it("auto-generates a message when multiple courses are selected", () => {
    render(<StudentForm />);

    fireEvent.click(screen.getByText(/select course\(s\)/i).closest("button"));
    fireEvent.click(screen.getByRole("checkbox", { name: /artificial intelligence/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /data science/i }));

    const studentMessage = screen.getByLabelText(/message \/ query/i);
    expect(studentMessage.value).toContain(
      "I'm interested in the Artificial Intelligence and Data Science courses.",
    );
  });
});
