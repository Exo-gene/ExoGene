import type { RoleWithPolicies } from "./Role.Entity.Model";

export class User {
  id: string = null!;
  userName?: string;
  email: string = null!;
  phoneNumber: string = null!;
  user_id: string = null!;
  created_at: string = null!;
  lab?: number;
  address?: string;
  roles?: Array<RoleWithPolicies> = new Array<RoleWithPolicies>();
}

export class UserWithRole extends User {
  roles: RoleWithPolicies[] = [];
}
