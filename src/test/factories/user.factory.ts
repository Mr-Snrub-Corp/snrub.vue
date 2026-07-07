import { USER_ROLES, USER_STATUS } from "@/constants/enums";
import type { User } from "@/types/user";

let seq = 0;

/** Build a User with sensible defaults; override any field per test. */
export function makeUser(overrides: Partial<User> = {}): User {
  seq += 1;
  return {
    uid: `user-${seq}`,
    email: `user${seq}@snrub.test`,
    name: `User ${seq}`,
    role: USER_ROLES.VIEWER,
    status: USER_STATUS.ACTIVE,
    ...overrides,
  };
}
