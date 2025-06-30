import { ApiProperty } from "@nestjs/swagger";
import { DayOfWeek } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsDate } from "class-validator";

export class CreateScheduleDto {

  @IsArray()
  @ApiProperty({
    example: [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY],
    description: 'Array de días de la semana en los que está disponible',
  })
  days: DayOfWeek[];

  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    example: '2023-03-15T08:00:00Z',
    description: 'Hora de inicio del horario',
  })
  start: Date;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    example: '2023-03-15T09:00:00Z',
    description: 'Hora de fin del horario',
  })
  end: Date;
}