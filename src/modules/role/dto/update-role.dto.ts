import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdatePermissionDto } from '@/modules/permission/dto/update-permission.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePermissionDto)
  @ApiPropertyOptional({
    type: [UpdatePermissionDto],
    description: 'Permisos del rol a actualizar',
  })
  permissions?: UpdatePermissionDto[];
}
