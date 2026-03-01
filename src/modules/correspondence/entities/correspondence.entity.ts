import { Prisma } from "@/generated/prisma/client";

export type DocumentTransmissionType = Prisma.DocumentTransmissionGetPayload<{
  select: typeof DocumentTransmissionSelect;
}>;
export const DocumentSelect = {
  id: true,
  type: true,
  data: true,
  childInfo: true,
  studentUserId: true,
};


export const DocumentTransmissionSelect = {
  id: true,
  senderId: true,
  receiverId: true,
  status: true,
  document: { select: DocumentSelect }
};

export const SentTransmissionSelect = {
  id: true,
  receiverId: true,
  status: true,
  createdAt: true,
  document: { select: { type: true } },
};

export type SentTransmissionType = Prisma.DocumentTransmissionGetPayload<{
  select: typeof SentTransmissionSelect;
}>;

