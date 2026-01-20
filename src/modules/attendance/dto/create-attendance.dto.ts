import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID } from "class-validator";

export class CreateAttendanceDto {

  @IsString()
  @ApiProperty({
    example: 'branch123',
    description: 'Identificador único de la sucursal',
  })
  branchId: string;

  @IsString()
  @ApiProperty({
    example: '1234567890',
    description: 'Número de la tarjeta RFID',
  })
  numberCard: string;

}
