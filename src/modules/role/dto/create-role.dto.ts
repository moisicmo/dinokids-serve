import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";

export class CreateRoleDto {
  @IsString()
  @ApiProperty({
    example: 'admin',
    description: 'Nombre del rol',
  })
  name: string;

  @IsArray()
  @ApiProperty({
    example: ['perm123', 'perm321'],
    description: 'Lista de Identificadores de permisos',
  })
  permissionIds: string[];

}
