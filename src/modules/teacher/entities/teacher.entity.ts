import { UserEntity } from "@/common";
import { BranchSelect } from "@/modules/branch/entities/branch.entity";
import { Prisma } from "@prisma/client";

export type TeacherType = Prisma.TeacherGetPayload<{
  select: typeof TeacherSelect;
}>;

export const TeacherSelect = {
  userId: true,
  zone: true,
  address: true,
  major: true,
  academicStatus: true,
  startJob: true,
  branches: {
    select: BranchSelect
  },
  user: {
    select: UserEntity,
  }
};