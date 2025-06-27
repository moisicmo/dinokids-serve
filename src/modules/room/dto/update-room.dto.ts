import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";
import { BaseRoomDto } from "./base-room.dto";
import { UpdateScheduleDto } from "@/modules/schedule/dto/update-schedule.dto";

export class UpdateRoomDto extends PartialType(BaseRoomDto) {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateScheduleDto)
  @ApiProperty({ type: [UpdateScheduleDto], description: 'Horarios' })
  schedules: UpdateScheduleDto[];
}