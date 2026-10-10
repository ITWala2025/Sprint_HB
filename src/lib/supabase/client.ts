// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient(options: { detectSessionInUrl?: boolean } = {}) {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "placeholder-publishable-key";

  if (options.detectSessionInUrl === false) {
    return createBrowserClient(supabaseUrl, supabaseKey, {
      auth: { detectSessionInUrl: false },
      isSingleton: false,
    });
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}