import { AddressSelect } from "@/common/entities/address.select";
import { Prisma } from "@prisma/client";

export type BranchType = Prisma.BranchGetPayload<{
  select: typeof BranchSelect;
}>;

export const BranchSelect = {
  id: true,
  name: true,
  phone: true,
  address: {
    select: AddressSelect,
  }
};

