import { Paymentselect } from "@/modules/payment/entities/payment.entity";
import { StaffSelect } from "@/modules/staff/entities/staff.entity";
import { Prisma } from "@prisma/client";



export const InvoiceSelect = {
  id: true,
  code: true,
  staff:{
    select: StaffSelect,
  },
  buyerNit: true,
  buyerName: true,
  createdAt: true,
  payments: {
    select: Paymentselect
  }
};

export type InvoiceType = Prisma.InvoiceGetPayload<{
  select: typeof InvoiceSelect
}>;
