export class UserDto {
  id: string = null!;
  name?: string;
  email: string = null!;
  image?: string;
  user_id: string = null!;
  roles?:Array<{name?:string,policies:Array<{id?:string,name?:string}>}> = [];
}
