import { PartialType } from '@nestjs/swagger';
import { CreateScheduleDto } from './create-schedule.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
  @IsUUID()
  @IsOptional()
  id: string;
}
