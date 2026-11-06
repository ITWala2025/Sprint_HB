import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Checks if a string matches a standard UUID pattern.
 */
export function isUuid(value?: string | null): boolean {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim());
}

/**
 * Formats an application ID into the institutional standard:
 * SPR-APP-YYMM-XXXX
 * - YY: 2-digit year (e.g., 26 for 2026)
 * - MM: 2-digit month (e.g., 11 for November)
 * - XXXX: 4-character identifier (alphanumeric/digit)
 *
 * Guarantees that a raw UUID is NEVER returned.
 */
export function formatApplicationId(
  applicationNumber?: string | null,
  fallbackUuid?: string | null,
  createdAt?: string | Date | null
): string {
  // If applicationNumber is already in standard format SPR-APP-YYMM-XXXX, return it uppercase
  if (applicationNumber && /^SPR-APP-\d{4}-[A-Z0-9]{4}$/i.test(applicationNumber.trim())) {
    return applicationNumber.trim().toUpperCase();
  }

  // If applicationNumber exists and has SPR-APP prefix but varied casing or format
  if (applicationNumber && applicationNumber.trim().toUpperCase().startsWith("SPR-APP-")) {
    return applicationNumber.trim().toUpperCase();
  }

  // Derive YYMM from createdAt or current time
  const date = createdAt ? new Date(createdAt) : new Date();
  const validDate = isNaN(date.getTime()) ? new Date() : date;
  const yy = String(validDate.getFullYear()).slice(-2);
  const mm = String(validDate.getMonth() + 1).padStart(2, "0");

  // Derive 4-character suffix from fallbackUuid or default to "0001"
  let suffix = "0001";
  if (fallbackUuid) {
    const clean = fallbackUuid.replace(/[^0-9a-fA-F]/g, "");
    if (clean.length >= 4) {
      suffix = clean.slice(0, 4).toUpperCase();
    }
  }

  return `SPR-APP-${yy}${mm}-${suffix}`;
}

/**
 * Generates the next sequential application ID in the format:
 * SPR-APP-YYMM-XXXX
 * by inspecting existing enrollment records for the current YYMM.
 */
export async function generateNextApplicationId(
  supabase: SupabaseClient,
  targetDate: Date = new Date()
): Promise<string> {
  const yy = String(targetDate.getFullYear()).slice(-2);
  const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
  const prefix = `SPR-APP-${yy}${mm}-`;

  try {
    const { data, error } = await supabase
      .from("enrollments")
      .select("application_number")
      .like("application_number", `${prefix}%`)
      .order("application_number", { ascending: false })
      .limit(50);

    if (error) {
      console.warn("Could not query existing application numbers, using fallback sequence:", error.message);
      const randomDigits = String(Math.floor(1000 + Math.random() * 9000));
      return `${prefix}${randomDigits}`;
    }

    let maxSequence = 0;
    if (data && data.length > 0) {
      for (const row of data) {
        const appNum = row.application_number;
        if (appNum && appNum.startsWith(prefix)) {
          const suffix = appNum.slice(prefix.length, prefix.length + 4);
          const parsed = parseInt(suffix, 10);
          if (!isNaN(parsed) && parsed > maxSequence) {
            maxSequence = parsed;
          }
        }
      }
    }

    const nextSeq = String(maxSequence + 1).padStart(4, "0");
    return `${prefix}${nextSeq}`;
  } catch (err) {
    console.error("Error generating application ID:", err);
    const randomDigits = String(Math.floor(1000 + Math.random() * 9000));
    return `${prefix}${randomDigits}`;
  }
}

/**
 * Sanitizes a student ID or account ID to ensure a UUID is never displayed.
 */
export function sanitizeStudentId(
  studentId?: string | null,
  fallback: string = "Not linked"
): string {
  if (!studentId || !studentId.trim()) return fallback;
  const trimmed = studentId.trim();
  if (isUuid(trimmed)) return fallback;
  return trimmed;
}

