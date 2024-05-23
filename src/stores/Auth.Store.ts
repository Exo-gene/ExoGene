import { Dto } from "$lib/Models/Conversion/ToDTO.Conversion.Model";
import { UserDto } from "$lib/Models/DTOS/User.DTO.Model";
import { AuthRepository } from "$lib/Repositories/Implementation/Auth.Repository";
import { RoleActionsRepository } from "$lib/Repositories/Implementation/Role_Actions.Repository";
import { User_RolesRepository } from "$lib/Repositories/Implementation/User_Roles.Repository";
import { UsersRepository } from "$lib/Repositories/Implementation/Users.Repository";
import { writable } from "svelte/store";

const authRepository = new AuthRepository();
const usersRepository = new UsersRepository();
const userRolesRepository = new User_RolesRepository();
const roleActionsRepository = new RoleActionsRepository();

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
        console.log("Data", data);
        usersRepository.getUserByFunction(data.id);
        
        const userData = await usersRepository.getUserById(data.id);
        if (!userData) {
          throw new Error("User not found in Table");
        }
        const userRoles = await userRolesRepository.getRoleByUserId(
          userData.id
        );
        if (!userRoles) {
          throw new Error("User Role not found");
        }
        const userComplete = {
          roles: await Promise.all(
            userRoles.data.map(async (role) => {
              const policies = await roleActionsRepository.getRoleActionsByRole(
                role.role_id
              );
              return {
                name: role.roles?.name,
                policies: policies.data.map((policy) => {
                  return {
                    id: policy.policies?.id,
                    name: policy.policies?.name,
                  };
                }),
              };
            })
          ),
        };
        const dto = Dto.ToUserDto(userData);
        dto.roles = userComplete.roles;
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
        const userRoles = await userRolesRepository.getRoleByUserId(
          userData.id
        );
        if (!userRoles) {
          throw new Error("User Role not found");
        }
        const userComplete = {
          roles: await Promise.all(
            userRoles.data.map(async (role) => {
              const policies = await roleActionsRepository.getRoleActionsByRole(
                role.role_id
              );
              return {
                name: role.roles?.name,
                policies: policies.data.map((policy) => {
                  return {
                    id: policy.policies?.id,
                    name: policy.policies?.name,
                  };
                }),
              };
            })
          ),
        };
        const dto = Dto.ToUserDto(userData);
        dto.roles = userComplete.roles;
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
