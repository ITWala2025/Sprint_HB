import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PublicSiteShell from "@/components/layout/PublicSiteShell";

const { pathnameRef } = vi.hoisted(() => ({ pathnameRef: { value: "/home" } }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameRef.value,
}));

describe("PublicSiteShell", () => {
  beforeEach(() => {
    pathnameRef.value = "/home";
  });

  const renderShell = () =>
    render(
      <PublicSiteShell>
        <p>Page content</p>
      </PublicSiteShell>,
    );

  const publicChrome = () => ({
    header: screen.queryByRole("banner"),
    footer: screen.queryByRole("contentinfo"),
    whatsapp: screen.queryByLabelText(/chat on whatsapp/i),
    chatbot: screen.queryByRole("button", { name: /open sprint chat/i }),
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

  it("keeps the portal auth screens free of public chrome", () => {
    pathnameRef.value = "/student/login";
    renderShell();

    const chrome = publicChrome();
    expect(chrome.header).not.toBeInTheDocument();
    expect(chrome.footer).not.toBeInTheDocument();
    expect(chrome.whatsapp).not.toBeInTheDocument();
    expect(chrome.chatbot).not.toBeInTheDocument();
    // The page itself still renders inside the main landmark.
    expect(screen.getByRole("main")).toHaveTextContent("Page content");
  });

  it.each([
    "/student/forgot-password",
    "/student/check-email",
    "/student/reset-password",
    "/student/password-reset-success",
    "/student/enroll",
  ])("keeps %s free of public chrome", (pathname) => {
    pathnameRef.value = pathname;
    renderShell();

    const chrome = publicChrome();
    expect(chrome.header).not.toBeInTheDocument();
    expect(chrome.footer).not.toBeInTheDocument();
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
