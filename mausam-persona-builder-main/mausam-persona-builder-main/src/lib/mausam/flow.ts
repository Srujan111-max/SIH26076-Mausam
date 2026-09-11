import { ROLES } from "./data";
import type { RoleId } from "./types";

/** Roles that have their own preference screen, in onboarding card order. */
export function prefRoleQueue(selected: RoleId[]): RoleId[] {
  return ROLES.filter((r) => r.hasPreferences && selected.includes(r.id)).map((r) => r.id);
}
