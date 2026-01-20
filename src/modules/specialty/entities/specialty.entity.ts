import { BranchSelect } from "@/modules/branch/entities/branch.entity";
import { Prisma } from "@/generated/prisma/client";

export type SpecialtyType = Prisma.SpecialtyGetPayload<{
  select: typeof SpecialtySelect;
}>;


export const SpecialtySelect = {
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
        select: BranchSelect
      }
    }
  }
};

