import { ImageType } from "../Common/Image.Common.Model";

export class CreateUserRequest {
  id?: string;
  userName: string | null = null;
  email: string = null!;
  phoneNumber: string = null!;
   user_id: string = null!;
  lab?: number;
  address?: string;
}

export class UserRequest {
  userName: string | null = null;
  email: string = null!;
  phoneNumber: string = null!;
  user_id: string = null!;
  lab?: number;
  address?: string;
}
