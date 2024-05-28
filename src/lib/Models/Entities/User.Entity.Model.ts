import type { RoleWithPolicies } from "./Role.Entity.Model";

export class User {
    id: string = null!;
    name?: string;
    email: string = null!;
    image?: string;
    user_id: string = null!;
    created_at: string = null!;
}


export class UserWithRole extends User {
    roles: RoleWithPolicies[] = [];
}