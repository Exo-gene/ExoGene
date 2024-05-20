import type { Policy } from "$lib/Models/Entities/Policy.Entity.Model";
import type { SupabaseResponse } from "$lib/Models/Responses/Supabase.Response.Model";
import { Supabase } from "$lib/Supabase/Supabase.Client";
import type { IPoliciesRepository } from "../Interface/I.Policies.Repository";

export class PoliciesRepository implements IPoliciesRepository {
  async getPolicies(): Promise<SupabaseResponse<Policy>> {
    try {
      const response = (await Supabase.client
        .from("policies")
        .select("*")) as SupabaseResponse<Policy>;
      if (response.error) {
        throw response.error;
      }
      return response;
    } catch (error) {
      throw error;
    }
  }
  async getPolicy(id: string): Promise<Policy> {
    try {
      const response = (await Supabase.client
        .from("policies")
        .select("*")
        .eq("id", id)) as SupabaseResponse<Policy>;
      if (response.error) {
        throw response.error;
      }
      return response.data[0];
    } catch (error) {
      throw error;
    }
  }
}
