import type { User_Role } from "$lib/Models/Entities/User_Role.Entity.Model";
import type { CreateUser_RoleRequest } from "$lib/Models/Requests/User_Role.Request.Model";
import type { SupabaseResponse } from "$lib/Models/Responses/Supabase.Response.Model";

export interface IUser_RolesRepository {
  create(user_role: CreateUser_RoleRequest): Promise<User_Role>;
  get(user_role_id: string): Promise<User_Role>;
  getAll(): Promise<SupabaseResponse<User_Role>>;
  getRoleByUserId(user_id: string): Promise<SupabaseResponse<User_Role>>;
  update(user_role: CreateUser_RoleRequest): Promise<User_Role>;
  delete(user_role_id: string): Promise<void>;
}
