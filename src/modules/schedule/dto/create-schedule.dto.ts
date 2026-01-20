import { ApiProperty } from "@nestjs/swagger";
import { DayOfWeek } from "@/generated/prisma/client";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNumber } from "class-validator";

export class CreateScheduleDto {

  @IsEnum(DayOfWeek)
  @ApiProperty({
    example: DayOfWeek.MONDAY,
    description: 'Array de días de la semana en los que está disponible',
    enum: DayOfWeek,
  })
  day: DayOfWeek;

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

  @IsNumber()
  @ApiProperty({
    example: 30,
    description: 'Capacidad máxima',
  })
  capacity: number;
}