import { UserEntity } from "@/common";
import { BranchSelect } from "@/modules/branch/entities/branch.entity";
import { RoleSelect } from "@/modules/role/entities/role.entity";
import { Prisma } from "@prisma/client";

export type StaffType = Prisma.StaffGetPayload<{
  select: typeof StaffSelect;
}>;


export const StaffSelect = {
  userId: true,
  role: {
    select: RoleSelect,
  },
  branches: {
    select: BranchSelect
  },
  user: {
    select: UserEntity,
  }
};