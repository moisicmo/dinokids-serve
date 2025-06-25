import { PermissionEntity} from '@/modules/permission/entities/permission.entity';

export const RoleEntity = {
  id: true,
  name: true,
  permissions: {
    select: PermissionEntity
  }
};