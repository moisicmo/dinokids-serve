import { RoomSelect } from "@/modules/room/entities/room.entity";
import { AssignmentSchedulesEntity } from "./assignment-schedule.entity";

export const AssignmentRoomEntity = {
  id: true,
  room: {
    select: {
      ...RoomSelect,
      assignmentRooms: false,
    },
  },
  start: true,
  assignmentSchedules: {
    select: AssignmentSchedulesEntity
  }
}