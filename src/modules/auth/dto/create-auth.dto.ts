import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class CreateAuthDto {

  @IsString()
  @IsEmail()
  @ApiProperty({
    example: 'moisic.mo@gmail.com',
    description: 'Correo electrónico del usuario',
  })
  email: string;

  @IsString()
  @ApiProperty({
    example: 'Muyseguro123*',
    description: 'Contraseña del usuario',
  })
  password: string;
}
