import type {
  CreateUserRequest,
  UserRequest,
} from "$lib/Models/Requests/User.Request.Model";
import type { IUsersRepository } from "../Interface/I.Users.Repository";
import { Supabase } from "$lib/Supabase/Supabase.Client";
import type { SupabaseResponse } from "$lib/Models/Responses/Supabase.Response.Model";
import type {
  User,
  UserWithRole,
} from "$lib/Models/Entities/User.Entity.Model";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";

export class UsersRepository implements IUsersRepository {
  async createUser(user: CreateUserRequest, password: string): Promise<User> {
    try {
      const userRequest: UserRequest = {
        userName: user.userName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        user_id: user.user_id,
        lab: user.lab,
        address: user.address,
      };

      const response = await fetch("/api/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: userRequest, password: password }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = (await response.json()) as {
        success: boolean;
        message: string;
        user: User;
      };
      if (!data.success) {
        throw new Error(data.message);
      }
      return data.user;
    } catch (error) {
      throw error;
    }
  }

  async getUsers(): Promise<SupabaseResponse<User>> {
    try {
      const response = (await Supabase.client
        .from("users")
        .select("*")
        .is("deleted_at", null)) as SupabaseResponse<User>;
      if (response.error) {
        throw response.error;
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getUser(id: string): Promise<User> {
    try {
      const response = (await Supabase.client
        .from("users")
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)) as SupabaseResponse<User>;
      if (response.error) {
        throw response.error;
      }
      return response.data[0];
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const response = (await Supabase.client
        .from("users")
        .select("*")
        .eq("user_id::UUID", id)
        .is("deleted_at", null)) as SupabaseResponse<User>;
      if (response.error) {
        throw response.error;
      }
      return response.data[0];
    } catch (error) {
      throw error;
    }
  }

  async getUserByUserIdWithFunction(user_id: string) {
    try {
      const response = (await Supabase.client.rpc(
        "get_user_by_userid_with_roles_policies",
        { input_user_id: user_id }
      )) as PostgrestSingleResponse<UserWithRole>;
      if (response.error) {
        throw response.error;
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    try {
      const response = (await Supabase.client
        .from("users")
        .select("*")
        .eq("email", email)
        .is("deleted_at", null)) as SupabaseResponse<User>;
      if (response.error) {
        throw response.error;
      }
      return response.data[0];
    } catch (error) {
      throw error;
    }
  }

  async updateUser(user: CreateUserRequest, password?: string): Promise<User> {
    try {
      const userRequest: UserRequest = {
        userName: user.userName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        user_id: user.user_id,
        lab: user.lab,
        address: user.address,
      };
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: userRequest, password: password }),
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = (await Supabase.client
        .from("users")
        .update(userRequest)
        .eq("id", user.id!)
        .select()) as SupabaseResponse<User>;
      if (data.error) {
        throw data.error;
      }
      return data.data[0];
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const response = (await Supabase.client
        .from("users")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id)) as PostgrestSingleResponse<User>;
      if (response.error) {
        throw response.error;
      }
    } catch (error) {
      throw error;
    }
  }
}
