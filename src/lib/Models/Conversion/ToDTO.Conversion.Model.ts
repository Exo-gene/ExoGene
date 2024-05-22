import type { PolicyDto } from "../DTOS/Policy.DTO.Model";
import type { RoleDto } from "../DTOS/Role.DTO.Model";
import type { Role_ActionDto } from "../DTOS/Role_Action.DTO.Model";
import type { UserDto } from "../DTOS/User.DTO.Model";
import type { User_RoleDto } from "../DTOS/User_Role.DTO.Model";
import { Policy } from "../Entities/Policy.Entity.Model";
import { Role } from "../Entities/Role.Entity.Model";
import type { Role_Action } from "../Entities/Role_Action.Entity.Model";
import { User } from "../Entities/User.Entity.Model";
import type { User_Role } from "../Entities/User_Role.Entity.Model";

export class Dto {
  static ToUserDto(entity: User): UserDto {
    try {
      return {
        id: entity.id,
        name: entity.name,
        email: entity.email,
        image: entity.image,
      };
    } catch (error) {
      throw error;
    }
  }
  static ToRoleDto(entity: Role): RoleDto {
    try {      
      return {
        id: entity.id,
        name: entity.name,
      };
    } catch (error) {
      throw error;
    }
  }
  static ToPolicyDto(entity: Policy): PolicyDto {
    try {
      return {
        id: entity.id,
        name: entity.name,
      };
    } catch (error) {
      throw error;
    }
  }
  static ToRoleActionDto(entity: Role_Action): Role_ActionDto {
    try {
      console.log(entity);

      return {
        id: entity.id,
        role_id: entity.role_id,
        roles: Dto.ToRoleDto(entity.roles ?? new Role()),
        policy_id: entity.policies_action,
        policies: Dto.ToPolicyDto(entity.policies ?? new Policy()),
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  static ToUserRoleDto(entity: User_Role): User_RoleDto {
    try {
      return {
        id: entity.id,
        role_id: entity.role_id,
        roles: Dto.ToRoleDto(entity.roles ?? new Role()),
        user_id: entity.user_id,
        users: Dto.ToUserDto(entity.users ?? new User()),
        created_at: entity.created_at,
      };
    } catch (error) {
      throw error;
    }
  }
}
