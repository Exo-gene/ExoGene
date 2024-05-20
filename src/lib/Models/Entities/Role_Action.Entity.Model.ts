import { Policy } from "./Policy.Entity.Model";
import { Role } from "./Role.Entity.Model";

export class Role_Action {
  id: string = null!;
  role_id: string = null!;
  roles?: Role = new Role();
  policies_action: string = null!;
  policies?: Policy = new Policy();
  createdAt: Date = null!;
}
