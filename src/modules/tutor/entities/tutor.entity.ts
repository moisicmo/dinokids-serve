import { UserEntity } from "@/common";

export const TutorEntity = {
  userId: true,
  city: true,
  zone: true,
  address: true,
  students: {
    select: {
      user: {
        select: {
          numberDocument: true,
          typeDocument: true,
          name: true,
          lastName: true,
          email: true,
        }
      },
      code: true,
      birthdate: true,
      gender: true,
      school: true,
      grade: true,
      educationLevel: true,
    }
  },
  user: {
    select: UserEntity,
  }
};