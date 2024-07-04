import type { Role } from "$lib/Models/Entities/Role.Entity.Model";
import type {
  CreateRoleRequest,
  RoleRequest,
} from "$lib/Models/Requests/Role.Request.Model";
import type { SupabaseResponse } from "$lib/Models/Responses/Supabase.Response.Model";
import { Supabase } from "$lib/Supabase/Supabase.Client";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { IRolesRepository } from "../Interface/I.Roles.Repository";

export class RolesRepository implements IRolesRepository {
  async createRole(role: CreateRoleRequest): Promise<Role> {
    try {
      const roleRequest: RoleRequest = {
        name: role.name,
      };

      const response = (await Supabase.client
        .from("roles")
        .insert(roleRequest)
        .select()) as SupabaseResponse<Role>;

      if (response.error) {
        throw response.error;
      }

      return response.data[0];
    } catch (error) {
      throw error;
    }
  }

  async getRoles(): Promise<SupabaseResponse<Role>> {
    try {
      const response = (await Supabase.client
        .from("roles")
        .select(`*`)
        .is("deleted_at", null)) as SupabaseResponse<Role>;
      if (response.error) {
        throw response.error;
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getRole(id: string): Promise<Role> {
    try {
      const response = (await Supabase.client
        .from("roles")
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)) as SupabaseResponse<Role>;
      if (response.error) {
        throw response.error;
      }
      return response.data[0];
    } catch (error) {
      throw error;
    }
  }

  async updateRole(role: CreateRoleRequest): Promise<Role> {
    try {
      const roleRequest: RoleRequest = {
        name: role.name,
      };
      const response = (await Supabase.client
        .from("roles")
        .update(roleRequest)
        .eq("id", role.id!)
        .select()) as SupabaseResponse<Role>;
      if (response.error) {
        throw response.error;
      }
      return response.data[0];
    } catch (error) {
      throw error;
    }
  }

  async deleteRole(id: string): Promise<void> {
    try {
      const response = (await Supabase.client
        .from("roles")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id)) as PostgrestSingleResponse<Role>;
      if (response.error) {
        throw response.error;
      }
    } catch (error) {
      throw error;
    }
  }
}
