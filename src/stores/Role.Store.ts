import { Dto } from "$lib/Models/Conversion/ToDTO.Conversion.Model";
import type { RoleDto } from "$lib/Models/DTOS/Role.DTO.Model";
import type { CreateRoleRequest } from "$lib/Models/Requests/Role.Request.Model";
import type { Store } from "$lib/Models/Responses/Store.Response.Model";
import { RolesRepository } from "$lib/Repositories/Implementation/Roles.Repository";
import { writable } from "svelte/store";

const rolesRepository = new RolesRepository();

const createRoleStore = () => {
  const { subscribe, set, update } = writable<Store<RoleDto>>({
    data: [],
    error: null,
    count: 0,
  });

  return {
    subscribe,
    set: (data: Store<RoleDto>) => set(data),
    create: async (role: CreateRoleRequest) => {
      try {
        if (!role.name || role.name === "") {
          throw new Error("Role name is required");
        }
        const data = await rolesRepository.createRole(role);
        const dto = Dto.ToRoleDto(data);
        update((store) => {
          if (store.data) {
            store.data = [...store.data, dto];
            store.count = store.data.length;
            return store;
          } else {
            store.data = [dto];
            store.count = 1;
            return store;
          }
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
        const { data, error } = await rolesRepository.getRoles();
        if (error) {
          throw error;
        }
        const dtos = data.map((entity) => Dto.ToRoleDto(entity));
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
        if (!id || id === "") {
          throw new Error("Role ID is required");
        }
        const data = await rolesRepository.getRole(id);
        const dto = Dto.ToRoleDto(data);
        return dto;
      } catch (error) {
        update((store) => {
          store.error = error;
          return store;
        });
      }
    },
    update: async (role: CreateRoleRequest) => {
      try {
        if (!role.id || role.id === "") {
          throw new Error("Role ID is required");
        }
        if (!role.name || role.name === "") {
          throw new Error("Role name is required");
        }
        const data = await rolesRepository.updateRole(role);
        const dto = Dto.ToRoleDto(data);
        update((store) => {
          store.data = store.data.map((role) => {
            if (role.id === dto.id) {
              return dto;
            }
            return role;
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
        if (!id || id === "") {
          throw new Error("Role ID is required");
        }
        await rolesRepository.deleteRole(id);
        update((store) => {
          store.data = store.data.filter((role) => role.id !== id);
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

export const roleStore = createRoleStore();
