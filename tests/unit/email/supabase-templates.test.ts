import { describe, expect, it } from "vitest";
import { SUPABASE_EMAIL_TEMPLATES_CATALOG } from "@/lib/email/supabase-templates";
import fs from "node:fs";
import path from "node:path";

describe("Supabase Email Templates Catalog", () => {
  it("provides templates for all 5 required Supabase GoTrue email workflows", () => {
    const types = SUPABASE_EMAIL_TEMPLATES_CATALOG.map((t) => t.type);
    expect(types).toContain("magic_link");
    expect(types).toContain("recovery");
    expect(types).toContain("invite");
    expect(types).toContain("confirmation");
    expect(types).toContain("email_change");
  });

  it("verifies that all template HTML files exist on disk and contain SPRINT brand identifiers", () => {
    const templatesDir = path.resolve(process.cwd(), "src/Supabase/email-templates");

    for (const item of SUPABASE_EMAIL_TEMPLATES_CATALOG) {
      const filePath = path.join(templatesDir, item.filename);
      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("SPRINT");
      expect(content).toContain("Institutional Training Hub");
      expect(content).toContain("{{ .ConfirmationURL }}");
      expect(content).toContain("#f81529"); // Brand red
      expect(content).toContain("#011f3e"); // Brand navy
      expect(content).toContain("Hazaribagh");
    }
  });
});

