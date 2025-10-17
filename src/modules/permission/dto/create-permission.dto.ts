import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ConditionOperator, TypeAction, TypeSubject } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";

export class CreateConditionDto {
  @IsOptional()
  id?: string;

  @IsOptional()
  permissionId?: string;

  @ApiPropertyOptional({
    description: 'Campo a comparar (por ejemplo "branchId" o "hour")',
    example: 'hour',
  })
  @IsString()
  field: string;

  @ApiPropertyOptional({
    description: 'Operador de comparación',
    example: 'between',
    enum: ConditionOperator,
  })
  @IsEnum(ConditionOperator)
  operator: ConditionOperator;

  @ApiPropertyOptional({
    description: 'Valor esperado (string, número o JSON string)',
    example: '[8,20]',
  })
  @IsString()
  value: string;
  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;

  @IsOptional()
  createdById?: string;
}
export class CreatePermissionDto {

  @IsEnum(TypeAction)
  @ApiProperty({
    enum: TypeAction,
    description: 'Acción que representa el permiso',
    example: TypeAction.create,
  })
  action: TypeAction;

  @IsEnum(TypeSubject)
  @ApiProperty({
    enum: TypeSubject,
    description: 'Entidad o recurso al que aplica el permiso',
    example: TypeSubject.room,
  })
  subject: TypeSubject;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Razón por la cual se asigna este permiso',
    example: 'Acceso restringido por rol de supervisor',
  })
  reason?: string | null;

  @ApiPropertyOptional({
    description: 'Condiciones opcionales del permiso (lista)',
    type: [CreateConditionDto],
    example: [
      { field: 'hour', operator: 'between', value: '[8,20]' },
      { field: 'id', operator: 'in', value: '{{branchIds}}' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateConditionDto)
  conditions?: CreateConditionDto[];
}


