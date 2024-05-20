import type {
  CreateUserRequest,
  UserRequest,
} from "$lib/Models/Requests/User.Request.Model";
import type { IUsersRepository } from "../Interface/I.Users.Repository";
import { Supabase } from "$lib/Supabase/Supabase.Client";
import type { SupabaseResponse } from "$lib/Models/Responses/Supabase.Response.Model";
import type { User } from "$lib/Models/Entities/User.Entity.Model";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";

export class UsersRepository implements IUsersRepository {
  async getUsers(): Promise<SupabaseResponse<User>> {
    try {
      const response = (await Supabase.client
        .from("users")
        .select("*")) as SupabaseResponse<User>;
      if (response.error) {
        throw response.error;
      }
      return response;
    } catch (error) {
      throw error;
    }
  }
  async getUserById(id: string): Promise<User> {
    try {
      const response = (await Supabase.client
        .from("users")
        .select("*")
        .eq("user_id::UUID", id)) as SupabaseResponse<User>;
      if (response.error) {
        throw response.error;
      }
      return response.data[0];
    } catch (error) {
      throw error;
    }
  }
  async updateUser(user: CreateUserRequest): Promise<User> {
    try {
      const userRequest: UserRequest = {
        name: user.name,
        email: user.email,
        image: user.image,
        user_id: user.user_id,
      };
      const response = (await Supabase.client
        .from("users")
        .update(userRequest)
        .eq("id", user.id!)) as PostgrestSingleResponse<User>;
      if (response.error) {
        throw response.error;
      }
      return response.data!;
    } catch (error) {
      throw error;
    }
  }
  async deleteUser(id: string): Promise<void> {
    try {
      const response = (await Supabase.client
        .from("users")
        .delete()
        .eq("id", id)) as PostgrestSingleResponse<User>;
      if (response.error) {
        throw response.error;
      }
    } catch (error) {
      throw error;
    }
  }
}
