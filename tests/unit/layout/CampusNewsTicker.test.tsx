import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import CampusNewsTickerClient, {
  getModalMedia,
} from "@/components/layout/CampusNewsTickerClient";

describe("CampusNewsTicker", () => {
  it("uses the branded megaphone icon instead of the alert icon", () => {
    const { container } = render(<CampusNewsTickerClient initialUpdates={[]} />);
    const icon = container.querySelector("svg");

    expect(icon).not.toBeNull();
    expect(icon?.getAttribute("class")).toContain("lucide-megaphone");
    expect(icon?.getAttribute("class")).not.toContain("lucide-alert-triangle");
    expect(icon?.parentElement).toHaveClass("bg-brand-blue/15", "text-brand-blue-light");
  });

  it.each(["jpg", "jpeg", "png", "webp", "gif", "avif", "svg"])(
    "classifies direct .%s image URLs with query strings",
    (extension) => {
      const url = `https://cdn.example.com/poster.${extension}?download=1`;
      expect(getModalMedia(url)).toEqual({ type: "image", src: url });
    },
  );

  it("classifies Zoho preview images with query strings", () => {
    const url = "https://previewengine-accl.zohoexternal.in/image/WD/image-id?version=1.0";
    expect(getModalMedia(url)).toEqual({ type: "image", src: url });
  });

  it.each([
    ["a PDF extension", "https://cdn.example.com/guide.PDF?download=1"],
    ["a PDF MIME type", "https://cdn.example.com/view?type=application/pdf"],
  ])("classifies direct PDFs by %s", (_description, url) => {
    expect(getModalMedia(url)).toEqual({ type: "pdf", src: url });
  });

  it.each([
    [
      "https://drive.google.com/file/d/drive-id/view?usp=sharing",
      "https://drive.google.com/file/d/drive-id/preview?usp=sharing",
    ],
    [
      "https://drive.google.com/file/d/drive-id?resourcekey=key",
      "https://drive.google.com/file/d/drive-id/preview?resourcekey=key",
    ],
  ])("normalizes Google Drive URL %s", (url, previewUrl) => {
    expect(getModalMedia(url)).toEqual({ type: "google-drive", src: previewUrl });
  });

  it.each([
    ["document", "https://docs.google.com/document/d/doc-id/edit?usp=sharing",
      "https://docs.google.com/document/d/doc-id/preview?usp=sharing"],
    ["spreadsheets", "https://docs.google.com/spreadsheets/d/sheet-id/edit?usp=sharing",
      "https://docs.google.com/spreadsheets/d/sheet-id/preview?usp=sharing"],
    ["presentation", "https://docs.google.com/presentation/d/slides-id/edit?usp=sharing",
      "https://docs.google.com/presentation/d/slides-id/preview?usp=sharing"],
  ])("normalizes Google %s URLs", (_type, url, previewUrl) => {
    expect(getModalMedia(url)).toEqual({ type: "google-doc", src: previewUrl });
  });

  it.each([
    ["https://www.youtube.com/watch?v=video-id", "https://www.youtube.com/embed/video-id"],
    ["https://youtu.be/video-id", "https://www.youtube.com/embed/video-id"],
    ["https://youtube.com/shorts/video-id", "https://www.youtube.com/embed/video-id"],
  ])("normalizes YouTube URL %s and enables fullscreen", (url, previewUrl) => {
    expect(getModalMedia(url)).toEqual({
      type: "youtube",
      src: previewUrl,
      allowFullScreen: true,
    });
  });

  it.each(["doc", "docx", "ppt", "pptx", "xls", "xlsx"])(
    "uses the Google viewer for .%s URLs",
    (extension) => {
      const url = `https://files.example.com/report.${extension}?download=1`;
      expect(getModalMedia(url)).toEqual({
        type: "office",
        src: `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`,
      });
    },
  );

  it("does not classify regular websites or Google Forms as modal media", () => {
    expect(getModalMedia("https://example.com/registration")).toBeNull();
    expect(getModalMedia("https://docs.google.com/forms/d/form-id/viewform")).toBeNull();
  });

  it("keeps regular external links opening in a new tab with the external arrow", () => {
    const url = "https://forms.gle/registration";
    render(
      <CampusNewsTickerClient
        initialUpdates={[
          {
            id: "registration",
            category: "ANNOUNCEMENT",
            message: "Register now",
            link_url: url,
          },
        ]}
      />,
    );

    const link = screen.getByRole("link", { name: /Register now/ });
    expect(link).toHaveAttribute("href", url);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.querySelector(".lucide-arrow-up-right")).not.toBeNull();
  });

  it.each([
    [
      "an image extension with query parameters",
      "https://cdn.example.com/poster.JPG?version=1.0",
    ],
    [
      "a Zoho preview image with query parameters",
      "https://previewengine-accl.zohoexternal.in/image/WD/image-id?version=1.0&width=2046",
    ],
  ])("opens %s in the modal without an external arrow", async (_description, url) => {
    const user = userEvent.setup();
    render(
      <CampusNewsTickerClient
        initialUpdates={[
          {
            id: "image",
            category: "ANNOUNCEMENT",
            message: "Test image",
            link_url: url,
          },
        ]}
      />,
    );

    const trigger = screen.getByRole("button", {
      name: "View announcement image: Test image",
    });
    expect(trigger.querySelector(".lucide-arrow-up-right")).toBeNull();
    await user.click(trigger);

    const image = await screen.findByRole("img", { name: "Test image" });
    expect(image).toHaveAttribute("src", url);
    expect(screen.getByRole("link", { name: "Open in New Tab" })).toHaveAttribute(
      "href",
      url,
    );
  });

  it.each([
    [
      "file",
      "https://workdrive.zohoexternal.in/file/document-id?source=ticker",
      "https://workdrive.zohoexternal.in/embed/document-id?source=ticker",
    ],
    [
      "embed",
      "https://workdrive.zohoexternal.in/embed/document-id?source=ticker",
      "https://workdrive.zohoexternal.in/embed/document-id?source=ticker",
    ],
  ])("opens WorkDrive %s links in the modal", async (_route, originalUrl, iframeUrl) => {
    const user = userEvent.setup();
    render(
      <CampusNewsTickerClient
        initialUpdates={[
          {
            id: "workdrive",
            category: "ANNOUNCEMENT",
            message: "WorkDrive document",
            link_url: originalUrl,
          },
        ]}
      />,
    );

    const trigger = screen.getByRole("button", {
      name: "View announcement workdrive: WorkDrive document",
    });
    expect(trigger.querySelector(".lucide-arrow-up-right")).toBeNull();
    await user.click(trigger);

    expect(await screen.findByTitle("WorkDrive document")).toHaveAttribute(
      "src",
      iframeUrl,
    );
    expect(screen.getByRole("link", { name: "Open in New Tab" })).toHaveAttribute(
      "href",
      originalUrl,
    );
  });

  it.each([
    ["a PDF extension with query parameters", "https://cdn.example.com/file.PDF?download=1"],
    ["a PDF MIME type", "https://cdn.example.com/file?type=application/pdf"],
    ["a PDF embed path", "https://viewer.example.com/embed/pdf/document-id"],
  ])("opens %s in the modal without an external arrow", async (_description, url) => {
    const user = userEvent.setup();
    render(
      <CampusNewsTickerClient
        initialUpdates={[
          {
            id: "pdf",
            category: "ANNOUNCEMENT",
            message: "Test PDF",
            link_url: url,
          },
        ]}
      />,
    );

    const trigger = screen.getByRole("button", {
      name: "View announcement pdf: Test PDF",
    });
    expect(trigger.querySelector(".lucide-arrow-up-right")).toBeNull();
    await user.click(trigger);

    expect(await screen.findByTitle("Test PDF")).toHaveAttribute("src", url);
    const newTabLink = screen.getByRole("link", { name: "Open in New Tab" });
    expect(newTabLink).toHaveAttribute("href", url);
    expect(newTabLink).toHaveAttribute("target", "_blank");
    expect(newTabLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
