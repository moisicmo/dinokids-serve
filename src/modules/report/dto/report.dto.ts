import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@/common';

export class ReportDto extends PaginationDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
