import { describe, expect, it } from "vitest";

import { isSupportedAnnouncementUpload } from "@/app/admin/updates/upload-validation";

describe("isSupportedAnnouncementUpload", () => {
    it.each([
        ["poster.png", "image/png"],
        ["poster.jpg", "image/jpeg"],
        ["poster.jpeg", "image/jpeg"],
        ["poster.webp", "image/webp"],
        ["document.pdf", "application/pdf"],
    ])("accepts %s with its matching MIME type", (name, type) => {
        expect(isSupportedAnnouncementUpload({ name, type })).toBe(true);
    });

    it.each([
        ["document.png", "application/pdf"],
        ["document.pdf", "application/octet-stream"],
        ["poster.gif", "image/gif"],
    ])("rejects %s with MIME type %s", (name, type) => {
        expect(isSupportedAnnouncementUpload({ name, type })).toBe(false);
    });
});
