import { ApiProperty } from "@nestjs/swagger";
import { DayOfWeek } from "@prisma/client";
import { IsArray, IsDate, IsUUID } from "class-validator";

export class CreateScheduleDto {

  @IsUUID()
  @ApiProperty({
    example: 'sala123',
    description: 'Identificador único de la sala',
  })
  roomId: string;

  @IsArray()
  @ApiProperty({
    example: [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY],
    description: 'Array de días de la semana en los que está disponible',
  })
  days: DayOfWeek[];

  @IsDate()
  @ApiProperty({
    example: '2023-03-15T08:00:00Z',
    description: 'Hora de inicio del horario',
  })
  start: Date;

  @IsDate()
  @ApiProperty({
    example: '2023-03-15T09:00:00Z',
    description: 'Hora de fin del horario',
  })
  end: Date;
}
