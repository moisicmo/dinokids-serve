import { Paymentselect } from "@/modules/payment/entities/payment.entity";
import { Prisma } from "@/generated/prisma/client";


export type InvoiceType = Prisma.InvoiceGetPayload<{
  select: typeof InvoiceSelect
}>;

export const InvoiceSelect = {
  id: true,
  code: true,
  buyerNit: true,
  buyerName: true,
  createdAt: true,
  createdBy: true,
  payments: {
    select: Paymentselect
  }
};

