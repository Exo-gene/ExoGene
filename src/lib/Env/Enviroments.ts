export namespace Enviroments {
  let PROCESS: any;

  const ENVIRONMENT = PROCESS?.env ? PROCESS.env : import.meta.env;

  // Supabase Config
  export const supabase_url: string = ENVIRONMENT.VITE_SUPABASE_URL;
  export const supabase_anon_key: string = ENVIRONMENT.VITE_SUPABASE_ANON_KEY;
  export const supabase_service_role_key: string =
    ENVIRONMENT.VITE_SUPABASE_SERVICE_ROLE_KEY;

  // Supabase Storage
  export const supabase_public_storage_url: string =
    ENVIRONMENT.VITE_PUBLIC_SUPABASE_STORAGE_URL;
}
