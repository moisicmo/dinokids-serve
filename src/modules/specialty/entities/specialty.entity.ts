import { BranchEntity } from "@/modules/branch/entities/branch.entity";

export const SpecialtyEntity = {
  id: true,
  branchSpecialties: {
    select: {
      numberSessions: true,
      estimatedSessionCost: true,
      specialty: {
        select: {
          id: true,
          name: true,
        }
      },
      branch: {
        select: BranchEntity
      }
    }
  }
};

