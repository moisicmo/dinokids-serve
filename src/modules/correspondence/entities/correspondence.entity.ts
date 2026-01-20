import { Prisma } from "@/generated/prisma/client";

export type DocumentTransmissionType = Prisma.DocumentTransmissionGetPayload<{
  select: typeof DocumentTransmissionSelect;
}>;
export const DocumentSelect = {
  id: true,
  type: true,
  data: true,
};


export const DocumentTransmissionSelect = {
  id: true,
  senderId: true,
  receiverId: true,
  status: true,
  document: { select: DocumentSelect }
};

