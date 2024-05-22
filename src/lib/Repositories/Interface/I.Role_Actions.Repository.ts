import type { Role_Action } from "$lib/Models/Entities/Role_Action.Entity.Model";
import type { CreateRoleActionRequest } from "$lib/Models/Requests/Role_action.Request.Model";
import type { SupabaseResponse } from "$lib/Models/Responses/Supabase.Response.Model";

export interface IRoleActionsRepository {
  getRoleActions(): Promise<SupabaseResponse<Role_Action>>;
  getRoleAction(id: string): Promise<Role_Action>;
  getRoleActionsByRole(roleId: string): Promise<SupabaseResponse<Role_Action>>;
  createRoleAction(roleAction: CreateRoleActionRequest): Promise<Role_Action>;
  updateRoleAction(roleAction: CreateRoleActionRequest): Promise<Role_Action>;
  deleteRoleAction(id: string): Promise<void>;
}
