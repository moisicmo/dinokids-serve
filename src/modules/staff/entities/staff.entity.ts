import { UserEntity } from "@/common";
import { BranchEntity } from "@/modules/branch/entities/branch.entity";
import { RoleEntity } from "@/modules/role/entities/role.entity";

export const StaffEntity = {
  userId: true,
  role: {
    select: RoleEntity,
  },
  branches: {
    select: BranchEntity
  },
  user: {
    select: UserEntity,
  }
};