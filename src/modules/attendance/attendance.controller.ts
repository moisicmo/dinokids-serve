import { Controller, Post, Body } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { checkAbilities, CurrentUser } from '@/decorator';
import type { JwtPayload } from '@/modules/auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/subjects';
import { TypeAction } from '@/generated/prisma/enums';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.attendance })
  create(@CurrentUser() user: JwtPayload, @Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(user.email, createAttendanceDto);
  }

}
