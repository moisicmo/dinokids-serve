import { TutorSelect } from "@/modules/tutor/entities/tutor.entity";
import { Prisma } from "@prisma/client";

export type StudentType = Prisma.StudentGetPayload<{
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
      ...TutorSelect,
      students: false,
    },
  },
  user: {
    select: {
      id: true,
      numberDocument: true,
      typeDocument: true,
      name: true,
      lastName: true,
      email: true,
      numberCard: true,
    },
  },
};