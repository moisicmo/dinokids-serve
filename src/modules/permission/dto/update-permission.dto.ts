import { IsOptional, IsString } from "class-validator";
import { CreatePermissionDto } from "./create-permission.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";


export class UpdatePermissionDto extends CreatePermissionDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Identificador del permiso',
    example: 'perm-1',
  })
  id?: string;
}
