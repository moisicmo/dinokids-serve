import { PartialType } from '@nestjs/swagger';
import { CreateScheduleDto } from './create-schedule.dto';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
  @IsString()
  @IsOptional()
  id: string;

  @IsBoolean()
  @IsOptional()
  active: boolean;
}
