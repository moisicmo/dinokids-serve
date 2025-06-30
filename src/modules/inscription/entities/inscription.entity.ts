import { BookingEntity } from "@/modules/booking/entities/booking.entity";
import { StudentEntity } from "@/modules/student/entities/student.entity";
import { AssignmentRoomEntity } from "./assignment-room.entity";
import { PriceEntity } from "./price.entity";
import { Prisma } from "@prisma/client";


export type InscriptionExtended = InscriptionSelectType & {
  inscriptionPrice: number;
  monthPrice: number;
};

export type InscriptionSelectType = Prisma.InscriptionGetPayload<{
  select: typeof InscriptionSelect;
}>;


export const InscriptionSelect = {
  id: true,
  url: true,
  student: {
    select: StudentEntity,
  },
  booking: {
    select: BookingEntity,
  },
  prices: {
    select: PriceEntity,
  },
  assignmentRooms: {
    select: AssignmentRoomEntity
  }
};