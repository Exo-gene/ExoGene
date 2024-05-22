import { Supabase } from "$lib/Supabase/Supabase.Client";
import type { IStorageRepository } from "../Interface/I.Storage.Repository";

export class StorageRepository implements IStorageRepository {
  async createFile(file: File): Promise<string> {
    try {
      const { data, error } = await Supabase.client.storage
        .from("images")
        .upload(`${new Date().getTime()}${file.name}`, file, {
          cacheControl: "3600",
          upsert: false,
        });
      if (error) {
        throw error;
      }
      return `https://fvbdsjgngrjqgbycgspx.supabase.co/storage/v1/object/public/images/${data.path}`;
    } catch (error) {
      throw error;
    }
  }
  async getFile(file: string): Promise<string> {
    try {
      const { data } = Supabase.client.storage
        .from("images")
        .getPublicUrl(file);

      return data.publicUrl;
    } catch (error) {
      throw error;
    }
  }
  async getFiles(): Promise<string[]> {
    try {
      throw new Error("Method not implemented.");
    } catch (error) {
      throw error;
    }
  }
  async updateFile(file: File): Promise<string> {
    try {
      const { data, error } = await Supabase.client.storage
        .from("images")
        .update(`${file.name}${new Date().getTime()}`, file, {
          cacheControl: "3600",
          upsert: true,
        });
      if (error) {
        throw error;
      }
      return data.path;
    } catch (error) {
      throw error;
    }
  }
  async deleteFile(file: string): Promise<boolean> {
    try {
      const { error } = await Supabase.client.storage
        .from("images")
        .remove([file]);
      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      throw error;
    }
  }
}
