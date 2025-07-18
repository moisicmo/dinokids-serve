import { AddressSelect } from "./address.select";

export const UserEntity = {
  id: true,
  numberDocument: true,
  typeDocument: true,
  name: true,
  lastName: true,
  email: true,
  phone: true,
  address: {
    select: AddressSelect,
  },
};