import type { RequestHandler } from "@sveltejs/kit";
import { Policies } from "$lib/Models/Enums/Policies.Enum.Model";
import { Supabase } from "$lib/Supabase/Supabase.Client";

export const POST: RequestHandler = async ({ locals, params, request }) => {
  try {
    console.log("Processing policies");
    let policies: { name: string; action: number }[] = Object.keys(Policies)
      .filter((key) => isNaN(Number(key)))
      .map((key, value) => ({ name: key, action: value }));
    console.log("Policies", policies);

    const { error } = await Supabase.client.from("policies").insert(policies);
    console.log("Error", error);
    return new Response(
      JSON.stringify({ success: true, message: "Policies processed" })
    );
  } catch (e) {
    console.log("Error", e);
    return new Response(
      JSON.stringify({
        success: false,
        message: "An error occurred while processing policies",
      }),
      { status: 500 }
    );
  }
};
