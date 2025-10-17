import { IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateConditionDto, CreatePermissionDto } from "./create-permission.dto";
import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { TypeAction, TypeSubject } from "@prisma/client";
import { Type } from "class-transformer";


// export class UpdatePermissionDto extends CreatePermissionDto {
//   @IsOptional()
//   @IsString()
//   @ApiPropertyOptional({
//     description: 'Identificador del permiso',
//     example: 'perm-1',
//   })
//   id?: string;
// }
export class UpdateConditionDto extends PartialType(CreateConditionDto) {}

export class UpdatePermissionDto {
  @ApiPropertyOptional({ description: 'Acción permitida', enum: TypeAction })
  @IsOptional()
  @IsEnum(TypeAction)
  action?: TypeAction;

  @ApiPropertyOptional({ description: 'Recurso o módulo afectado', enum: TypeSubject })
  @IsOptional()
  @IsEnum(TypeSubject)
  subject?: TypeSubject;

  @ApiPropertyOptional({ description: 'Motivo del permiso' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Condiciones asociadas al permiso',
    type: [UpdateConditionDto],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateConditionDto)
  conditions?: UpdateConditionDto[];
}