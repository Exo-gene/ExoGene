import type { RequestHandler } from "@sveltejs/kit";
import {
  createClient,
  type PostgrestSingleResponse,
  type UserResponse,
} from "@supabase/supabase-js";
import { Enviroments } from "$lib/Env/Enviroments";
import type { UserRequest } from "$lib/Models/Requests/User.Request.Model";
import type { User } from "$lib/Models/Entities/User.Entity.Model";
import { Supabase } from "$lib/Supabase/Supabase.Client";
import type { SupabaseResponse } from "$lib/Models/Responses/Supabase.Response.Model";
import { VITE_SERVICE_ROLE_KEY, VITE_SUPABASE_URL } from "$env/static/public";

const supabase = createClient(VITE_SUPABASE_URL, VITE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const admin = supabase.auth.admin;

export const POST: RequestHandler = async ({ locals, params, request }) => {
  const { user, password } = (await request.json()) as {
    user: UserRequest;
    password: string;
  };
  try {
    if (user.email || user.email !== "") {
      const response = (await admin.updateUserById(user.user_id, {
        email: user.email,
        email_confirm: true,
      })) as UserResponse;

      if (response.error) {
        return new Response(
          JSON.stringify({
            success: false,
            message: `Failed to update user ${response.error.message}`,
            error: response.error,
          })
        );
      }
    }
    // console.log("Password", password);

    if (password || password !== "") {
      const response = (await admin.updateUserById(user.user_id, {
        password: password,
      })) as UserResponse;
      if (response.error) {
        return new Response(
          JSON.stringify({
            success: false,
            message: `Failed to update user ${response.error.message}`,
            error: response.error,
          })
        );
      }
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: "User updated successfully",
        error: null,
      })
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: `Failed to operate on user ${error}`,
        error: error,
      })
    );
  }
};
