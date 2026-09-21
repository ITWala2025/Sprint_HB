import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import InstituteForm from "@/components/contact/InstituteForm";

describe("InstituteForm", () => {
  it("renders the form and allows selecting a service", () => {
    render(<InstituteForm />);

    expect(screen.getByLabelText(/institute name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/official email/i)).toBeInTheDocument();

    const serviceTrigger = screen.getByText(/select service\(s\)/i).closest("button");
    fireEvent.click(serviceTrigger);
    fireEvent.click(screen.getByRole("checkbox", { name: /workshop/i }));

    expect(screen.getAllByText(/workshop/i).length).toBeGreaterThan(0);
  });

  it("auto-generates an institute message when more than one service is selected", () => {
    render(<InstituteForm />);

    fireEvent.click(screen.getByText(/select service\(s\)/i).closest("button"));
    fireEvent.click(screen.getByRole("checkbox", { name: /training/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /workshop/i }));

    const instituteMessage = screen.getByLabelText(/training \/ requirement message/i);
    expect(instituteMessage.value).toContain(
      "We are interested in Training and Workshop services for our institute.",
    );
  });
});
