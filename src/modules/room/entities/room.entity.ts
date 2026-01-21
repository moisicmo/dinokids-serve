import { UserSelect } from "@/common";
import { BookingEntity } from "@/modules/booking/entities/booking.entity";
import { BranchSelect } from "@/modules/branch/entities/branch.entity";
import { AssignmentSchedulesEntity } from "@/modules/inscription/entities/assignment-schedule.entity";
import { PriceEntity } from "@/modules/inscription/entities/price.entity";
import { ScheduleEntity } from "@/modules/schedule/entities/schedule.entity";
import { StudentSelect } from "@/modules/student/entities/student.entity";
import { TeacherSelect } from "@/modules/teacher/entities/teacher.entity";
import { Prisma } from "@/generated/prisma/client";
import { SpecialtySelect } from "@/modules/specialty/entities/specialty.entity";

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
        select: UserSelect,
      }
    }
  },
  assistant: {
    select: {
      ...TeacherSelect,
      user: {
        select: UserSelect,
      }
    }
  },
  schedules: {
    select: ScheduleEntity,
  },
  assignmentRooms: {
    select: {
      id: true,
      start: true,
      inscription: {
        select: {
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
            assignmentRooms: false,
            createdAt: true,
        }
      },
      assignmentSchedules: {
        select: AssignmentSchedulesEntity
      }
    }
  }
};