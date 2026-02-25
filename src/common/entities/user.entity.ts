import { AddressSelect } from "./address.select";
import { RoleSelect } from "@/modules/role/entities/role.entity";

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