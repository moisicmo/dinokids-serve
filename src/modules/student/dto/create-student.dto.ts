import { CreateUserDto } from "@/common/dto/create-user.dto";
import { ApiProperty } from "@nestjs/swagger";
import { EducationLevel, Gender } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsDate, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateStudentDto extends CreateUserDto {

  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    example: '2000-01-01',
    description: 'Fecha de nacimiento del estudiante',
  })
  birthdate: Date;

  @IsEnum(Gender)
  @ApiProperty({
    example: Gender.MASCULINO,
    description: 'Género del estudiante',
    enum: Gender,
  })
  gender: Gender;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'San Calixto',
    description: 'Identificador de la escuela',
  })
  school: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 5,
    description: 'Grado del estudiante',
  })
  grade: number;

  @IsOptional()
  @IsEnum(EducationLevel)
  @ApiProperty({
    example: EducationLevel.PRIMARIA,
    description: 'Nivel educativo del estudiante',
    enum: EducationLevel,
  })
  educationLevel: EducationLevel;

  @IsArray()
  @ApiProperty({
    example: ['tutor123', 'tutor321'],
    description: 'Lista de Identificadores de tutores',
  })
  tutorIds: string[];

}
