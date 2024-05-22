import { PolicyDto } from "./Policy.DTO.Model";
import { RoleDto } from "./Role.DTO.Model";

export class Role_ActionDto {
  id: string = null!;
  role_id: string = null!;
  roles?: RoleDto = new RoleDto();
  policy_id: string = null!;
  policies?: PolicyDto = new PolicyDto();
}
