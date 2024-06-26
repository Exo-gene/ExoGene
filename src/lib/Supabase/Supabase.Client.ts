import { VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_URL } from "$env/static/public";
import { Enviroments } from "$lib/Env/Enviroments";
import { createClient } from "@supabase/supabase-js";

export namespace Supabase {
  // console.log("Supabase URL", Enviroments.supabase_url);

  console.log("Supabase URL", Enviroments);

  const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

  export const client = supabase;
}
