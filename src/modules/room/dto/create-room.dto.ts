import { CreateScheduleDto } from "@/modules/schedule/dto/create-schedule.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { BaseRoomDto } from "./base-room.dto";
import { IsArray, ValidateNested } from "class-validator";

export class CreateRoomDto extends BaseRoomDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateScheduleDto)
  @ApiProperty({ type: [CreateScheduleDto], description: 'Horarios' })
  schedules: CreateScheduleDto[];
}