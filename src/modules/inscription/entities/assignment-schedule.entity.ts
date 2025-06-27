import { ScheduleEntity } from "@/modules/schedule/entities/schedule.entity";

export const AssignmentSchedulesEntity = {
  id: true,
  schedule: {
    select: ScheduleEntity,
  },
  day: true,
}
