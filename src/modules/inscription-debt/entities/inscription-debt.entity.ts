import { InscriptionSelect } from "@/modules/inscription/entities/inscription.entity";

export const InscriptionDebtSelect = {
  id: true,
  inscription: {
    select:InscriptionSelect
  },
  totalAmount: true,
  remainingBalance: true,
  type: true,
  dueDate: true,
  payments: true,
};