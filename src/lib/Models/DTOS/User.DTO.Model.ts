import type { RoleWithPolicies } from "./Role.DTO.Model";

export class UserDto {
  id: string = null!;
  userName?: string;
  email: string = null!;
  phoneNumber: string = null!;
  user_id: string = null!;
  lab?: number;
  address?: string; 
  roles?: Array<RoleWithPolicies> = new Array<RoleWithPolicies>();
}
