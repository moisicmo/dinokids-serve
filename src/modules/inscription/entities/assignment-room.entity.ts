import { RoomEntity } from "@/modules/room/entities/room.entity";
import { AssignmentSchedulesEntity } from "./assignment-schedule.entity";

export const AssignmentRoomEntity = {
  id: true,
  room: {
    select: RoomEntity,
  },
  start: true,
  assignmentSchedules: {
    select: AssignmentSchedulesEntity
  }
}