import type { UserDto } from "../DTOS/User.DTO.Model";
import type { User } from "../Entities/User.Entity.Model";

export class Dto {
  static ToUserDto(entity: User): UserDto {
    try {
      return {
        id: entity.id,
        name: entity.name,
        email: entity.email,
        image: entity.image,
      };
    } catch (error) {
      throw error;
    }
  }
}
