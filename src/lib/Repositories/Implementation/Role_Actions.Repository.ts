import type { Role_Action } from "$lib/Models/Entities/Role_Action.Entity.Model";
import type {
  CreateRoleActionRequest,
  CreateRoleActionsFunctionRequest,
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
        policies_action: roleAction.policies_action,
      };
      const response = (await Supabase.client
        .from("role_actions")
        .insert(roleActionRequest)
        .select()) as SupabaseResponse<Role_Action>;
      if (response.error) {
        throw response.error;
      }
      return response.data[0];
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
  async checkRoleAction(actionId: string, roleId: string): Promise<boolean> {
    try {
      const response = (await Supabase.client
        .from("role_actions")
        .select("*")
        .eq("policies_action", actionId)
        .eq("role_id", roleId)) as SupabaseResponse<Role_Action>;
      if (response.error) {
        throw response.error;
      }
      return response.data.length > 0;
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
        policies_action: roleAction.policies_action,
      };
      const response = (await Supabase.client
        .from("role_actions")
        .update(roleActionRequest)
        .eq("id", roleAction.id)
        .select()) as SupabaseResponse<Role_Action>;
      if (response.error) {
        throw response.error;
      }
      return response.data[0];
    } catch (error) {
      throw error;
    }
  }
  async updateRoleActionWithFunction(
    roleAction: CreateRoleActionsFunctionRequest
  ) {
    try {
      const response = await Supabase.client.rpc("update_role_policies", {
        p_role_id: roleAction.role_id,
        policy_ids: roleAction.policies_ids,
      });
      if (response.error) {
        throw response.error;
      }
      const map: Role_Action[] = response.data.map((x: any) => {
        return {
          id: x.id,
          role_id: x.t_role_id,
          policies_action: x.policies_action,
        };
      });
      return map;
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
