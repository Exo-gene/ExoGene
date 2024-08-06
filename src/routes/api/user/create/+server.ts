import type { RequestHandler } from "@sveltejs/kit";
import {
  createClient,
  type PostgrestSingleResponse,
  type UserResponse,
} from "@supabase/supabase-js";
import type { UserRequest } from "$lib/Models/Requests/User.Request.Model";
import type { User } from "$lib/Models/Entities/User.Entity.Model";
import { Supabase } from "$lib/Supabase/Supabase.Client";
import type { SupabaseResponse } from "$lib/Models/Responses/Supabase.Response.Model";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const serviceRoleKey = import.meta.env.VITE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
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
    const userTable = (await Supabase.client
      .from("users")
      .insert(user)
      .select()) as SupabaseResponse<User>;
    if (userTable.error) {
      throw userTable.error;
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: "User created successfully",
        user: userTable.data[0],
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
