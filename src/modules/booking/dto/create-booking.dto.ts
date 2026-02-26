import { CreateAssignmentRoomDto } from "@/modules/inscription/dto/create-assignment-room.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNumber, IsString, ValidateNested } from "class-validator";

export class CreateBookingDto {

  @IsNumber()
  @ApiProperty({
    example: 2,
    description: 'Dias de reserva',
  })
  days: number;

  @IsString()
  @ApiProperty({
    example: '12345678',
    description: 'DNI del cliente',
  })
  dni: string;

  @IsString()
  @ApiProperty({
    example: 'Juan Perez',
    description: 'Nombre del cliente',
  })
  name: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    type: [String],
    example: ['70123456', '78912345'],
    description: 'Teléfonos del cliente',
  })
  phone: string[];

  @IsNumber()
  @ApiProperty({
    example: 100,
    description: 'Precio de la reserva',
  })
  amount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssignmentRoomDto)
  @ApiProperty({
    type: [CreateAssignmentRoomDto],
    description: 'Lista de asignaciones',
  })
  assignmentRooms: CreateAssignmentRoomDto[];
}
