import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PublicSiteShell from "@/components/layout/PublicSiteShell";
const { pathnameRef, modalSegmentsRef, searchRef } = vi.hoisted(() => ({
  pathnameRef: { value: "/home" },
  modalSegmentsRef: { value: [] },
  searchRef: { value: new URLSearchParams() },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameRef.value,
  useSearchParams: () => searchRef.value,
  useSelectedLayoutSegments: () => modalSegmentsRef.value,
  useRouter: () => ({ push: vi.fn() }),
}));

describe("PublicSiteShell", () => {
  beforeEach(() => {
    pathnameRef.value = "/home";
    modalSegmentsRef.value = [];
    searchRef.value = new URLSearchParams();
  });

  const renderShell = (modal = null) =>
    render(
      <PublicSiteShell>
        {modal ?? <p>Page content</p>}
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

  it("uses a minimal auth header without public chrome on a student login route", () => {
    pathnameRef.value = "/student/login";
    renderShell();

    const chrome = publicChrome();
    expect(chrome.header).toBeInTheDocument();
    expect(chrome.footer).not.toBeInTheDocument();
    expect(chrome.whatsapp).not.toBeInTheDocument();
    expect(chrome.chatbot).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /enroll now/i })).toHaveAttribute(
      "href",
      "/student/enroll",
    );
    expect(screen.getByRole("main")).toHaveTextContent("Page content");
  });

  it.each(["/student/dashboard", "/student/enroll"])(
    "renders intercepted %s as a page instead of a modal",
    (pathname) => {
      pathnameRef.value = pathname;
      modalSegmentsRef.value = ["(.)student", "[...segments]"];
      renderShell(<section>Student full page route</section>);

      expect(screen.getByRole("banner")).toBeInTheDocument();
      if (pathname === "/student/dashboard") {
        expect(screen.getByRole("contentinfo")).toBeInTheDocument();
      } else {
        expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
      }
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
      renderShell();

      expect(screen.getByRole("main")).toHaveTextContent("Page content");
    },
  );

  it.each([
    "/student/login",
    "/student/forgot-password",
    "/student/check-email",
    "/student/reset-password",
    "/student/password-reset-success",
    "/student/enroll",
  ])("renders a distraction-free auth shell for %s", (pathname) => {
    pathnameRef.value = pathname;
    renderShell();

    const chrome = publicChrome();
    expect(chrome.header).toBeInTheDocument();
    expect(chrome.footer).not.toBeInTheDocument();
    expect(chrome.whatsapp).not.toBeInTheDocument();
    expect(chrome.chatbot).not.toBeInTheDocument();
  });

  it("keeps the contextual sign-in link on enrollment", () => {
    pathnameRef.value = "/student/enroll";
    renderShell();

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /already enrolled/i })).toHaveAttribute(
      "href",
      "/student/login",
    );
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

  it("preserves the requested course on the enrollment context link", () => {
    pathnameRef.value = "/student/login";
    searchRef.value = new URLSearchParams({ next: "/courses/cloud-engineering" });
    renderShell();

    expect(screen.getByRole("link", { name: /enroll now/i })).toHaveAttribute(
      "href",
      "/student/enroll?next=%2Fcourses%2Fcloud-engineering",
    );
  });
});
