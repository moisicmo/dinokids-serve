import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

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

  @IsNumber()
  @ApiProperty({
    example: 100,
    description: 'Precio de la reserva',
  })
  price: number;

}
