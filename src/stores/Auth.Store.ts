import { Dto } from "$lib/Models/Conversion/ToDTO.Conversion.Model";
import { UserDto } from "$lib/Models/DTOS/User.DTO.Model";
import { AuthRepository } from "$lib/Repositories/Implementation/Auth.Repository";
import { UsersRepository } from "$lib/Repositories/Implementation/Users.Repository";
import { writable } from "svelte/store";

const authRepository = new AuthRepository();
const usersRepository = new UsersRepository();

const createAuthStore = () => {
  const { subscribe, set, update } = writable<UserDto | null>(null);

  return {
    subscribe,
    set: (data: UserDto | null) => set(data),
    getAuth: async () => {
      try {
        const data = await authRepository.getAuth();
        if (!data) {
          throw new Error("User not found");
        }
        const userData = await usersRepository.getUserById(data.id);
        if (!userData) {
          throw new Error("User not found in Table");
        }
        const dto = Dto.ToUserDto(userData);
        set(dto);
        return dto;
      } catch (error) {
        console.log(error);
        set(null);
      }
    },
    login: async (email: string, password: string) => {
      try {
        const data = await authRepository.login(email, password);
        if (!data) {
          throw new Error("Invalid credentials");
        }
        const userData = await usersRepository.getUserById(data.id);
        if (!userData) {
          throw new Error("User not found");
        }
        const dto = Dto.ToUserDto(userData);
        set(dto);
        return dto;
      } catch (error) {
        console.log(error);
        set(null);
      }
    },
    logout: async () => {
      try {
        await authRepository.logout();
        set(null);
      } catch (error) {
        console.log(error);
      }
    },
  };
};

export const authStore = createAuthStore();
