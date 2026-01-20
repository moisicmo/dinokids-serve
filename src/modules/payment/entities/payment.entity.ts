import { DebtSelect } from "@/modules/debt/entities/debt.entity";
import { Prisma } from "@/generated/prisma/client";

export type PaymentType = Prisma.PaymentGetPayload<{
  select: typeof Paymentselect
}>;

export const Paymentselect = {
  id: true,
  debt: {
    select: DebtSelect,
  },
  reference: true,
  amount: true,
  payMethod: true,
  createdAt: true,
};
