export class CreateRoleActionRequest {
  id?: string;
  role_id: string = null!;
  action_id: string = null!;
}

export class RoleActionRequest {
  role_id: string = null!;
  action_id: string = null!;
}
