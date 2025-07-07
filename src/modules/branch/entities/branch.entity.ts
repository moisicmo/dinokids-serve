import { Prisma } from "@prisma/client";

export type BranchType = Prisma.BranchGetPayload<{
  select: typeof BranchSelect;
}>;

export const BranchSelect = {
  id: true,
  name: true,
  address: true,
  phone: true,
};