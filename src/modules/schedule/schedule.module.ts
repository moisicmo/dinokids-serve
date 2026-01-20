import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { PrismaModule } from '@/prisma/prisma.module';
@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService],
  imports: [PrismaModule],
  exports: [ScheduleService],
})
export class ScheduleModule { }
