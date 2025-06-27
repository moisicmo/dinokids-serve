import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsDate, IsUUID, ValidateNested } from "class-validator";
import { CreateAssignmentScheduleDto } from "./create-assignment-schedule.dto copy";


export class CreateAssignmentRoomDto {

  @IsUUID()
  @ApiProperty({
    example: 'room123',
    description: 'Identificador único del room',
  })
  roomId: string;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    example: '2000-01-01',
    description: 'Fecha de inicio de clases en el room',
  })
  start: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssignmentScheduleDto)
  @ApiProperty({
    type: [CreateAssignmentScheduleDto],
    description: 'Lista de días asignados',
  })
  assignmentSchedules: CreateAssignmentScheduleDto[]

}
