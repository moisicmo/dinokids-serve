import { AddressSelect } from "./address.select";

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
};