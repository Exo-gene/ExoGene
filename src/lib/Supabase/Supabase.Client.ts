import { Enviroments } from "$lib/Env/Enviroments";
import { createClient } from "@supabase/supabase-js";

export namespace Supabase {
  // console.log("Supabase URL", Enviroments.supabase_url);
  
  const supabase = createClient(
    Enviroments.supabase_url,
    Enviroments.supabase_anon_key
  );

  export const client = supabase;
}
