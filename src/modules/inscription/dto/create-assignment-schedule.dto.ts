import { CreateScheduleDto } from "@/modules/schedule/dto/create-schedule.dto";
import { ApiProperty } from "@nestjs/swagger";
import { DayOfWeek } from "@/generated/prisma/client";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";


class CreateScheduleDtoWithId extends CreateScheduleDto {
  @IsString()
  @ApiProperty({
    example: 'schedule123',
    description: 'Identificador único del horario',
  })
  id: string;

  @IsBoolean()
  @IsOptional()
  active: boolean;
}

export class CreateAssignmentScheduleDto {

  @Type(() => CreateScheduleDtoWithId)
  @ValidateNested()
  @ApiProperty({
    description: 'Objeto horario con ID, hora de inicio y fin',
    type: CreateScheduleDtoWithId,
  })
  schedule: CreateScheduleDtoWithId;


  @IsEnum(DayOfWeek)
  @ApiProperty({
    enum: DayOfWeek,
    description: 'Día asignado',
    example: DayOfWeek.MONDAY,
  })
  day: DayOfWeek;

}
