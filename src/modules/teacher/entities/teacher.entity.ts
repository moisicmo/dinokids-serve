import { UserSelect } from "@/common";
import { Prisma } from "@/generated/prisma/client";
import { BranchSelect } from "@/modules/branch/entities/branch.entity";

export type TeacherType = Prisma.TeacherGetPayload<{
  select: typeof TeacherSelect;
}>;

export const TeacherSelect = {
  userId: true,
  major: true,
  academicStatus: true,
  startJob: true,
  branches: {
    select: BranchSelect
  },
  user: {
    select: UserSelect,
  }
};