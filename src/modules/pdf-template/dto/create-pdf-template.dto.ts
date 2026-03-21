import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePdfTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  htmlContent: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
