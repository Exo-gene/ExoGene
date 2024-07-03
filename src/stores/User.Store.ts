import { Dto } from "$lib/Models/Conversion/ToDTO.Conversion.Model";
import type { UserDto } from "$lib/Models/DTOS/User.DTO.Model";
import type { Store } from "$lib/Models/Responses/Store.Response.Model";
import { UsersRepository } from "$lib/Repositories/Implementation/Users.Repository";
import { get, writable } from "svelte/store";
import { CreateUserRequest } from "$lib/Models/Requests/User.Request.Model";
 
const usersRepository = new UsersRepository();

const createUserStore = () => {
  const { subscribe, set, update } = writable<Store<UserDto>>({
    data: [],
    error: null,
    count: 0,
  });

  return {
    subscribe,
    set: (data: Store<UserDto>) => set(data),
    create: async (user: CreateUserRequest, password: string) => {
      try {
        if (!user.email || user.email === "")
          throw new Error("Email is required");
        if (!password || password === "")
          throw new Error("Password is required");
         if (user.email) {
          const check = await usersRepository.getUserByEmail(user.email);
          if (check) {
            throw new Error("User already exists");
          }
        }
        const data = await usersRepository.createUser(user, password);
        const dto = Dto.ToUserDto(data);
        update((store) => {
          store.data = [...store.data, dto];
          store.count = store.data.length;
          return store;
        });
        return dto;
      } catch (error) {
        update((store) => {
          store.error = error;
          return store;
        });
      }
    },
    getAll: async () => {
      try {
        const { data, error } = await usersRepository.getUsers();
        if (error) {
          throw error;
        }
        const dtos = data.map((entity) => Dto.ToUserDto(entity));
        set({ data: dtos, error: null, count: dtos.length });
        return dtos;
      } catch (error) {
        update((store) => {
          store.error = error;
          return store;
        });
      }
    },
    get: async (id: string) => {
      try {
        const data = await usersRepository.getUser(id);
        const dto = Dto.ToUserDto(data);
        return dto;
      } catch (error) {
        update((store) => {
          store.error = error;
          return store;
        });
      }
    },
    getByUserId: async (id: string) => {
      try {
        const data = await usersRepository.getUserById(id);
        const dto = Dto.ToUserDto(data);
        return dto;
      } catch (error) {
        update((store) => {
          store.error = error;
          return store;
        });
      }
    },
    update: async (user: CreateUserRequest, password: string) => {
      try {
        if (!user.id || user.id === "") throw new Error("User ID is required");
        const document = await usersRepository.getUser(user.id);
        if (!document) throw new Error("User not found");
        if (user.email) {
          const check = await usersRepository.getUserByEmail(user.email);
          if (check && check.id !== user.id) {
            throw new Error("User with email already exists");
          }
          if (check && check.id === user.id) {
            user.email = document.email;
          }
        }
        if (!user.email || user.email === "") {
          user.email = document.email;
        }
        
        const data = await usersRepository.updateUser(user, password);
        const dto = Dto.ToUserDto(data);
        update((store) => {
          store.data = store.data.map((user) => {
            if (user.id === dto.id) {
              return dto;
            }
            return user;
          });
          return store;
        });
        return dto;
      } catch (error) {
        update((store) => {
          store.error = error;
          return store;
        });
      }
    },
    delete: async (id: string) => {
      try {
        await usersRepository.deleteUser(id);
        update((store) => {
          store.data = store.data.filter((user) => user.id !== id);
          store.count = store.data.length;
          return store;
        });
      } catch (error) {
        update((store) => {
          store.error = error;
          return store;
        });
      }
    },
  };
};

export const userStore = createUserStore();
