import { UserEntity } from "@/common";
import { BranchEntity } from "@/modules/branch/entities/branch.entity";

export const TeacherEntity = {
  userId: true,
  zone: true,
  address: true,
  major: true,
  academicStatus: true,
  startJob: true,
  branches: {
    select: BranchEntity
  },
  user: {
    select: UserEntity,
  }
};