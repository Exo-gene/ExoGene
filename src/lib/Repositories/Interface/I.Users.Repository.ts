import type { CreateUserRequest } from "$lib/Models/Requests/User.Request.Model";
import { User } from '../../Models/Entities/User.Entity.Model';
import type { SupabaseResponse } from "$lib/Models/Responses/Supabase.Response.Model";

export interface IUsersRepository {
  getUsers(): Promise<SupabaseResponse<User>>;
  getUserById(id: string): Promise<User>;
  updateUser(user: CreateUserRequest): Promise<User>;
  deleteUser(id: string): Promise<void>;
}
