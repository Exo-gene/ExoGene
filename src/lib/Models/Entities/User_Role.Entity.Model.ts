import { Role } from "./Role.Entity.Model";
import { User } from "./User.Entity.Model";

export class User_Role {
  id: string = null!;
  role_id: string = null!;
  roles?: Role = new Role();
  user_id: string = null!;
  users?: User = new User();
  created_at: Date = new Date();
}
