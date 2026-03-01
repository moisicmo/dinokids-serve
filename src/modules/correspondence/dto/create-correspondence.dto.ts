import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateCorrespondenceDto {
  @IsString()
  @ApiProperty({
    example: 'evaluation-001',
    description: 'Nombre de la evaluación',
  })
  type: string;

  @IsArray()
  @ApiProperty({
    description: 'JSON completo de la evaluación',
    type: 'array',
    example: [],
  })
  data: any[];

  @IsOptional()
  @IsArray()
  @ApiProperty({
    description: 'Datos personales del niño (Datos Personales)',
    type: 'array',
    example: [],
    required: false,
  })
  childInfo?: any[];

  @IsString()
  @ApiProperty({
    example: 'user-123',
    description: 'Identificador del remitente',
  })
  receiverId: string;
}
