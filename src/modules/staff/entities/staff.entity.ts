import { UserSelect } from "@/common";
import { BranchSelect } from "@/modules/branch/entities/branch.entity";
import { Prisma } from "@/generated/prisma/client";

export type StaffType = Prisma.StaffGetPayload<{
  select: typeof StaffSelect;
}>;


export const StaffSelect = {
  userId: true,
  superStaff: true,
  branches: {
    select: BranchSelect
  },
  user: {
    select: UserSelect,
  }
};