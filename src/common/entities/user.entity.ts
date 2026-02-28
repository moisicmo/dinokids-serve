import { AddressSelect } from "./address.select";
import { RoleSelect } from "@/modules/role/entities/role.entity";
import { Prisma } from "@/generated/prisma/client";

export type UserType = Prisma.UserGetPayload<{
  select: typeof UserSelect;
}>;

export type UserShortType = Prisma.UserGetPayload<{
  select: typeof UserShortSelect;
}>;

export const UserSelect = {
  id: true,
  numberDocument: true,
  typeDocument: true,
  name: true,
  lastName: true,
  email: true,
  phone: true,
  numberCard: true,
  address: {
    select: AddressSelect,
  },
  role: {
    select: RoleSelect,
  },
};

export const UserShortSelect = {
  id: true,
  name: true,
  lastName: true,
  role: {
    select: RoleSelect,
  },
};