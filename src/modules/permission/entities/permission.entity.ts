import { Prisma } from "@prisma/client";

export type PermissionType = Prisma.PermissionGetPayload<{
  select: typeof PermissionSelect;
}>;

export const PermissionSelect = {
  id: true,
  action: true,
  subject: true,
  inverted: true,
  conditions: true,
  reason: true,
  active: true,
};