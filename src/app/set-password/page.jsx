/**
 * Canonical Set Password route.
 *
 * `create-browser-client` from `@supabase/ssr` detects the recovery/sign-up
 * session fragment (`#access_token=…`) automatically, so the same screen that
 * powers `/student/reset-password` is reused unchanged at the top-level
 * `/set-password` URL. This is the URL every password e-mail points to —
 * new-student password setup, forgot-password recovery and reset links all
 * land here.
 */
export { default } from "@/app/student/reset-password/page";