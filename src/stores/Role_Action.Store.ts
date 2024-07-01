import type { Store } from "$lib/Models/Responses/Store.Response.Model";
import { writable } from "svelte/store";
import { RoleActionsRepository } from "../lib/Repositories/Implementation/Role_Actions.Repository";
import type { Role_ActionDto } from "$lib/Models/DTOS/Role_Action.DTO.Model";
import { Dto } from "$lib/Models/Conversion/ToDTO.Conversion.Model";
import type { CreateRoleActionRequest, CreateRoleActionsFunctionRequest } from "$lib/Models/Requests/Role_Action.Request.Model";
const roleActionsRepository = new RoleActionsRepository();

const createRoleActionStore = () => {
  const { subscribe, set, update } = writable<Store<Role_ActionDto>>({
    data: [],
    error: null,
    count: 0,
  });

  return {
    subscribe,
    set: (data: Store<Role_ActionDto>) => set(data),
    create: async (roleAction: CreateRoleActionRequest) => {
      try {
        if (!roleAction.role_id || roleAction.role_id === "") {
          throw new Error("Role ID is required");
        }
        if (
          roleAction.policies_action == null ||
          roleAction.policies_action === ""
        ) {
          throw new Error("Action ID is required");
        }
        if (roleAction.policies_action != null && roleAction.role_id) {
          const check = await roleActionsRepository.checkRoleAction(
            roleAction.policies_action,
            roleAction.role_id
          );
          if (check) {
            return null;
          }
        }
        const data = await roleActionsRepository.createRoleAction(roleAction);

        const dto = Dto.ToRoleActionDto(data);
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
        console.log("Role Action Error", error);
        update((store) => {
          store.error = error;
          return store;
        });
      }
    },
    getAll: async () => {
      try {
        const { data, error } = await roleActionsRepository.getRoleActions();
        if (error) {
          throw error;
        }
        const dtos = data.map((entity) => Dto.ToRoleActionDto(entity));
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
        const data = await roleActionsRepository.getRoleAction(id);
        const dto = Dto.ToRoleActionDto(data);
        return dto;
      } catch (error) {
        update((store) => {
          store.error = error;
          return store;
        });
      }
    },
    getRoleActionsByRole: async (roleId: string) => {
      try {
        const { data, error } =
          await roleActionsRepository.getRoleActionsByRole(roleId);
        if (error) {
          throw error;
        }
        const dtos = data.map((entity) => Dto.ToRoleActionDto(entity));
        return dtos;
      } catch (error) {
        update((store) => {
          store.error = error;
          return store;
        });
      }
    },
    update: async (roleAction: CreateRoleActionRequest) => {
      try {
        if (!roleAction.role_id || roleAction.role_id === "") {
          throw new Error("Role ID is required");
        }
        if (!roleAction.policies_action || roleAction.policies_action === "") {
          throw new Error("Action ID is required");
        }
        const data = await roleActionsRepository.updateRoleAction(roleAction);
        const dto = Dto.ToRoleActionDto(data);
        update((store) => {
          store.data = store.data.map((roleAction) => {
            if (roleAction.id === dto.id) {
              return dto;
            }
            return roleAction;
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
    updateFunction: async (roleAction: CreateRoleActionsFunctionRequest) => {
      try {
        if (!roleAction.role_id || roleAction.role_id === "") {
          throw new Error("Role ID is required");
        }
        if (!roleAction.policies_ids || roleAction.policies_ids.length === 0) {
          throw new Error("Action ID is required");
        }
        const data = await roleActionsRepository.updateRoleActionWithFunction(
          roleAction
        );
         const dtos = data.map((entity) => Dto.ToRoleActionDto(entity));
        update((store) => {
          store.data = dtos;
          store.count = dtos.length;
          return store;
        });
        return dtos;
      } catch (error) {
        update((store) => {
          store.error = error;
          return store;
        });
      }
    },
    delete: async (id: string) => {
      try {
        await roleActionsRepository.deleteRoleAction(id);
        update((store) => {
          store.data = store.data.filter((roleAction) => roleAction.id !== id);
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

export const roleActionStore = createRoleActionStore();
