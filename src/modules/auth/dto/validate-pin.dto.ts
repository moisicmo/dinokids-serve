import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ValidatePinDto {

  
  @IsString()
  @ApiProperty({
    example: '123456',
    description: 'Id del usuario',
  })
  idUser: string;

  @IsString()
  @ApiProperty({
    example: '123456',
    description: 'Pin de validación',
  })
  pin: string;

  @IsString()
  @ApiProperty({
    example: 'Muyseguro123*',
    description: 'Nueva contraseña',
  })
  newPassword: string;
}
