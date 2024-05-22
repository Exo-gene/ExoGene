import type { User, UserResponse } from "@supabase/supabase-js";

export interface IAuthRepository {
  getAuth(): Promise<User | null>;
  login(email: string, password: string): Promise<User | null>;
  logout(): Promise<void>;
}
