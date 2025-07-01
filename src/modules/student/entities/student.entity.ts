import { UserEntity } from "@/common";
import { TutorEntity } from "@/modules/tutor/entities/tutor.entity";
import { Prisma } from "@prisma/client";

export type StudentSelectType = Prisma.StudentGetPayload<{
  select: typeof StudentSelect;
}>;

export const StudentSelect = {
  userId: true,
  code: true,
  birthdate: true,
  gender: true,
  school: true,
  grade: true,
  educationLevel: true,
  tutors: {
    select: {
      ...TutorEntity,
      students: false,
    },
  },
  user: {
    select: UserEntity,
  },
};