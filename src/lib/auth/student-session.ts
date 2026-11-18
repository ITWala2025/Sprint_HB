// src/lib/auth/student-session.ts
import type { StudentSessionPayload } from "@/app/student/auth-types";

export const STUDENT_SESSION_COOKIE = "sprint_student_session";
export const STUDENT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecretKey(): string {
    return (
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        "sprint-hb-internal-session-secret"
    );
}

function toBase64Url(bytes: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(base64url: string): Uint8Array {
    let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
        base64 += "=";
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    return await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );
}

/**
 * Sign a student session payload with Web Crypto HMAC-SHA256
 */
export async function createStudentSessionToken(
    payload: Omit<StudentSessionPayload, "exp"> & { exp?: number },
    customSecret?: string
): Promise<string> {
    const secret = customSecret || getSecretKey();
    const encoder = new TextEncoder();
    const key = await getCryptoKey(secret);

    const fullPayload: StudentSessionPayload = {
        ...payload,
        exp: payload.exp ?? Date.now() + STUDENT_SESSION_MAX_AGE_SECONDS * 1000,
    };

    const json = JSON.stringify(fullPayload);
    const payloadB64 = toBase64Url(encoder.encode(json));
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
    const signatureB64 = toBase64Url(new Uint8Array(signatureBuffer));

    return `${payloadB64}.${signatureB64}`;
}

/**
 * Verify and decode a student session token with Web Crypto HMAC-SHA256
 */
export async function verifyStudentSessionToken(
    token: string,
    customSecret?: string
): Promise<StudentSessionPayload | null> {
    if (!token || typeof token !== "string" || !token.includes(".")) {
        return null;
    }

    const [payloadB64, signatureB64] = token.split(".");
    if (!payloadB64 || !signatureB64) {
        return null;
    }

    try {
        const secret = customSecret || getSecretKey();
        const encoder = new TextEncoder();
        const key = await getCryptoKey(secret);

        const sigBytes = fromBase64Url(signatureB64);
        const isValid = await crypto.subtle.verify(
            "HMAC",
            key,
            sigBytes as unknown as BufferSource,
            encoder.encode(payloadB64)
        );

        if (!isValid) {
            return null;
        }

        const decodedJson = new TextDecoder().decode(fromBase64Url(payloadB64));
        const payload: StudentSessionPayload = JSON.parse(decodedJson);

        // Check expiration
        if (!payload.exp || Date.now() > payload.exp) {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}