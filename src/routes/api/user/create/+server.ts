import type { RequestHandler } from "@sveltejs/kit";
import {
  createClient,
  type PostgrestSingleResponse,
  type UserResponse,
} from "@supabase/supabase-js";
import { Enviroments } from "$lib/Env/Enviroments";
import type { UserRequest } from "$lib/Models/Requests/User.Request.Model";
import type { User } from "$lib/Models/Entities/User.Entity.Model";

const supabase = createClient(
  Enviroments.supabase_url,
  Enviroments.supabase_service_role_key,
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
    const response = (await admin.createUser({
      email: user.email,
      password: password,
      email_confirm: true,
    })) as UserResponse;
    if (response.error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Failed to create user ${response.error.message}`,
          user: null,
        })
      );
    }
    user.user_id = response.data.user.id;
    const response_2 = (await supabase
      .from("users")
      .insert(user)) as PostgrestSingleResponse<User>;
    return new Response(
      JSON.stringify({
        success: true,
        message: "User created successfully",
        user: response_2.data,
      })
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: `Failed to operate on user ${error}`,
        user: null,
      })
    );
  }
};
