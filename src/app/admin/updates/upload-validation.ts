const imageMimeTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

export function isSupportedAnnouncementUpload(
    file: Pick<File, "name" | "type">,
): boolean {
    const mimeType = file.type.toLowerCase();
    if (imageMimeTypes.has(mimeType)) return true;

    const extension = file.name.split(".").pop()?.toLowerCase();
    return mimeType === "application/pdf" && extension === "pdf";
}
