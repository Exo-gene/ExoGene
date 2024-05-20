import { ImageType } from "../Common/Image.Common.Model";

export class CreateUserRequest {
  id?: string;
  name: string | null = null;
  email: string = null!;
  image: ImageType = new ImageType();
  user_id: string = null!;
}

export class UserRequest {
  name: string | null = null;
  email: string = null!;
  image: ImageType = new ImageType();
  user_id: string = null!;
}
