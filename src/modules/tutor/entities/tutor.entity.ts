import { UserEntity } from "@/common";
import { AddressSelect } from "@/common/entities/address.select";
import { Prisma } from "@prisma/client";

export const TutorSelect = {
  userId: true,
  students: {
    select: {
      user: {
        select: {
          numberDocument: true,
          typeDocument: true,
          name: true,
          lastName: true,
          email: true,
          address: {
            select: AddressSelect,
          },
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


export type TutorType = Prisma.TutorGetPayload<{
  select: typeof TutorSelect
}>;
