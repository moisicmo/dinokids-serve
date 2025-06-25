import { UserEntity } from "@/common";
import { BranchEntity } from "@/modules/branch/entities/branch.entity";
import { SpecialtyEntity } from "@/modules/specialty/entities/specialty.entity";
import { TeacherEntity } from "@/modules/teacher/entities/teacher.entity";

export const RoomEntity = {
  id: true,
  name: true,
  capacity: true,
  rangeYears: true,
  branch: {
    select: BranchEntity,
  },
  specialty:{
    select: {
      ...SpecialtyEntity,
      name:true,
    }
  },
  teacher:{
    select: {
      ...TeacherEntity,
      user:{
        select: UserEntity,
      }
    }
  }
};