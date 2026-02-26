import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateInscriptionDto } from './create-inscription.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateInscriptionDto extends PartialType(CreateInscriptionDto) {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'http://example',
    description: 'url del link donde esta la inscripción',
  })
  url?: string;
}
