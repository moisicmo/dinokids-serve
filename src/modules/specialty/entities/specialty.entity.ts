import { BranchSelect } from "@/modules/branch/entities/branch.entity";
import { Prisma } from "@/generated/prisma/client";

export type BranchSpecialtyType = Prisma.BranchSpecialtyGetPayload<{
  select: typeof BranchSpecialtySelect;
}>;

export const  SpecialtySelect = {
  id: true,
  name: true,
};

export const BranchSpecialtySelect = {
  id: true,
  numberSessions: true,
  estimatedSessionCost: true,
  specialty: {
    select: SpecialtySelect,
  },
  branch: {
    select: BranchSelect
  }
};


