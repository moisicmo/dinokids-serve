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
  status: true,
  createdAt: true,
  receiver: { select: { name: true, lastName: true, role: { select: { name: true } } } },
  document: { select: { type: true, childInfo: true, studentUserId: true } },
};

export type SentTransmissionType = Prisma.DocumentTransmissionGetPayload<{
  select: typeof SentTransmissionSelect;
}>;

export const AdminSentTransmissionSelect = {
  id: true,
  status: true,
  createdAt: true,
  sender: { select: { name: true, lastName: true, role: { select: { name: true } } } },
  receiver: { select: { name: true, lastName: true, role: { select: { name: true } } } },
  document: { select: { type: true, childInfo: true, studentUserId: true } },
};

export type AdminSentTransmissionType = Prisma.DocumentTransmissionGetPayload<{
  select: typeof AdminSentTransmissionSelect;
}>;

