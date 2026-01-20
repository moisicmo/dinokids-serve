import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateAddressDto {

  @IsString()
  @ApiProperty({
    example: 'Ciudad123 ',
    description: 'Identificación de la ciudad',
  })
  city: string;

  @IsString()
  @ApiProperty({
    example: 'Zona Norte',
    description: 'Zona',
  })
  zone: string;

  @IsString()
  @ApiProperty({
    example: 'Calle Falsa 123',
    description: 'Dirección',
  })
  detail: string;

}
