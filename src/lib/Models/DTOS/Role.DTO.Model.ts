import type { PolicyDto } from "./Policy.DTO.Model";

export class RoleDto {
  id: string = null!;
  name: string = null!;
}

export class RoleWithPolicies {
  id: string = null!;
  name: string = null!;
  policies: Array<PolicyDto> = new Array<PolicyDto>();
}