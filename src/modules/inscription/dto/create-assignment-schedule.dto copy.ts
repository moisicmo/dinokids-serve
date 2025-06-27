import { ApiProperty } from "@nestjs/swagger";
import { DayOfWeek } from "@prisma/client";
import { IsEnum, IsUUID } from "class-validator";


export class CreateAssignmentScheduleDto {

  @IsUUID()
  @ApiProperty({
    example: 'schedule123',
    description: 'Identificador único del horario',
  })
  scheduleId: string;


  @IsEnum(DayOfWeek)
  @ApiProperty({
    enum: DayOfWeek,
    description: 'Día asignado',
    example: DayOfWeek.MONDAY,
  })
  day: DayOfWeek;

}
