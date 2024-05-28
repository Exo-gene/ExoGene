export class CreateUser_RoleRequest {
  id?: string;
  role_id: string = null!;
  user_id: string = null!;
}

export class User_RoleRequest {
  role_id: string = null!;
  user_id: string = null!;
}

export class UpdateUser_RoleRequest {
  role_ids: string[] = [];
  user_id: string = null!;
}
