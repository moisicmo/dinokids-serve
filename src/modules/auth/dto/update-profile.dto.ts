import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateProfileDto {
  @IsString()
  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
  name: string;

  @IsString()
  @ApiProperty({ example: 'Pérez', description: 'Apellido del usuario' })
  lastName: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty({ example: 'juan@ejemplo.com', description: 'Correo electrónico', required: false })
  email?: string;
}
