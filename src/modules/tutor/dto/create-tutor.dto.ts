import { CreateAddressDto } from "@/common/dto/create-address.dto";
import { CreateUserDto } from "@/common/dto/create-user.dto";
import { IntersectionType } from '@nestjs/mapped-types';

export class CreateTutorDto extends IntersectionType(CreateUserDto, CreateAddressDto) {}
