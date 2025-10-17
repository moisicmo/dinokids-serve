import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { AbilitiesGuard } from '@/guard/abilities.guard';
import { checkAbilities, CurrentUser } from '@/decorator';
import { TypeAction, TypeSubject } from '@prisma/client';
import { JwtPayload } from '@/modules/auth/entities/jwt-payload.interface';

@UseGuards(AbilitiesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.attendance })
  create(@CurrentUser() user: JwtPayload, @Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(user.id, createAttendanceDto);
  }

}
