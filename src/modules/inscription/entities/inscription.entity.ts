import { BookingEntity } from "@/modules/booking/entities/booking.entity";
import { StudentSelect } from "@/modules/student/entities/student.entity";
import { AssignmentRoomEntity } from "./assignment-room.entity";
import { PriceEntity } from "./price.entity";
import { Prisma } from "@/generated/prisma/client";


export type InscriptionExtended = InscriptionType & {
  inscriptionPrice: number;
  monthPrice: number;
};

export const InscriptionSelect = {
  id: true,
  url: true,
  student: {
    select: StudentSelect,
  },
  booking: {
    select: BookingEntity,
  },
  prices: {
    select: PriceEntity,
  },
  assignmentRooms: {
    select: AssignmentRoomEntity
  },
  createdAt: true,
};

export type InscriptionType = Prisma.InscriptionGetPayload<{
  select: typeof InscriptionSelect
}>;

