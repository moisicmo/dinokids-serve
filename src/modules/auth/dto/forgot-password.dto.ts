import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class ForgotPasswordDto {
  @IsEmail()
  @ApiProperty({ example: 'juan@ejemplo.com', description: 'Correo del usuario para recuperar contraseña' })
  email: string;
}
