import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID } from "class-validator";

export class CreateAddressDto {

  @IsUUID()
  @ApiProperty({
    example: 'Ciudad123 ',
    description: 'Identificación de la ciudad',
  })
  cityId: string;

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
