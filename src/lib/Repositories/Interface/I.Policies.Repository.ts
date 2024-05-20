import type { Policy } from "$lib/Models/Entities/Policy.Entity.Model";
import type { SupabaseResponse } from "$lib/Models/Responses/Supabase.Response.Model";

export interface IPoliciesRepository {
  getPolicies(): Promise<SupabaseResponse<Policy>>;
  getPolicy(id: string): Promise<Policy>;
}
