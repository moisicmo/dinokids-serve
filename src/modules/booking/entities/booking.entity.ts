import { Prisma } from "@/generated/prisma/client";

export type BookingType = Prisma.BookingGetPayload<{
  select: typeof BookingEntity;
}>;

export const BookingEntity = {
  id: true,
  days: true,
  dni: true,
  name: true,
  phone: true,
  amount: true,
};