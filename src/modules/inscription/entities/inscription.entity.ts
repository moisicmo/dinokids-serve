import { BookingEntity } from "@/modules/booking/entities/booking.entity";
import { StudentEntity } from "@/modules/student/entities/student.entity";
import { AssignmentRoomEntity } from "./assignment-room.entity";
import { PriceEntity } from "./price.entity";

export const InscriptionEntity = {
  id: true,
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