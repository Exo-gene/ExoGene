import { VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_URL } from "$env/static/public";
import { createClient } from "@supabase/supabase-js";

export namespace Supabase {
  const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

  export const client = supabase;
}
