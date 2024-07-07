import type { UserDto } from "$lib/Models/DTOS/User.DTO.Model";

export function checkUserPolicies(permissions: number[], user: UserDto | null) {
  // Check if $authStore and roles are defined
  if (user?.roles) {
    console.log("permissions", permissions);
    // console.log("policy", policy);
    for (const role of user.roles) {
      for (const policy of role.policies) {
        if (permissions.includes(Number(policy.id))) {
          return true;
        }
      }
    }
  }
  return false;
}
