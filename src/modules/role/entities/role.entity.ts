import { PermissionSelect} from '@/modules/permission/entities/permission.entity';
import { Prisma } from '@/generated/prisma/client';


export type RoleType = Prisma.RoleGetPayload<{
  select: typeof RoleSelect;
}>;
export const RoleSelect = {
  id: true,
  name: true,
  permissions: {
    select: PermissionSelect
  }
};