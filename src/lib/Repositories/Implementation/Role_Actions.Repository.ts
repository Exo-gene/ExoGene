import type { Role_Action } from "$lib/Models/Entities/Role_Action.Entity.Model";
import type {
  CreateRoleActionRequest,
  RoleActionRequest,
} from "$lib/Models/Requests/Role_Action.Request.Model";
import type { SupabaseResponse } from "$lib/Models/Responses/Supabase.Response.Model";
import { Supabase } from "$lib/Supabase/Supabase.Client";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { IRoleActionsRepository } from "../Interface/I.Role_Actions.Repository";

export class RoleActionsRepository implements IRoleActionsRepository {
  async createRoleAction(
    roleAction: CreateRoleActionRequest
  ): Promise<Role_Action> {
    try {
      const roleActionRequest: RoleActionRequest = {
        role_id: roleAction.role_id,
        action_id: roleAction.action_id,
      };
      const response = (await Supabase.client
        .from("role_actions")
        .insert(roleActionRequest)) as PostgrestSingleResponse<Role_Action>;
      if (response.error) {
        throw response.error;
      }
      return response.data!;
    } catch (error) {
      throw error;
    }
  }
  async getRoleActions(): Promise<SupabaseResponse<Role_Action>> {
    try {
      const response = (await Supabase.client
        .from("role_actions")
        .select(
          "*,policies:policies_action (id:action,name,created_at)"
        )) as SupabaseResponse<Role_Action>;
      if (response.error) {
        throw response.error;
      }
      console.log("Repository Data", response);
      return response;
    } catch (error) {
      throw error;
    }
  }
  async getRoleAction(id: string): Promise<Role_Action> {
    try {
      const response = (await Supabase.client
        .from("role_actions")
        .select("*")
        .eq("id", id)) as SupabaseResponse<Role_Action>;
      if (response.error) {
        throw response.error;
      }
      return response.data[0];
    } catch (error) {
      throw error;
    }
  }
  async getRoleActionsByRole(
    roleId: string
  ): Promise<SupabaseResponse<Role_Action>> {
    try {
      console.log("Role ID", roleId);

      const response = (await Supabase.client
        .from("role_actions")
        .select("*,policies:policies_action (id:action,name,created_at)")
        .eq("role_id", roleId)) as SupabaseResponse<Role_Action>;
      if (response.error) {
        throw response.error;
      }
      return response;
    } catch (error) {
      throw error;
    }
  }
  async updateRoleAction(
    roleAction: CreateRoleActionRequest
  ): Promise<Role_Action> {
    try {
      const roleActionRequest: RoleActionRequest = {
        role_id: roleAction.role_id,
        action_id: roleAction.action_id,
      };
      const response = (await Supabase.client
        .from("role_actions")
        .update(roleActionRequest)
        .eq("id", roleAction.id!)) as PostgrestSingleResponse<Role_Action>;
      if (response.error) {
        throw response.error;
      }
      return response.data!;
    } catch (error) {
      throw error;
    }
  }
  async deleteRoleAction(id: string): Promise<void> {
    try {
      const response = (await Supabase.client
        .from("role_actions")
        .delete()
        .eq("id", id)) as PostgrestSingleResponse<Role_Action>;
      if (response.error) {
        throw response.error;
      }
    } catch (error) {
      throw error;
    }
  }
}
