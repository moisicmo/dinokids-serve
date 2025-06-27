import { ApiProperty } from "@nestjs/swagger";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsNumber, IsString, IsUUID } from "class-validator";


export class BaseRoomDto {
  @IsUUID()
  @ApiProperty({ example: 'branch123', description: 'ID de la sucursal' })
  branchId: string;

  @IsUUID()
  @ApiProperty({ example: 'teacher123', description: 'ID del profesor' })
  teacherId: string;

  @IsUUID()
  @ApiProperty({ example: 'specialty123', description: 'ID de la especialidad' })
  specialtyId: string;

  @IsString()
  @ApiProperty({ example: 'Sala 101', description: 'Nombre de la sala' })
  name: string;

  @IsNumber()
  @ApiProperty({ example: 30, description: 'Capacidad máxima' })
  capacity: number;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @ApiProperty({ example: [10, 15], description: 'Rango de años' })
  rangeYears: number[];
}
