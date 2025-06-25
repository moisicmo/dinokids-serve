import { ApiProperty } from "@nestjs/swagger";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsNumber, IsString, IsUUID } from "class-validator";

export class CreateRoomDto {

  @IsUUID()
  @ApiProperty({
    example: 'branch123',
    description: 'Identificador único de la sucursal',
  })
  branchId: string;

  @IsUUID()
  @ApiProperty({
    example: 'teacher123',
    description: 'Identificador único del profesor',
  })
  teacherId: string;

  @IsUUID()
  @ApiProperty({
    example: 'specialty123',
    description: 'Identificador único de la especialidad',
  })
  specialtyId: string;

  @IsString()
  @ApiProperty({
    example: 'Sala de Clases 101',
    description: 'Nombre de la sala de clases',
  })
  name: string;

  @IsNumber()
  @ApiProperty({
    example: 30,
    description: 'Capacidad máxima de la sala de clases',
  })
  capacity: number;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @ApiProperty({
    example: [10, 15],
    description: 'Rango de años disponibles para la sala de clases',
    type: [Number],
  })
  rangeYears: number[];

}
