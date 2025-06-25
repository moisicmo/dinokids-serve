import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TypeAction, TypeSubject } from "@prisma/client";
import { IsBoolean, IsEnum, IsObject, IsOptional, IsString } from "class-validator";

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
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Indica si es un permiso invertido (prohibido)',
    default: false,
  })
  inverted?: boolean;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({
    description: 'Condiciones opcionales como sucursalId, empresaId, etc.',
    example: { sucursalId: '123' },
  })
  conditions?: Record<string, any>;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Razón por la cual se asigna este permiso',
    example: 'Acceso restringido por rol de supervisor',
  })
  reason?: string | null;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Define si el permiso está activo o no',
    default: true,
  })
  active?: boolean;
}
