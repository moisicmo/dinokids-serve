import { UserEntity } from "@/common";
import { BranchSelect } from "@/modules/branch/entities/branch.entity";
import { ScheduleEntity } from "@/modules/schedule/entities/schedule.entity";
import { SpecialtySelect } from "@/modules/specialty/entities/specialty.entity";
import { TeacherSelect } from "@/modules/teacher/entities/teacher.entity";
import { Prisma } from "@prisma/client";

export type RoomType = Prisma.RoomGetPayload<{
  select: typeof RoomSelect;
}>;


export const RoomSelect = {
  id: true,
  name: true,
  rangeYears: true,
  branch: {
    select: BranchSelect,
  },
  specialty: {
    select: {
      ...SpecialtySelect,
      name: true,
    }
  },
  teacher: {
    select: {
      ...TeacherSelect,
      user: {
        select: UserEntity,
      }
    }
  },
  assistant: {
    select: {
      ...TeacherSelect,
      user: {
        select: UserEntity,
      }
    }
  },
  schedules: {
    select: ScheduleEntity,
  },
  assignmentRooms: true
};