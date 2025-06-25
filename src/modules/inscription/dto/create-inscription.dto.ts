import { ApiProperty } from "@nestjs/swagger";
import { InscriptionType } from "@prisma/client";
import { IsEnum, IsUUID } from "class-validator";

export class CreateInscriptionDto {

  @IsUUID()
  @ApiProperty({
    example: 'student123',
    description: 'Identificador único del estudiante',
  })
  studentId: string;

  @IsUUID()
  @ApiProperty({
    example: 'staff123',
    description: 'Identificador único del personal',
  })
  staffId: string;

  @IsEnum(InscriptionType)
  @ApiProperty({
    example: InscriptionType.Student,
    description: 'Tipo de inscripción',
    enum: InscriptionType,
  })
  type: InscriptionType;
}
