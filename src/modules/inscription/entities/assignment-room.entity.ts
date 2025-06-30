import { RoomEntity } from "@/modules/room/entities/room.entity";
import { AssignmentSchedulesEntity } from "./assignment-schedule.entity";

export const AssignmentRoomEntity = {
  id: true,
  room: {
    select: {
      ...RoomEntity,
      assignmentRooms: false,
    },
  },
  start: true,
  assignmentSchedules: {
    select: AssignmentSchedulesEntity
  }
}