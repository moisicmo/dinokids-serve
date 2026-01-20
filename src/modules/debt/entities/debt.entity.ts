import { InscriptionSelect } from "@/modules/inscription/entities/inscription.entity";
import { Prisma } from "@/generated/prisma/client";

export type DebtType = Prisma.DebtsGetPayload<{
  select: typeof DebtSelect
}>;

export const DebtSelect = {
  id: true,
  inscription: {
    select: InscriptionSelect
  },
  totalAmount: true,
  remainingBalance: true,
  type: true,
  dueDate: true,
  payments: true,
  createdAt: true,
};


