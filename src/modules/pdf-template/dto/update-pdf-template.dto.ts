import { PartialType } from '@nestjs/mapped-types';
import { CreatePdfTemplateDto } from './create-pdf-template.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePdfTemplateDto extends PartialType(CreatePdfTemplateDto) {
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
