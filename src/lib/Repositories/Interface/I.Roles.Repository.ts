import type { Role } from "$lib/Models/Entities/Role.Entity.Model";
import type { CreateRoleRequest } from "$lib/Models/Requests/Role.Request.Model";
import type { SupabaseResponse } from "$lib/Models/Responses/Supabase.Response.Model";

export interface IRolesRepository {
  createRole(role: CreateRoleRequest): Promise<Role>;
  getRoles(): Promise<SupabaseResponse<Role>>;
  getRole(id: string): Promise<Role>;
  updateRole(role: CreateRoleRequest): Promise<Role>;
  deleteRole(id: string): Promise<void>;
}
