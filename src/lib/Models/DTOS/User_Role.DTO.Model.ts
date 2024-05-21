import { RoleDto } from "./Role.DTO.Model";
import { UserDto } from "./User.DTO.Model";

export class User_RoleDto {
  id: string = null!;
  role_id: string = null!;
  roles?: RoleDto = new RoleDto();
  user_id: string = null!;
  users?: UserDto = new UserDto();
  created_at: Date = new Date();
}
