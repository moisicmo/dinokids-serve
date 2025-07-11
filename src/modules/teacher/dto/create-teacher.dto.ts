import { CreateUserDto } from "@/common/dto/create-user.dto";
import { ApiProperty } from "@nestjs/swagger";
import { AcademicStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsDate, IsEnum, IsString } from "class-validator";
import { IntersectionType } from '@nestjs/mapped-types';
import { CreateAddressDto } from "@/common/dto/create-address.dto";

export class CreateTeacherDto extends IntersectionType(CreateUserDto, CreateAddressDto) {

  @IsString()
  @ApiProperty({
    example: 'Psicología',
    description: 'Especialidad del docente',
  })
  major: string;

  @IsEnum(AcademicStatus)
  @ApiProperty({
    example: AcademicStatus.EGRESADO,
    description: 'Grado académico del docente',
    enum: AcademicStatus,
  })
  academicStatus: AcademicStatus;

  @IsDate()
  @Type(()=> Date)
  @ApiProperty({
    example: '2020-01-01',
    description: 'Fecha de inicio del trabajo del docente',
  })
  startJob: Date;

  @IsArray()
  @ApiProperty({
    example: ['suc123', 'suc321'],
    description: 'Lista de Identificadores de sucursales',
  })
  brancheIds: string[];
}
