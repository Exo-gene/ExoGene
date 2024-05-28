export class CreateRoleActionRequest {
  id?: string;
  role_id: string = null!;
  policies_action: string = null!;
}

export class RoleActionRequest {
  role_id: string = null!;
  policies_action: string = null!;
}

export class CreateRoleActionsFunctionRequest {
  role_id: string = null!;
  policies_ids: string[] = [];
}
