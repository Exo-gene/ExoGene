import type { RequestHandler } from "@sveltejs/kit";
import {
  createClient,
  type UserResponse,
} from "@supabase/supabase-js";
import type { UserRequest } from "$lib/Models/Requests/User.Request.Model";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

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
