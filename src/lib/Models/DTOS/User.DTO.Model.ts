import type { RoleWithPolicies } from "./Role.DTO.Model";

export class UserDto {
  id: string = null!;
  name?: string;
  email: string = null!;
  image?: string;
  user_id: string = null!;
  roles?:Array<RoleWithPolicies> = new Array<RoleWithPolicies>();
}
