import type { User, UserResponse } from "@supabase/supabase-js";
import type { IAuthRepository } from "../Interface/I.Auth.Repository";
import { Supabase } from "$lib/Supabase/Supabase.Client";
export class AuthRepository implements IAuthRepository {
  async getAuth(): Promise<User | null> {
    try {
      const {
        data: { user },
        error,
      } = await Supabase.client.auth.getUser();
      if (error) {
        throw error;
      }
      return user;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        return null;
      }
      return null;
    }
  }
  async login(email: string, password: string): Promise<User | null> {
    try {
      const {
        data: { user },
        error,
      } = await Supabase.client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
      return user;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        return null;
      }
      return null;
    }
  }
  async logout(): Promise<void> {
    try {
      const { error } = await Supabase.client.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }
}
