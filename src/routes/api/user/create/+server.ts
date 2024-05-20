import type { RequestHandler } from "@sveltejs/kit";
import { createClient, type UserResponse } from "@supabase/supabase-js";
import { Enviroments } from "$lib/Env/Enviroments";

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
  try {
    const response = (await admin.createUser({
      email: "rovarkamil@hotmail.com",
      password: "900mylife",
    })) as UserResponse;
    if (response.error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to create user",
          data: { error: response.error },
        })
      );
    }
    const { error } = await supabase.auth.admin.generateLink({
      type: "invite",
      email: response.data.user.email as string,
    });
    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to send invite",
          data: { error },
        })
      );
    }
    await supabase.from("users").insert({
      email: response.data.user.email,
      user_id: response.data.user.id,
      name: "Rovar Kamil",
    });
    return new Response(
      JSON.stringify({
        success: true,
        message: "User created successfully",
        data: response,
      })
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to operate on user",
        data: { error },
      })
    );
  }
};
