import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService],
  imports: [PrismaModule],

})
export class AttendanceModule { }
