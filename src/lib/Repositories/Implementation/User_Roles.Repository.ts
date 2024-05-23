import type { User_Role } from "$lib/Models/Entities/User_Role.Entity.Model";
import type {
  CreateUser_RoleRequest,
  User_RoleRequest,
} from "$lib/Models/Requests/User_Role.Request.Model";
import type { SupabaseResponse } from "$lib/Models/Responses/Supabase.Response.Model";
import { Supabase } from "$lib/Supabase/Supabase.Client";
import type { IUser_RolesRepository } from "../Interface/I.User_Roles.Repository";

export class User_RolesRepository implements IUser_RolesRepository {
  async create(user_role: CreateUser_RoleRequest): Promise<User_Role> {
    try {
      const userRoleRequest: User_RoleRequest = {
        role_id: user_role.role_id,
        user_id: user_role.user_id,
      };
      console.log("User Role Repository", userRoleRequest);
      const response = (await Supabase.client
        .from("user_role")
        .insert(userRoleRequest)
        .select()) as SupabaseResponse<User_Role>;
      if (response.error) {
        throw response.error;
      }
      return response.data[0];
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }
  async get(user_role_id: string): Promise<User_Role> {
    try {
      const response = (await Supabase.client
        .from("user_role")
        .select("*")
        .eq("id", user_role_id)) as SupabaseResponse<User_Role>;
      if (response.error) {
        throw response.error;
      }
      return response.data[0];
    } catch (error) {
      throw error;
    }
  }
  async getAll(): Promise<SupabaseResponse<User_Role>> {
    try {
      const response = (await Supabase.client
        .from("user_role")
        .select("*")) as SupabaseResponse<User_Role>;
      if (response.error) {
        throw response.error;
      }
      return response;
    } catch (error) {
      throw error;
    }
  }
  async getRoleByUserId(user_id: string): Promise<SupabaseResponse<User_Role>> {
    try {
      const response = (await Supabase.client
        .from("user_role")
        .select("*,roles:role_id(id,name)")
        .eq("user_id", user_id)) as SupabaseResponse<User_Role>;
      if (response.error) {
        throw response.error;
      }
      return response;
    } catch (error) {
      throw error;
    }
  }
  async checkRoleWithUserId(
    role_id: string,
    user_id: string
  ): Promise<boolean> {
    try {
      const response = (await Supabase.client
        .from("user_role")
        .select("*")
        .eq("role_id", role_id)
        .eq("user_id", user_id)) as SupabaseResponse<User_Role>;
      if (response.error) {
        throw response.error;
      }
      return response.data.length > 0;
    } catch (error) {
      throw error;
    }
  }
  async update(user_role: CreateUser_RoleRequest): Promise<User_Role> {
    try {
      const userRoleRequest: User_RoleRequest = {
        role_id: user_role.role_id,
        user_id: user_role.user_id,
      };
      const response = (await Supabase.client
        .from("user_role")
        .update(userRoleRequest)
        .eq("id", user_role.id!)
        .select()) as SupabaseResponse<User_Role>;
      if (response.error) {
        throw response.error;
      }
      return response.data[0];
    } catch (error) {
      throw error;
    }
  }
  async delete(user_role_id: string): Promise<void> {
    try {
      const response = await Supabase.client
        .from("user_role")
        .delete()
        .eq("id", user_role_id);
      if (response.error) {
        throw response.error;
      }
    } catch (error) {
      throw error;
    }
  }
}
