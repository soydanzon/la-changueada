import { createBrowserClient } from "@supabase/ssr";

let supabase:
  | ReturnType<typeof createBrowserClient>
  | undefined;

export function createClient() {
  if (supabase) {
    return supabase;
  }

  supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  return supabase;
}