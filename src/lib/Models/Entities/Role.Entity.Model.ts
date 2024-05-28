import type { ActionPolicy } from "./Policy.Entity.Model";

export class Role {
  id: string = null!;
  name: string = null!;
  createdAt: Date = null!;
}

export class RoleWithPolicies {
  id: string = null!;
  name: string = null!;
  policies: Array<ActionPolicy> = new Array<ActionPolicy>();
}
