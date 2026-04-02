import { createClient } from "@supabase/supabase-js";

function env(name: string) {
  return process.env[name]?.trim() || "";
}

export function getSupabaseServerClient() {
  const url = env("SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase env missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

export function getSupabaseStoragePublicBaseUrl() {
  const url = env("SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL");
  if (!url) return "";
  return `${url}/storage/v1/object/public`;
}
