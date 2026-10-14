import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PublicSiteShell from "@/components/layout/PublicSiteShell";
const { pathnameRef, modalSegmentsRef } = vi.hoisted(() => ({
  pathnameRef: { value: "/home" },
  modalSegmentsRef: { value: [] },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameRef.value,
  useSelectedLayoutSegments: () => modalSegmentsRef.value,
  useRouter: () => ({ push: vi.fn() }),
}));

describe("PublicSiteShell", () => {
  beforeEach(() => {
    pathnameRef.value = "/home";
    modalSegmentsRef.value = [];
  });

  const renderShell = (modal = null) =>
    render(
      <PublicSiteShell modal={modal}>
        <p>Page content</p>
      </PublicSiteShell>,
    );

  const publicChrome = () => ({
    header: screen.queryByRole("banner"),
    footer: screen.queryByRole("contentinfo"),
    whatsapp: screen.queryByLabelText(/chat on whatsapp/i),
    chatbot: screen.queryByRole("button", {
      name: /open sprint assistant/i,
    }),
  });

  it("renders the public header, footer and WhatsApp bubble on marketing routes", () => {
    renderShell();

    const chrome = publicChrome();
    expect(chrome.header).toBeInTheDocument();
    expect(chrome.footer).toBeInTheDocument();
    expect(chrome.whatsapp).toBeInTheDocument();
    expect(chrome.chatbot).toBeInTheDocument();
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });

  it("shows public chrome behind a directly loaded student modal", () => {
    pathnameRef.value = "/student/login";
    renderShell();

    const chrome = publicChrome();
    expect(chrome.header).toBeInTheDocument();
    expect(chrome.footer).toBeInTheDocument();
    expect(chrome.whatsapp).toBeInTheDocument();
    expect(chrome.chatbot).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Page content");
  });

  it.each(["/student/dashboard", "/student/enroll"])(
    "renders intercepted %s as a page instead of a modal",
    (pathname) => {
      pathnameRef.value = pathname;
      modalSegmentsRef.value = ["(.)student", "[...segments]"];
      renderShell(<section>Student full page route</section>);

      expect(screen.getByRole("banner")).toBeInTheDocument();
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
      expect(screen.getByRole("main")).toHaveTextContent(
        "Student full page route",
      );
      expect(screen.queryByText("Page content")).not.toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    },
  );

  it.each(["/student/dashboard", "/student/enroll"])(
    "renders direct %s page content with an empty default parallel slot",
    (pathname) => {
      pathnameRef.value = pathname;
      renderShell(<></>);

      expect(screen.getByRole("main")).toHaveTextContent("Page content");
    },
  );

  it.each([
    "/student/login",
    "/student/forgot-password",
    "/student/check-email",
    "/student/reset-password",
    "/student/password-reset-success",
  ])("keeps public chrome behind directly loaded %s modal", (pathname) => {
    pathnameRef.value = pathname;
    renderShell();

    const chrome = publicChrome();
    expect(chrome.header).toBeInTheDocument();
    expect(chrome.footer).toBeInTheDocument();
  });

  it("keeps the public header and footer on the full-page enrollment route", () => {
    pathnameRef.value = "/student/enroll";
    renderShell();

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("still shows the public chrome on portal dashboard routes", () => {
    // Only the auth screens opt out; the signed-in portal keeps its own layout.
    pathnameRef.value = "/student/dashboard";
    renderShell();

    expect(screen.queryByRole("banner")).toBeInTheDocument();
  });

  it("renders no public chrome on admin routes", () => {
    pathnameRef.value = "/admin/dashboard";
    renderShell();

    const chrome = publicChrome();
    expect(chrome.header).not.toBeInTheDocument();
    expect(chrome.footer).not.toBeInTheDocument();
  });
});
