const ADMIN_ID = "admin@sprint.institute";
const ADMIN_PASSWORD = "admin123";
const SESSION_COOKIE = "sprint_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24;

export function loginAdmin(id: string, password: string): boolean {
    if (typeof document === "undefined") return false;

    const isValid = id === ADMIN_ID && password === ADMIN_PASSWORD;

    if (isValid) {
        document.cookie = `${SESSION_COOKIE}=active; Max-Age=${SESSION_MAX_AGE}; Path=/; SameSite=Lax`;
    }

    return isValid;
}

export function logoutAdmin(): void {
    if (typeof document === "undefined") return;

    document.cookie = `${SESSION_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
}

export function isAuthenticated(): boolean {
    if (typeof document === "undefined") return false;

    return document.cookie
        .split(";")
        .some((cookie) => cookie.trim() === `${SESSION_COOKIE}=active`);
}