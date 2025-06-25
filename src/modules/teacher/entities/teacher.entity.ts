import { BranchEntity } from "@/modules/branch/entities/branch.entity";

export const TeacherEntity = {
  zone: true,
  address: true,
  major: true,
  academicStatus: true,
  startJob: true,
  branches: {
    select: BranchEntity
  }
  
};