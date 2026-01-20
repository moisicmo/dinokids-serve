import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNumber, IsString, IsUUID, ValidateNested } from "class-validator";
import { CreateAssignmentRoomDto } from "./create-assignment-room.dto";

export class CreateInscriptionDto {

  @IsString()
  @ApiProperty({
    example: 'student123',
    description: 'Identificador único del estudiante',
  })
  studentId: string;

  @IsNumber()
  @ApiProperty({
    example: 100.0,
    description: 'Precio de inscripción',
  })
  inscriptionPrice: number;

  @IsNumber()
  @ApiProperty({
    example: 100.0,
    description: 'Precio de inscripción',
  })
  monthPrice: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssignmentRoomDto)
  @ApiProperty({
    type: [CreateAssignmentRoomDto],
    description: 'Lista de asignaciones',
  })
  assignmentRooms: CreateAssignmentRoomDto[];

}
