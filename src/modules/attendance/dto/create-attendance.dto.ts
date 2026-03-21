import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateAttendanceDto {

  @IsString()
  @ApiProperty({
    example: 'branch123',
    description: 'Identificador único de la sucursal',
  })
  branchId: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: '1234567890',
    description: 'Número de la tarjeta RFID',
  })
  numberCard?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'uuid-del-usuario',
    description: 'ID del usuario cuando se confirma desde el listado de búsqueda',
  })
  userId?: string;

}
