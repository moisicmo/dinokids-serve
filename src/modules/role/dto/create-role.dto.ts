import { CreatePermissionDto } from "@/modules/permission/dto/create-permission.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsString, ValidateNested } from "class-validator";

export class CreateRoleDto {
  @IsString()
  @ApiProperty({
    example: 'admin',
    description: 'Nombre del rol',
  })
  name: string;


  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionDto)
  @ApiProperty({
    type: [CreatePermissionDto],
    description: 'Lista de permisos a ingresar',
  })
  permissions: CreatePermissionDto[];

}
