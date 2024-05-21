import { Dto } from "$lib/Models/Conversion/ToDTO.Conversion.Model";
import type { User_RoleDto } from "$lib/Models/DTOS/User_Role.DTO.Model";
import type { CreateUser_RoleRequest } from "$lib/Models/Requests/User_Role.Request.Model";
import type { Store } from "$lib/Models/Responses/Store.Response.Model";
import { User_RolesRepository } from "$lib/Repositories/Implementation/User_Roles.Repository";
import { get, writable } from "svelte/store";

const user_RolesRepository = new User_RolesRepository();

const createUserRoleStore = () => {
  const { subscribe, set, update } = writable<Store<User_RoleDto>>({
    data: [],
    error: null,
    count: 0,
  });

  return {
    subscribe,
    set: (data: Store<User_RoleDto>) => set(data),
    create: async (user_role: CreateUser_RoleRequest) => {
      try {
        if (!user_role.role_id || user_role.role_id === "")
          throw new Error("Role ID is required");
        if (!user_role.user_id || user_role.user_id === "")
          throw new Error("User ID is required");
        const data = await user_RolesRepository.create(user_role);
        const dto = Dto.ToUserRoleDto(data);
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
    get: async (id: string) => {
      try {
        const data = await user_RolesRepository.get(id);
        const dto = Dto.ToUserRoleDto(data);
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
        const { data, error } = await user_RolesRepository.getAll();
        if (error) {
          throw error;
        }
        const dtos = data.map((entity) => Dto.ToUserRoleDto(entity));
        set({ data: dtos, error: null, count: dtos.length });
        return dtos;
      } catch (error) {
        update((store) => {
          store.error = error;
          return store;
        });
      }
    },
    getRolesByUserId: async (user_id: string) => {
      try {
        if (!user_id || user_id === "") throw new Error("User ID is required");
        const { data, error } = await user_RolesRepository.getRoleByUserId(
          user_id
        );
        if (error) {
          throw error;
        }
        const dtos = data.map((entity) => Dto.ToUserRoleDto(entity));
        return dtos;
      } catch (error) {
        update((store) => {
          store.error = error;
          return store;
        });
      }
    },
    update: async (user_role: CreateUser_RoleRequest) => {
      try {
        const data = await user_RolesRepository.update(user_role);
        const dto = Dto.ToUserRoleDto(data);
        update((store) => {
          store.data = store.data.map((user_role) => {
            if (user_role.id === dto.id) {
              return dto;
            }
            return user_role;
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
    delete: async (user_role_id: string) => {
      try {
        await user_RolesRepository.delete(user_role_id);
        update((store) => {
          store.data = store.data.filter(
            (user_role) => user_role.id !== user_role_id
          );
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

export const userRoleStore = createUserRoleStore();
