import { Prisma } from "@/generated/prisma/client";

export type PermissionType = Prisma.PermissionGetPayload<{
  select: typeof PermissionSelect;
}>;

export const PermissionSelect = {
  id: true,
  action: true,
  subject: true,
  active: true,
};