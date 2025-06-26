import { UserEntity } from "@/common";
import { TutorEntity } from "@/modules/tutor/entities/tutor.entity";

export const StudentEntity = {
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
  }
};