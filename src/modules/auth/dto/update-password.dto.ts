import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class UpdatePasswordDto {
  @IsString()
  @ApiProperty({ example: 'Actual123*', description: 'Contraseña actual' })
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @ApiProperty({ example: 'Nueva123*', description: 'Nueva contraseña (mínimo 8 caracteres)' })
  newPassword: string;
}
