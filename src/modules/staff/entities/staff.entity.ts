import { BranchEntity } from "@/modules/branch/entities/branch.entity";
import { RoleEntity } from "@/modules/role/entities/role.entity";

export const StaffEntity = {
  role: {
    select: RoleEntity,
  },
  branches: {
    select: BranchEntity
  }
};